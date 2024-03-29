export type IConnectionParams = {
  host: string
  port: number
}

export interface IDiscoverable {
  /**
   * Get connection params by service name.
   *
   * @param serviceName
   * @return Host and port to connection
   */
  getConnectionParams(
    serviceName: string,
  ): Promise<IConnectionParams | undefined>
}

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

export interface IDbServiceProfile extends IServiceProfile {
  type: TServiceType.DB
  discovery: IEndpointDiscovery
  creds: IUsernameAndPasswordCreds
  [key: string]: any
}

export type IServiceDeclaration = IThriftServiceProfile | IDbServiceProfile
