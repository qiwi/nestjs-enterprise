import { Global, Module } from '@nestjs/common'

import { ThriftClientProvider } from './thrift.client'
import { DECORATOR_TOKEN, thriftServiceFactory } from './thrift.decorators'

@Global()
@Module({
  providers: [
    { provide: 'IThriftClientProvider', useClass: ThriftClientProvider },
    { provide: 'IThriftClientService', useExisting: 'IThriftClientProvider' }, // Legacy
    {
      provide: DECORATOR_TOKEN,
      useFactory: thriftServiceFactory,
      inject: ['IThriftClientProvider'],
    },
  ],
  exports: ['IThriftClientService', 'IThriftClientProvider', DECORATOR_TOKEN],
})
export class ThriftModule {}
