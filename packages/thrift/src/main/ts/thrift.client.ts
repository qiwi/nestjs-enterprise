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
    this.pools = {}
  }

  pools: any

  async getConnectionParams(
    serviceProfile: IServiceDeclaration,
  ): Promise<IConnectionParams> {
    return this.connectionProvider.getConnectionParams(serviceProfile)
  }

  getServiceProfile(ref: IThriftServiceProfile | string) {
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
          `ThriftClientProvider connection ${event} host=${host} port=${port} error=${err}`,
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

  getClient<TClient>(
    serviceProfile: IThriftServiceProfile | string,
    clientConstructor: thrift.TClientConstructor<TClient>,
    opts: {
      multiplexer?: boolean
      connectionOpts?: { transport: any; protocol: any }
    } = {},
  ): TClient {
    const info = this.log.info.bind(this.log)
    const debug = this.log.debug.bind(this.log)
    const error = this.log.error.bind(this.log)

    const {
      multiplexer = true,
      connectionOpts = {
        transport: thrift.TFramedTransport,
        protocol: thrift.TCompactProtocol,
      },
    } = opts
    const profile = this.getServiceProfile(serviceProfile)
    const pools = this.pools
    const poolOpts: TPoolOpts = this.config.get('thriftPool')

    const createConnection = this.createConnection.bind(this)

    const proxy: any = new Proxy(
      {},
      {
        get(_target, propKey) {
          if (propKey === 'then') {
            return proxy
          }
          return async (...args: any[]) => {
            if (!pools[clientConstructor as any]) {
              pools[clientConstructor as any] = genericPool.createPool(
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

                      return { client, connection }
                    } catch (e) {
                      error(
                        `ThriftClientProvider createClient error: err=${e} thriftServiceName=${profile.thriftServiceName} `,
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
            }

            const currentPool = pools[clientConstructor as any]
            const resource = await currentPool.acquire()

            debug(
              `Pool ${profile.thriftServiceName} status: current pool size=${currentPool.size} available clients=${currentPool.available} borrowed=${currentPool.borrowed} queue=${currentPool.pending} spareResourceCapacity=${currentPool.spareResourceCapacity}`,
            )

            return resource.client[propKey](...args)
              .then((res: any) => {
                currentPool.release(resource)
                return res
              })
              .catch((e: unknown) => {
                error(
                  `ThriftClientProvider error: method=${
                    propKey as string
                  } error=${e}`,
                )
                currentPool.destroy(resource)
              })
          }
        },
      },
    )
    return proxy as TClient
  }
}

// Legacy
export const ThriftClientService = ThriftClientProvider
export interface IThriftClientService extends IThriftClientProvider {} // eslint-disable-line
