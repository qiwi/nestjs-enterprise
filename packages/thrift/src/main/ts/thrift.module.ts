import { Global, Module } from '@nestjs/common'

import { ThriftClientService } from './thrift-client.service'

@Global()
@Module({
  providers: [
    { provide: 'IThriftClientService', useClass: ThriftClientService },
  ],
  exports: ['IThriftClientService'],
})
export class ThriftModule {}
