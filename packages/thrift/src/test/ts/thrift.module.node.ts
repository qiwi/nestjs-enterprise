import {
  INJECT_THRIFT_SERVICE,
  InjectThriftService,
  ThriftClientProvider,
  ThriftModule,
  ThriftServer,
  thriftServiceFactory,
} from '../../main/ts'
import { describe, it } from 'node:test'
import { notEqual } from 'node:assert'

describe('thrift.module', () => {
  it('exports', () => {
    const cases = [
      ThriftModule,
      ThriftServer,
      ThriftClientProvider,
      INJECT_THRIFT_SERVICE,
      InjectThriftService,
      thriftServiceFactory,
    ]
    for (const dep of cases) {
      notEqual(dep, undefined)
    }
  })
})
