import { DynamicModule, Global, Module } from '@nestjs/common'

import { ConfigService } from './config.service'

@Global()
@Module({
  controllers: [],
  providers: [{ provide: 'IConfigService', useClass: ConfigService }],
  exports: ['IConfigService'],
})
export class ConfigModule {
  static register(options: { path: string }): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'IConfigService',
          useFactory: () => new ConfigService(options.path),
        },
      ],
      exports: ['IConfigService'],
    }
  }
}
