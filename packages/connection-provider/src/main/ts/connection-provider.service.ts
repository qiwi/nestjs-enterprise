import { Inject, Injectable } from '@nestjs/common'
import lo from 'lodash'

import { DiscoveryType, IServiceDeclaration } from './interfaces'

export type IConnectionParams = {
  host: string
  port: number
}

interface IConnectionProvider {
  getConnectionParams: (opts: any) => Promise<IConnectionParams>
}

interface IConsulService {
  getConnectionParams: (opts: any) => Promise<IConnectionParams>
}

@Injectable()
export class ConnectionProviderService implements IConnectionProvider {
  constructor(
    @Inject('IConsul')
    private consul: IConsulService,
  ) {}

  async getConnectionParams(
    serviceProfile: IServiceDeclaration,
  ): Promise<IConnectionParams> {
    const discovery = serviceProfile.discovery

    if (discovery.type === DiscoveryType.CONSUL) {
      return this.consul.getConnectionParams(discovery.serviceName)
    }

    if (discovery.type === DiscoveryType.ENDPOINT) {
      // @ts-ignore
      return lo.sample(discovery.endpoints)
    }

    throw new Error('Invalid serviceProfile')
  }
}
