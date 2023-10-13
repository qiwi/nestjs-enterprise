import { DynamicModule, Global, Module } from '@nestjs/common'

import { configServiceFactory } from './config.service'

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: 'IConfigService',
      useFactory: configServiceFactory,
    },
  ],
  exports: ['IConfigService'],
})
export class ConfigModule {
  static register(
    options: {
      path?: string
      config?: Record<any, any>
      schemaPath?: string
    } = {},
  ): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'IConfigService',
          useFactory: () => configServiceFactory(options),
        },
      ],
      exports: ['IConfigService'],
    }
  }
}
