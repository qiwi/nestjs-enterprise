import { DynamicModule, Global, Module } from '@nestjs/common'

import { ConfigService } from './config.service'

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: 'IConfigService',
      useFactory: async (options: Record<any, any> = {}) => {
        const service = new ConfigService(options.path || options.config)
        await service.ready
        return service
      },
    },
  ],
  exports: ['IConfigService'],
})
export class ConfigModule {
  static register(
    options: { path?: string; config?: Record<any, any> } = {},
  ): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'IConfigService',
          useFactory: async () => {
            const service = new ConfigService(options.path || options.config)
            await service.ready
            return service
          },
        },
      ],
      exports: ['IConfigService'],
    }
  }
}
