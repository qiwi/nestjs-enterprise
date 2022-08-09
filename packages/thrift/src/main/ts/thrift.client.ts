import { Inject, Injectable } from '@nestjs/common'
import { IConfig, ILogger } from '@qiwi/substrate'
import genericPool from 'generic-pool'
import { factory as promiseFactory } from 'inside-out-promise'
import * as thrift from 'thrift'

import {
  IConnectionParams,
  IConnectionProvider,
  IServiceDeclaration,
  IThriftClientProvider,
  IThriftServiceProfile,
} from './interfaces'

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

  getClient<TClient>(
    serviceProfile: IThriftServiceProfile | string,
    clientConstructor: thrift.TClientConstructor<TClient>,
    opts?: {
      multiplexer: boolean
      connectionOpts?: { transport: any; protocol: any }
    },
  ): TClient {
    const getConnectionParams = this.getConnectionParams.bind(this)
    const { multiplexer, connectionOpts } = opts || { multiplexer: true }
    const profile = this.getServiceProfile(serviceProfile)
    const info = this.log.info.bind(this.log)
    const pools = this.pools

    const proxy: any = new Proxy(
      {},
      {
        get(_target, propKey) {
          if (propKey === 'then') {
            return proxy
          }
          return async (...args: any[]) => {

            if(!pools[clientConstructor as any]) {
              pools[clientConstructor as any] = genericPool.createPool({
                create: async function () {
                  const { host, port } = await getConnectionParams(profile)
                  info(
                      `Service: ${profile.thriftServiceName}, thrift connection params= ${host} ${port}`,
                  )

                  const connection = thrift
                      .createConnection(
                          host,
                          port,
                          connectionOpts || {
                            transport: thrift.TFramedTransport,
                            protocol: thrift.TCompactProtocol,
                          },
                      )
                      // TODO: remove ts-ignore after fix this
                      // @ts-ignore
                      // .on('error', reject.bind(promise))

                  const client = !multiplexer
                      ? thrift.createClient(clientConstructor, connection)
                      : new thrift.Multiplexer().createClient(
                          profile.thriftServiceName,
                          clientConstructor,
                          connection,
                      )
                  return { client, connection }
                },
                destroy: async function({connection}) {
                  connection.end()
                }
              })
            }

            const { promise, reject } = promiseFactory()
            const currentPool = pools[clientConstructor as any]
            const resource = await currentPool.acquire()

            return resource.client[propKey](...args)
                .catch((e: unknown) => {
                  // TODO: add logger or monad or exception filter
                  reject.call(promise, e)
                })
                .finally(()=>{
                  currentPool.release(resource)
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
