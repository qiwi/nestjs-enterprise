import { Inject, Injectable } from '@nestjs/common'
import lo from 'lodash'

import type {
  IConnectionParams,
  IDiscoverable,
  IServiceDeclaration,
} from './interfaces'
import { DiscoveryType } from './interfaces'

import { DiscoveryType } from './interfaces'

export interface IConnectionProvider {
  /**
   * Get connection params from serviceProfile
   *
   * @param serviceProfile
   */
  getConnectionParams(
    serviceProfile: IServiceDeclaration,
  ): Promise<IConnectionParams | undefined>
}

@Injectable()
export class ConnectionProviderService implements IConnectionProvider {
  constructor(
    @Inject('IConsul')
    private consul: IDiscoverable,
  ) {}

  async getConnectionParams(serviceProfile: IServiceDeclaration) {
    const discovery = serviceProfile.discovery

    if (discovery.type === DiscoveryType.CONSUL) {
      return this.consul.getConnectionParams(discovery.serviceName)
    }

    if (discovery.type === DiscoveryType.ENDPOINT) {
      return lo.sample(discovery.endpoints)
    }

    throw new Error('Invalid serviceProfile')
  }
}
