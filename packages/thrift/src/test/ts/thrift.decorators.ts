import { Global, Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { ConnectionProviderModule } from '@qiwi/nestjs-enterprise-connection-provider'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger'

import path from 'path'
// @ts-ignore
import * as thrift from 'thrift'

import {
  ThriftModule,
  InjectThriftService,
} from '../../main/ts'
// @ts-ignore
import { FakeConsulDiscovery9090 } from './mock/fakeConsulDiscovery9090'
// @ts-ignore
import Client from './mock/gen-nodejs/Calculator'
// @ts-ignore
import server from './mock/server'

const testConfigPath = path.resolve(__dirname, './config/test.json')


describe('thrift', () => {
  beforeAll(() => {
    server.listen(9090)
  })

  afterAll(() => {
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
        @InjectThriftService(Client, 'services.common-auth', connOpts) public foo: Client,
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

      expect(await testService.foo.add(1, 2)).toBe(3)
      expect(await testService.foo.add(10, -10)).toBe(0)
    })
  })
})
