import { Module, Global, DynamicModule } from '@nestjs/common'
import { SvcInfoController } from './svc-info.controller'
import { ISvcInfoModuleOpts } from './interfaces'

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
          useValue: opts
        },
      ]
    }
  }
}
