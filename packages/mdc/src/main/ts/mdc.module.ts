import { Global, Module } from '@nestjs/common'

import { MdcService } from './mdc.service'

@Global()
@Module({
  controllers: [],
  providers: [{ provide: 'IMdc', useClass: MdcService }],
  exports: ['IMdc'],
})
export class MdcModule {}
