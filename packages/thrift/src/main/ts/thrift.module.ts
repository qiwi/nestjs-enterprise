import { Global, Module } from '@nestjs/common'

import { ThriftClientProvider } from './thrift.client'
import { INJECT_THRIFT_SERVICE, thriftServiceFactory } from './thrift.decorators'

@Global()
@Module({
  providers: [
    { provide: 'IThriftClientProvider', useClass: ThriftClientProvider },
    { provide: 'IThriftClientService', useExisting: 'IThriftClientProvider' }, // Legacy
    {
      provide: INJECT_THRIFT_SERVICE,
      useFactory: thriftServiceFactory,
      inject: ['IThriftClientProvider'],
    },
  ],
  exports: ['IThriftClientService', 'IThriftClientProvider', INJECT_THRIFT_SERVICE],
})
export class ThriftModule {}