import { ConsulDiscoveryService } from '@qiwi/consul-service-discovery'
import type { IConfig, ILogger } from '@qiwi/substrate'

import { Global, Module } from '@nestjs/common'

import { ConsulService } from './consul.service'

@Global()
@Module({
  providers: [
    {
      provide: 'IDiscoveryService',
      useFactory: (config: IConfig, logger: ILogger) => {
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
