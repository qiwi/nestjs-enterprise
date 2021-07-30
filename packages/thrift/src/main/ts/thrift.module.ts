import { Global, Module } from '@nestjs/common'

import { ThriftClientService } from './thrift-client.service'
import {fooFactory} from "./thrift.decorators";

@Global()
@Module({
  providers: [
    { provide: 'IThriftClientService', useClass: ThriftClientService },
    { provide: 'Foo', useFactory: fooFactory, inject: ['IThriftClientService'] }
  ],
  exports: ['IThriftClientService', 'Foo'],
})
export class ThriftModule {}
