import { Module, Global } from '@nestjs/common'
import { SvcInfoController } from './svc-info.controller'

@Global()
@Module({
  controllers: [SvcInfoController],
})
export class SvcInfoModule {}
