import { Inject, Injectable } from '@nestjs/common'
import { IConfig, ILogger } from '@qiwi/substrate'
import genericPool from 'generic-pool'
import * as thrift from 'thrift'

import {
  IConnectionParams,
  IConnectionProvider,
  IServiceDeclaration,
  IThriftClientProvider,
  IThriftServiceProfile,
  TPoolOpts,
  TThriftOpts,
  TThriftPool,
} from './interfaces'

const defaultPoolOpts = {
  min: 0,
  max: 10,
  idleTimeoutMillis: 30000,
}

@Injectable()
export class ThriftClientProvider implements IThriftClientProvider {
  constructor(
    @Inject('ILogger') private log: ILogger,
    @Inject('IConnectionProvider')
    private connectionProvider: IConnectionProvider,
    @Inject('IConfigService') private config: IConfig,
  ) {
    this.pools = new Map()
    this.proxies = new Map()
  }

  private proxies: Map<thrift.TClientConstructor<any>, any>

  pools: Map<thrift.TClientConstructor<any>, TThriftPool<any>>

  async getConnectionParams(
    serviceProfile: IServiceDeclaration,
  ): Promise<IConnectionParams> {
    return this.connectionProvider.getConnectionParams(serviceProfile)
  }

  getServiceProfile(ref: IThriftServiceProfile | string): IThriftServiceProfile {
    return typeof ref === 'string'
      ? (this.config.get(ref) as IThriftServiceProfile)
      : ref
  }

  async createConnection(
    serviceProfile: IThriftServiceProfile | string,
    connectionOpts?: { transport: any; protocol: any },
  ): Promise<thrift.Connection> {
    const profile = this.getServiceProfile(serviceProfile)
    const { host, port } = await this.getConnectionParams(profile)
    const listenEvent = (event: string, connection: thrift.Connection) => {
      connection.on(event, (err) => {
        // @ts-ignore
        connection._invalid = true
        ;(err ? this.log.error : this.log.info)(
          `ThriftClientProvider connection ${event} host=${host} port=${port} error=${err} stack=${err?.stack}`,
        )
      })
    }

    this.log.info(
      `Service: ${profile.thriftServiceName}, thrift connection params= ${host} ${port}`,
    )

    const connection = thrift.createConnection(host, port, connectionOpts)

    listenEvent('error', connection)
    listenEvent('timeout', connection)
    listenEvent('close', connection)

    return connection
  }

  getPool<TClient>(
    serviceProfile: IThriftServiceProfile | string,
    clientConstructor: thrift.TClientConstructor<TClient>,
    opts: TThriftOpts
  ): TThriftPool<TClient> {
    if (this.pools.has(clientConstructor)) {
      return this.pools.get(clientConstructor) as TThriftPool<TClient>
    }

    const createConnection = this.createConnection.bind(this)
    const info = this.log.info.bind(this.log)
    const debug = this.log.debug.bind(this.log)
    const error = this.log.error.bind(this.log)
    const profile = this.getServiceProfile(serviceProfile)
    const poolOpts: TPoolOpts = this.config.get('thriftPool')
    const {
      multiplexer = true,
      connectionOpts = {
        transport: thrift.TFramedTransport,
        protocol: thrift.TCompactProtocol,
      },
    } = opts
    const pool = genericPool.createPool(
      {
        create: async function () {
          const connection = await createConnection(
              serviceProfile,
              connectionOpts,
          )

          try {
            const client = !multiplexer
              ? thrift.createClient(clientConstructor, connection)
              : new thrift.Multiplexer().createClient(
                profile.thriftServiceName,
                clientConstructor,
                connection,
              )

            debug(
                `ThriftClientProvider created new thrift client and connection for ${profile.thriftServiceName}`,
            )

            return { client, connection, profile}

          } catch (e) {
            error(
                // @ts-ignore
                `ThriftClientProvider createClient error: err=${e} thriftServiceName=${profile.thriftServiceName}  stack=${e?.stack}`,
            )
            throw new Error('ThriftClientProvider createClient error')
          }
        },
        destroy: async function ({ connection }) {
          info(
              `ThriftClientProvider destroyed connection service: ${profile.thriftServiceName}`,
          )
          connection.end()
        },
        async validate({ connection }): Promise<boolean> {
          // @ts-ignore
          return !connection._invalid
        },
      },
      { ...defaultPoolOpts, ...poolOpts },
    )

    this.pools.set(clientConstructor, pool)

    return pool
  }

  getClient<TClient>(
    serviceProfile: IThriftServiceProfile | string,
    clientConstructor: thrift.TClientConstructor<TClient>,
    thriftOpts: TThriftOpts = {},
  ): TClient {
    if (this.proxies.has(clientConstructor)) {
      return this.proxies.get(clientConstructor) as TClient
    }

    const debug = this.log.debug.bind(this.log)
    const error = this.log.error.bind(this.log)
    const pool = this.getPool<TClient>(serviceProfile, clientConstructor, thriftOpts)
    const proxy: any = new Proxy(
      {},
      {
        get(_target, propKey) {
          if (propKey === 'then') {
            return proxy
          }

          return async (...args: any[]) => {
            const resource = await pool.acquire()
            debug(
              `Pool ${resource.profile.thriftServiceName} status: current pool size=${pool.size} available clients=${pool.available} borrowed=${pool.borrowed} queue=${pool.pending} spareResourceCapacity=${pool.spareResourceCapacity}`,
            )

            return (resource.client as any)[propKey](...args)
              .then((res: any) => {
                pool.release(resource)
                return res
              })
              .catch((e: unknown) => {
                error(
                  `Thrift ${resource.profile.thriftServiceName} error: method=${
                    propKey as string
                  // @ts-ignore
                  } error=${e} stack=${e?.stack}`,
                )
                pool.destroy(resource)
                throw e
              })
          }
        },
      },
    )

    this.proxies.set(clientConstructor, proxy)
    return proxy
  }
}

// Legacy
export const ThriftClientService = ThriftClientProvider
export interface IThriftClientService extends IThriftClientProvider {} // eslint-disable-line
