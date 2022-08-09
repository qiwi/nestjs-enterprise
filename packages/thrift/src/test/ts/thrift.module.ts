import {
  INJECT_THRIFT_SERVICE,
  InjectThriftService,
  ThriftClientProvider,
  ThriftModule,
  ThriftServer,
  thriftServiceFactory,
} from '../../main/ts'

describe('thrift.module', () => {
  const getName = (v: any) => String(v?.name || v)
  const cases = [
    ThriftModule,
    ThriftServer,
    ThriftClientProvider,
    INJECT_THRIFT_SERVICE,
    InjectThriftService,
    thriftServiceFactory,
  ]

  cases.forEach((dep) => {
    it(`${getName(dep)} is exported`, () => {
      expect(dep).toBeDefined()
    })
  })
})
