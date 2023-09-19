import { ConnectionProviderService } from '../../main/ts'
import { DiscoveryType, TServiceType } from '../../main/ts/interfaces'

describe('connection-provider', () => {
  describe('simple provider', () => {
    const service = new ConnectionProviderService({
      getConnectionParams: async () => ({ host: 'host', port: 1000 }),
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
      ).toMatchObject({ host: 'host', port: 1000 })
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
