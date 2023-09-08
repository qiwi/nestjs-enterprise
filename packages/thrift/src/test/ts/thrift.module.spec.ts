import { notEqual } from 'node:assert'
import { describe, it } from 'node:test'

import {
  INJECT_THRIFT_SERVICE,
  InjectThriftService,
  ThriftClientProvider,
  ThriftModule,
  ThriftServer,
  thriftServiceFactory,
} from '../../main/ts'

const getName = (v: any) => String(v?.name || v)

describe('thrift.module', () => {
  it('exports', (t) => {
    const cases = [
      ThriftModule,
      ThriftServer,
      ThriftClientProvider,
      INJECT_THRIFT_SERVICE,
      InjectThriftService,
      thriftServiceFactory,
    ]
    for (const dep of cases) {
      // t.test(`${getName(dep)} is exported`, () => {
      notEqual(dep, undefined)
      // })
    }
  })
})
