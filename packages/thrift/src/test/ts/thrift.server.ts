import { Global, Inject, Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { ConnectionProviderModule } from '@qiwi/nestjs-enterprise-connection-provider'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger'
import { IConfig } from '@qiwi/substrate'
import path from 'path'
import * as thrift from 'thrift'

import {
  IThriftClientProvider,
  IThriftServiceProfile,
  ThriftModule,
  ThriftServer,
} from '../../main/ts'
// @ts-ignore
import { FakeConsulDiscovery9091 } from './mock/fakeConsulDiscovery9091'
// @ts-ignore
import Calculator from './mock/gen-nodejs/Calculator.cjs'
// @ts-ignore
import { SharedStruct } from './mock/gen-nodejs/shared_types.cjs'
// @ts-ignore
import ttypes from './mock/gen-nodejs/tutorial_types.cjs'
import {fileURLToPath} from "url";

const testConfigPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'config', 'test.json')

describe('thrift-server', () => {
  @Global()
  @Module({
    providers: [
      {
        provide: 'IConsul',
        useValue: {
          getConnectionParams: () =>
            new FakeConsulDiscovery9091().getConnectionParams(''),
        },
      },
    ],
    exports: ['IConsul'],
  })
  class GlobalModule {}

  @Injectable()
  class TestService {
    client?: Calculator

    constructor(
      @Inject('IConfigService') private config: IConfig,
      @Inject('IThriftClientService')
      private thrift: IThriftClientProvider,
    ) {}

    getClient() {
      const serviceProfile: IThriftServiceProfile = this.config.get(
        'services.common-auth',
      )
      const connOpts = {
        multiplexer: false,
        connectionOpts: {
          transport: thrift.TBufferedTransport,
          protocol: thrift.TBinaryProtocol,
        },
      }
      this.client = this.thrift.getClient(serviceProfile, Calculator, connOpts)
      return this.client
    }
  }

  it('works correctly', async () => {
    const clientModule = await Test.createTestingModule({
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
      .useFactory({ factory: () => new FakeConsulDiscovery9091() })
      .overrideProvider('ILogger')
      .useValue(console)
      .compile()

    const thriftClient = clientModule.get(TestService).getClient()

    const data = {}

    @ThriftServer(Calculator, 9091)
    class TestServer {
      ping(result: () => void) {
        result()
      }

      add(n1: any, n2: any, result: (arg0: null, arg1: any) => void) {
        // @ts-ignore
        result(null, n1 + n2)
      }

      calculate(
        logid: string | number,
        work: { op: any; num1: number; num2: number },
        result: (arg0: null, arg1: number | undefined) => void,
      ) {
        let val = 0
        // eslint-disable-next-line eqeqeq
        if (work.op == ttypes.Operation.ADD) {
          val = work.num1 + work.num2
        } else if (work.op === ttypes.Operation.SUBTRACT) {
          val = work.num1 - work.num2
        } else if (work.op === ttypes.Operation.MULTIPLY) {
          val = work.num1 * work.num2
        } else if (work.op === ttypes.Operation.DIVIDE) {
          if (work.num2 === 0) {
            const x = new ttypes.InvalidOperation()
            x.whatOp = work.op
            x.why = 'Cannot divide by 0'
            // @ts-ignore
            result(x)
            return
          }
          val = work.num1 / work.num2
        } else {
          const x = new ttypes.InvalidOperation()
          x.whatOp = work.op
          x.why = 'Invalid operation'
          // @ts-ignore
          result(x)
          return
        }

        const entry = new SharedStruct()
        entry.key = logid
        entry.value = '' + val
        // @ts-ignore eslint-disable-next-line no-undef
        data[logid] = entry
        result(null, val)
      }

      // @ts-ignore
      getStruct(key, result) {
        // @ts-ignore
        result(null, data[key])
      }
    }

    const serverModule = await Test.createTestingModule({
      providers: [TestServer],
    }).compile()

    expect(await thriftClient.add(1, 2)).toBe(3)
    expect(await thriftClient.add(10, -10)).toBe(0)

    // @ts-ignore
    serverModule.get(TestServer)._server.close()
  })
})
