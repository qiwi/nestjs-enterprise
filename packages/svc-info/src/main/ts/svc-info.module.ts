import { DynamicModule, Global, Module } from '@nestjs/common'

import type { ISvcInfoModuleOpts } from './interfaces'
import { SvcInfoController } from './svc-info.controller'

@Global()
@Module({
  controllers: [SvcInfoController],
})
export class SvcInfoModule {
  static register(opts: ISvcInfoModuleOpts): DynamicModule {
    return {
      module: SvcInfoModule,
      controllers: [SvcInfoController],
      providers: [
        {
          provide: 'ISvcInfoModuleOpts',
          useValue: opts,
        },
      ],
    }
  }
}
