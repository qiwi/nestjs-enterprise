import { Inject, Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { ILogger, LogLevel } from '@qiwi/substrate'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, before, mock } from 'node:test'
import { equal, notEqual, deepEqual, match } from 'node:assert'

import {
  createMetaPipe,
  LoggerModule,
  LoggerService,
  masker,
  maskerLoggerPipeFactory,
} from '../../main/ts'
import { createLoggerPipe } from '../../main/ts/logger.pipe'
import { createTransports } from '../../main/ts/winston'

const testLogPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'log',
  'application-json.log',
)
const testConfigPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'config',
  'test.json',
)

const typeSymbol = Symbol('type')
const AnyString = {
  [typeSymbol]: 'string',
}

const toMatchObject = (actual: any, expected: any) => {
  for (const key of Object.keys(expected)) {
    if (!actual[key]) console.error('exist', key)
    if (typeof expected[key] === 'object') {
      if (expected[key][typeSymbol]) {
        equal(typeof actual[key], expected[key][typeSymbol])
      } else {
        toMatchObject(actual[key], expected[key])
      }
      continue
    }
    deepEqual(actual[key], expected[key])
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('logger', () => {
  const fakeConfig = {
    get: (field: 'name' | 'logger' | 'version' | 'local') => {
      const configData = {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        name: 'test-name-app2',
        local: '',
        version: '1',
        logger: {
          dir: path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '..',
            'ts',
            'log',
          ),
          level: 'debug',
          maxsize: 157_286_400,
          datePattern: 'YYYY-MM-DD',
          appJsonFilename: 'application-json.log',
          appFilename: 'testlog.log',
          maxFiles: 10,
          tailable: true,
          zippedArchive: true,
        },
      }

      return configData[field]
    },
  }

  describe('index', () => {
    it('properly exposes its inners', () => {
      notEqual(LoggerModule, undefined)
      notEqual(LoggerService, undefined)
      notEqual(masker, undefined)
      notEqual(maskerLoggerPipeFactory, undefined)
      notEqual(createMetaPipe, undefined)
    })
  })

  describe('logger module', () => {
    before(() => {
      if (fs.existsSync(testLogPath)) {
        fs.writeFileSync(testLogPath, '')
      }
    })

    it('work as static module', async () => {
      @Injectable()
      class TestService {
        constructor(@Inject('ILogger') private logger: ILogger) {}

        async testlog() {
          this.logger.error('testinfo-foo-static')
        }
      }

      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.register({ path: testConfigPath }),
          LoggerModule,
        ],
        providers: [TestService],
      })
        .overrideProvider('IConfigService')
        .useValue(fakeConfig)
        .compile()
      await module.get(TestService).testlog()
      await delay(100)
      const res = fs.readFileSync(path.resolve(testLogPath))
      match(res.toString(), /testinfo-foo-static/)
    })

    it('work as dynamic module', async () => {
      @Injectable()
      class TestService {
        constructor(@Inject('ILogger') private logger: ILogger) {}

        testlog() {
          this.logger.error('testinfo-foo-dynamic')
        }
      }

      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.register({ path: testConfigPath }),
          LoggerModule.register(),
        ],
        providers: [TestService],
      })
        .overrideProvider('IConfigService')
        .useValue(fakeConfig)
        .compile()

      module.get(TestService).testlog()
      await delay(100)
      const res = fs.readFileSync(path.resolve(testLogPath))
      match(res.toString(), /testinfo-foo-dynamic/)
      await module.close()
    })

    it('work with pipes', async () => {
      @Injectable()
      class TestService {
        constructor(@Inject('ILogger') private logger: ILogger) {}

        testlog() {
          this.logger.push({
            meta: { event: 'metaevent', extra: { ttl: '25' } },
            input: ['4111 1111 1111 1111'],
            level: LogLevel.INFO,
          })
        }
      }

      const log = mock.fn()

      const dummy = () => {
        /* noop */
      }
      const loggerMock: ILogger = {
        log,
        trace: dummy,
        debug: dummy,
        info: dummy,
        warn: dummy,
        error: dummy,
      }

      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.register({ path: testConfigPath }),
          LoggerModule.register(
            maskerLoggerPipeFactory(),
            createMetaPipe(),
            createLoggerPipe(loggerMock),
          ),
        ],
        providers: [TestService],
      })
        .overrideProvider('IConfigService')
        .useValue(fakeConfig)
        .compile()

      module.get(TestService).testlog()

      toMatchObject(log.mock.calls.at(0)?.arguments.at(0), {
        level: LogLevel.INFO,
        message: '4111 **** **** 1111',
        meta: {
          event: 'metaevent',
          extra: {
            ttl: '25',
          },
          host: AnyString,
          name: 'test-name-app2',
          version: '1',
          publicMeta: {
            app_version: '1',
            auth: {},
            event: 'metaevent',
            host: AnyString,
            mdc: {
              parentSpanId: undefined,
              spanId: undefined,
              traceId: undefined,
            },
            origin: undefined,
            serviceName: 'test-name-app2',
            ttl: '25',
          },
        },
      })
      await module.close()
    })

    it('push works correctly', async () => {
      @Injectable()
      class TestService {
        constructor(@Inject('ILogger') private logger: ILogger) {}

        testlog() {
          this.logger.push({
            meta: { event: 'metaevent' },
            input: ['eventMessage'],
            level: LogLevel.ERROR,
          })
        }
      }

      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.register({ path: testConfigPath }),
          LoggerModule.register(maskerLoggerPipeFactory(), createMetaPipe()),
        ],
        providers: [TestService],
      })
        .overrideProvider('IConfigService')
        .useValue(fakeConfig)
        .compile()

      module.get(TestService).testlog()
      await delay(100)
      const res = fs.readFileSync(path.resolve(testLogPath))
      match(res.toString(), /"message":"eventMessage"/)
      match(res.toString(), /"level":"ERROR",/)
      match(res.toString(), /"event":"metaevent"/)
      await module.close()
    })

    it('works without a path', async () => {
      // @ts-ignore
      const transports = createTransports({
        level: 'string',
        maxsize: 100,
        appJsonFilename: 'string',
        zippedArchive: true,
        tailable: true,
        maxFiles: 1,
      })

      equal(transports.length, 1)
    })
  })
})
