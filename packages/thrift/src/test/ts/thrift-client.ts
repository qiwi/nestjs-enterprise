import { Global, Inject, Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { ConnectionProviderModule } from '@qiwi/nestjs-enterprise-connection-provider'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger'
import { IConfig } from '@qiwi/substrate'
import path from 'path'
// @ts-ignore
import * as thrift from 'thrift'

import {
  IServiceDeclaration,
  IThriftClientService,
  ThriftClientService,
  ThriftModule,
} from '../../main/ts'
// @ts-ignore
import { FakeConsulDiscovery9090 } from './mock/fakeConsulDiscovery9090'
// @ts-ignore
import Client from './mock/gen-nodejs/Calculator'
// @ts-ignore
import server from './mock/server'

const testConfigPath = path.resolve(__dirname, './config/test.json')

// function delay(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

describe('thrift', () => {
  beforeAll(() => {
    server.listen(9090)
  })

  afterAll(() => {
    server.close()
  })
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(ThriftModule).toBeDefined()
      expect(ThriftClientService).toBeDefined()
    })
  })

  describe('thrift module', () => {
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

    @Injectable()
    class TestService {
      client?: Client

      constructor(
        @Inject('IConfigService') private config: IConfig,
        @Inject('IThriftClientService')
        private thrift: IThriftClientService,
      ) {}

      getClient() {
        const serviceProfile: IServiceDeclaration = this.config.get(
          'services.common-auth',
        )
        this.client = this.thrift.getClient(serviceProfile, Client, {
          multiplexer: false,
          connectionOpts: {
            transport: thrift.TBufferedTransport,
            protocol: thrift.TBinaryProtocol,
          },
        })
        return this.client
      }
    }

    it('exposes thrift api', async () => {
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

      const thriftClient = module.get(TestService).getClient()

      expect(await thriftClient.add(1, 2)).toBe(3)
      expect(await thriftClient.add(10, -10)).toBe(0)
    })
  })
})
