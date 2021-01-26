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

export interface IThriftClientService {
  getClient<TClient>(
    serviceProfile: IServiceDeclaration,
    clientConstructor: thrift.TClientConstructor<TClient>,
  ): TClient
}
