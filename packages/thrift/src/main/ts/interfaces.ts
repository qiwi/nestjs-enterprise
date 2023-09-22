import type { IThriftServiceProfile } from '@qiwi/nestjs-enterprise-connection-provider'

import * as thrift from 'thrift'
import { Pool } from 'generic-pool'
import { TProtocol, TTransport } from 'thrift'

export type {
  IServiceDeclaration,
  IConnectionProvider,
  IThriftServiceProfile,
  IConnectionParams,
} from '@qiwi/nestjs-enterprise-connection-provider'
export type { IConsulService } from '@qiwi/nestjs-enterprise-consul'

export interface IThriftConnectionOpts {
  multiplexer?: boolean
  connectionOpts?: { transport: any; protocol: any }
}

export interface IThriftClientProvider {
  /**
   * Get thrift client from pool or create new client
   *
   * @param serviceProfile
   * @param clientConstructor
   * @param opts
   */
  getClient<TClient>(
    serviceProfile: IThriftServiceProfile | string,
    clientConstructor: thrift.TClientConstructor<TClient>,
    opts?: IThriftConnectionOpts,
  ): TClient
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ClassType<InstanceType> extends Function {
  new (...args: any[]): InstanceType
  prototype: InstanceType
}

export type Extender = <BaseClass extends ClassType<any>>(
  base: BaseClass,
) => BaseClass

export type TPoolOpts = {
  max?: number
  min?: number
  maxWaitingClients?: number
  testOnBorrow?: boolean
  testOnReturn?: boolean
  acquireTimeoutMillis?: number
  fifo?: boolean
  priorityRange?: number
  autostart?: boolean
  evictionRunIntervalMillis?: number
  numTestsPerEvictionRun?: number
  softIdleTimeoutMillis?: number
  idleTimeoutMillis?: number
}

export type TThriftPoolResource<TClient> = {
  connection: thrift.Connection
  client: TClient
  profile: IThriftServiceProfile
}
export type TThriftPool<TClient> = Pool<TThriftPoolResource<TClient>>

export type TThriftOpts = {
  multiplexer?: boolean
  connectionOpts?: {
    transport: TTransport
    protocol: TProtocol
  }
}
