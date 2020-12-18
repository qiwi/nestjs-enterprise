import { Global, Module } from '@nestjs/common'
import { ConsulDiscoveryService } from '@qiwi/consul-service-discovery'
import { IConfig, ILogger } from '@qiwi/substrate'

import { ConsulService } from './consul.service'

@Global()
@Module({
  providers: [
    {
      provide: 'IDiscoveryService',
      useFactory: (config: IConfig, logger: ILogger) => {
        const consulPort = config.get('consul.port')
        const consulHost = config.get('consul.host')
        return new ConsulDiscoveryService(
          {
            host: consulHost,
            port: consulPort,
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
