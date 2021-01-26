import { ConnectionProviderService } from '../../main/ts/index'
import { DiscoveryType, TServiceType } from '../../main/ts/interfaces'

describe('connection-provider', () => {
  describe('simple provider', () => {
    const service = new ConnectionProviderService({
      // @ts-ignore
      getConnectionParams: () => 'consul',
    })

    it('returns endpoints with service name', async () => {
      expect(
        await service.getConnectionParams({
          type: TServiceType.THRIFT,
          thriftServiceName: 'name',
          discovery: {
            type: DiscoveryType.CONSUL,
            serviceName: 'serviceName',
          },
        }),
      ).toBe('consul')
    })

    it('returns endpoints with endpoints', async () => {
      expect(
        await service.getConnectionParams({
          type: TServiceType.THRIFT,
          thriftServiceName: 'name',
          discovery: {
            type: DiscoveryType.ENDPOINT,
            endpoints: [{ host: '10', port: 20 }],
          },
        }),
      ).toMatchObject({ host: '10', port: 20 })
    })
  })
})
