

import { Inject, Injectable } from '@nestjs/common'
import { IConfig } from '@qiwi/substrate'
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
      @Inject('IConnectionProvider')
      private connectionProvider: IConnectionProvider,
      @Inject('IConfigService') private config: IConfig,
  ) {}

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

  async getClient<TClient>(
      serviceProfile: IThriftServiceProfile | string,
      clientConstructor: thrift.TClientConstructor<TClient>,
      opts?: {
        multiplexer: boolean
        connectionOpts?: { transport: any; protocol: any }
      },
  ): Promise<TClient> {
    const getConnectionParams = this.getConnectionParams.bind(this)
    const { multiplexer, connectionOpts } = opts || { multiplexer: true }
    const profile = this.getServiceProfile(serviceProfile)
    const { host, port } = await getConnectionParams(profile)
    const connection = thrift
        .createConnection(
            host,
            port,
            connectionOpts || {
              transport: thrift.TFramedTransport,
              protocol: thrift.TCompactProtocol,
            },
        )
    return !multiplexer
        ? thrift.createClient(clientConstructor, connection)
        : new thrift.Multiplexer().createClient(
            profile.thriftServiceName,
            clientConstructor,
            connection,
        )
  }
}

// Legacy
export const ThriftClientService = ThriftClientProvider
export interface IThriftClientService extends IThriftClientProvider {} // eslint-disable-line
