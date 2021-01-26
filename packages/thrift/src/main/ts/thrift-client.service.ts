import { Inject, Injectable } from '@nestjs/common'
import { ILogger } from '@qiwi/substrate'
import { factory as promiseFactory } from 'inside-out-promise'
// @ts-ignore
import * as thrift from 'thrift'

import {
  IConnectionParams,
  IConnectionProvider,
  IServiceDeclaration,
  IThriftClientService,
} from './interfaces'

@Injectable()
export class ThriftClientService implements IThriftClientService {
  constructor(
    @Inject('ILogger') private log: ILogger,
    @Inject('IConnectionProvider')
    private connectionProvider: IConnectionProvider,
  ) {}

  async getConnectionParams(
    serviceProfile: IServiceDeclaration,
  ): Promise<IConnectionParams> {
    return this.connectionProvider.getConnectionParams(serviceProfile)
  }

  getClient<TClient>(
    serviceProfile: IServiceDeclaration,
    clientConstructor: thrift.TClientConstructor<TClient>,
    opts?: {
      multiplexer: boolean
      connectionOpts?: { transport: any; protocol: any }
    },
  ): TClient {
    const getConnectionParams = this.getConnectionParams.bind(this)
    const { multiplexer, connectionOpts } = opts || { multiplexer: true }
    const info = this.log.info.bind(this.log)
    return new Proxy(
      {},
      {
        get(_target, propKey) {
          return async (...args: any[]) => {
            const { host, port } = await getConnectionParams(serviceProfile)

            info(
              `Service: ${serviceProfile.thriftServiceName}, thrift connection params= ${host} ${port}`,
            )
            const { promise, resolve, reject } = promiseFactory()
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
              .on('error', reject.bind(promise))

            const client = !multiplexer
              ? thrift.createClient(clientConstructor, connection)
              : new thrift.Multiplexer().createClient(
                  serviceProfile.thriftServiceName,
                  clientConstructor,
                  connection,
                )

            // @ts-ignore
            client[propKey](...args)
              .then(resolve.bind(promise))
              .catch((e: unknown) => {
                // TODO: add logger or monad or exception filter
                reject.call(promise, e)
              })
              .finally(() => connection && connection.end())

            return promise
          }
        },
      },
    ) as TClient
  }
}
