import {jest} from '@jest/globals'
import { Inject, Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { ILogger, LogLevel } from '@qiwi/substrate'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createMetaPipe,
  LoggerModule,
  LoggerService,
  masker,
  maskerLoggerPipeFactory,
} from '../../main/ts'
import { createLoggerPipe } from '../../main/ts/logger.pipe'
import { createTransports } from '../../main/ts/winston'

const testLogPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'log', 'application-json.log')
const testConfigPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'config', 'test.json')

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('logger', () => {
  jest.useRealTimers()

  const fakeConfig = {
    get: (field: 'name' | 'logger' | 'version' | 'local') => {
      const configData = {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        name: 'test-name-app2',
        local: '',
        version: '1',
        logger: {
          dir: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ts', 'log'),
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
      expect(LoggerModule).toBeDefined()
      expect(LoggerService).toBeDefined()
      expect(masker).toBeDefined()
      expect(maskerLoggerPipeFactory).toBeDefined()
      expect(createMetaPipe).toBeDefined()
    })
  })

  describe('logger module', () => {
    beforeAll(() => {
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
      expect(res.toString()).toMatch('testinfo-foo-static')
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
      expect(res.toString()).toMatch('testinfo-foo-dynamic')
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

      const log = jest.fn()

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
      expect(log).toHaveBeenCalledWith({
        level: LogLevel.INFO,
        message: '4111 **** **** 1111',
        meta: {
          event: 'metaevent',
          extra: {
            ttl: '25',
          },
          host: expect.any(String),
          name: 'test-name-app2',
          version: '1',
          publicMeta: {
            app_version: '1',
            auth: {},
            event: 'metaevent',
            host: expect.any(String),
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
      expect(res.toString()).toMatch('"message":"eventMessage"')
      expect(res.toString()).toMatch('"level":"ERROR",')
      expect(res.toString()).toMatch('"event":"metaevent"')
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

      expect(transports.length).toBe(1)
    })
  })
})
