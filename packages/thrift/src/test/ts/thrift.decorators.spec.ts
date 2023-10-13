import { equal } from 'node:assert'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { ConnectionProviderModule } from '@qiwi/nestjs-enterprise-connection-provider'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger'

// @ts-ignore
import * as thrift from 'thrift'
import { Global, Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { InjectThriftService, ThriftModule } from '../../main/ts'
// @ts-ignore
import { FakeConsulDiscovery9090 } from './mock/fakeConsulDiscovery9090'
// @ts-ignore
import Client from './mock/gen-nodejs/Calculator.cjs'
// @ts-ignore
import server from './mock/server.cjs'

const testConfigPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'config',
  'test.json',
)

describe('thrift', () => {
  before(() => {
    server.listen(9090)
  })

  after(() => {
    server.close()
  })

  describe('thrift.decorators', () => {
    @Global()
    @Module({
      providers: [
        {
          provide: 'IConsul',
          useValue: {
            getConnectionParams: () =>
              new FakeConsulDiscovery9090().getConnectionParams(''),
          },
        },
      ],
      exports: ['IConsul'],
    })
    class GlobalModule {}

    const connOpts = {
      multiplexer: false,
      connectionOpts: {
        transport: thrift.TBufferedTransport,
        protocol: thrift.TBinaryProtocol,
      },
    }

    @Injectable()
    class TestService {
      constructor(
        @InjectThriftService(Client, 'services.common-auth', connOpts)
        public foo: Client,
        @InjectThriftService(Client, 'services.common-auth', connOpts)
        public bar: Client,
      ) {}
    }

    it('thrift service is injectable', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.register({ path: testConfigPath }),
          ConnectionProviderModule,
          ThriftModule,
          LoggerModule,
          GlobalModule,
        ],
        providers: [TestService],
      })
        .overrideProvider('IDiscoveryService')
        .useFactory({ factory: () => new FakeConsulDiscovery9090() })
        .overrideProvider('ILogger')
        .useValue(console)
        .compile()

      const testService = module.get(TestService)

      equal(testService.foo, testService.bar)
      equal(await testService.foo.add(1, 2), 3)
      equal(await testService.bar.add(10, -10), 0)
      await module.get('IThriftClientService').pools.get(Client).clear()
    })
  })
})
