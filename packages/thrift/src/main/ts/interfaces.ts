// @ts-ignore
import * as thrift from 'thrift'

export const enum TServiceType {
  THRIFT = 'thrift',
  HTTP = 'http',
  DB = 'db',
}

export const enum DiscoveryType {
  CONSUL = 'consul',
  ENDPOINT = 'endpoint',
}

export type IConsulDiscovery = {
  type: DiscoveryType.CONSUL
  serviceName: string
}

export type IConnectionParams = {
  host: string
  port: number
}

export type IConnectionProvider = {
  getConnectionParams: (opts: any) => Promise<IConnectionParams>
}

export type IEndpointDiscovery = {
  type: DiscoveryType.ENDPOINT
  endpoints: Array<IConnectionParams>
}

export type TDiscovery = IConsulDiscovery | IEndpointDiscovery

export interface IServiceDiscoverable {
  discovery: TDiscovery
}

export interface IThriftServiceProfile extends IServiceDiscoverable {
  type: TServiceType.THRIFT
  thriftServiceName: string
}

export const enum CredType {
  USERANDPASSWORD = 'username-and-password',
}

export type IUsernameAndPasswordCreds = {
  type: CredType.USERANDPASSWORD
  username: string
  password: string
}

export type ICreds = IUsernameAndPasswordCreds

export interface IServiceProfile {
  type: TServiceType
  creds?: ICreds
}

export interface IConsulService {
  register(opts: any): Promise<any>
}

export interface IDbServiceProfile extends IServiceProfile {
  type: TServiceType.DB
  discovery: IEndpointDiscovery
  creds: IUsernameAndPasswordCreds
  [key: string]: any
}

export type IServiceDeclaration = IThriftServiceProfile | IDbServiceProfile

export interface IThriftConnectionOpts {
  multiplexer?: boolean
  connectionOpts?: { transport: any; protocol: any }
}

export interface IThriftClientProvider {
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
