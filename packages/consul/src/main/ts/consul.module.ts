import { Global, Module } from '@nestjs/common'
import { ConsulDiscoveryService } from '@qiwi/consul-service-discovery'
import { IConfig, ILogger } from '@qiwi/substrate'

import { ConsulService } from './consul.service'

@Global()
@Module({
  providers: [
    {
      provide: 'IDiscoveryService',
      useFactory: async (config: IConfig, logger: ILogger) => {
        await config.ready
        const port = config.get('consul.port')
        const host = config.get('consul.host')
        const secure = config.get('consul.secure')
        const ca = config.get('consul.ca')
        const defaults = config.get('consul.defaults')
        return new ConsulDiscoveryService(
          {
            host,
            port,
            secure,
            defaults,
            ca,
          },
          { logger },
        )
      },
      inject: ['IConfigService'],
    },
    { provide: 'IConsul', useClass: ConsulService },
  ],
  exports: ['IConsul'],
})
export class ConsulModule {}
