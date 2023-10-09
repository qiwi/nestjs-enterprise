import { equal } from 'node:assert'
import { describe, it } from 'node:test'

import lodash from 'lodash'

import { ConnectionProviderService } from '../../main/ts'
import { DiscoveryType, TServiceType } from '../../main/ts/interfaces'

const toMatchObject = (actual: any, expected: any) => {
  equal(lodash.isMatch(actual, expected), true)
}

describe('connection-provider', () => {
  describe('simple provider', () => {
    const service = new ConnectionProviderService({
      getConnectionParams: async () => ({ host: 'host', port: 1000 }),
    })

    it('returns endpoints with service name', async () => {
      toMatchObject(
        await service.getConnectionParams({
          type: TServiceType.THRIFT,
          thriftServiceName: 'name',
          discovery: {
            type: DiscoveryType.CONSUL,
            serviceName: 'serviceName',
          },
        }),
        { host: 'host', port: 1000 },
      )
    })

    it('returns endpoints with endpoints', async () => {
      toMatchObject(
        await service.getConnectionParams({
          type: TServiceType.THRIFT,
          thriftServiceName: 'name',
          discovery: {
            type: DiscoveryType.ENDPOINT,
            endpoints: [{ host: '10', port: 20 }],
          },
        }),
        { host: '10', port: 20 },
      )
    })
  })
})
