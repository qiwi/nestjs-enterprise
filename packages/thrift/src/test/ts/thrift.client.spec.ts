import { Global, Inject, Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { ConnectionProviderModule } from '@qiwi/nestjs-enterprise-connection-provider'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger'
import { IConfig } from '@qiwi/substrate'
import path from 'node:path'
// @ts-ignore
import * as thrift from 'thrift'
import { fileURLToPath } from 'node:url'
import { describe, it, before, after } from 'node:test'
import { equal, notEqual } from 'node:assert'

import {
  IThriftClientProvider,
  IThriftServiceProfile,
  ThriftClientProvider,
  ThriftModule,
} from '../../main/ts'
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
  describe('index', () => {
    it('properly exposes its inners', () => {
      notEqual(ThriftModule, undefined)
      notEqual(ThriftClientProvider, undefined)
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
        private thrift: IThriftClientProvider,
      ) {}

      getClient() {
        const serviceProfile: IThriftServiceProfile = this.config.get(
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

      equal(await thriftClient.add(1, 2), 3)
      equal(await thriftClient.add(10, -10), 0)
      // await module.get('IThriftClientService').pools.get(Client).clear()
      await module.close()
    })
  })
})