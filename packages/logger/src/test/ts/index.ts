import { Inject, Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ILogger, LogLevel } from '@qiwi/substrate-types'
import fs from 'fs'
import path from 'path'

import {
  LoggerModule,
  masker,
  createMetaPipe,
  LoggerService,
  maskerLoggerPipeFactory,
} from '../../main/ts'
import { createTransports } from '../../main/ts/winston'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'

const testLogPath = path.resolve(__dirname, './log/application-json.log')
const testConfigPath = path.resolve(__dirname, './config/test.json')

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('logger', () => {
  jest.useRealTimers()

  const fakeConfig = {
    get: (field: 'name' | 'logger' | 'version' | 'local') => {
      const configData = {
        name: 'test-name-app2',
        local: '',
        version: '1',
        logger: {
          dir: path.resolve(__dirname, '../ts/log'),
          level: 'debug',
          maxsize: 157286400,
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
          this.logger.error('4111 1111 1111 1111')
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
      expect(res.toString()).toMatch('4111 **** **** 1111')
      expect(res.toString()).toMatch('test-name-app')
      expect(res.toString()).toMatch('app_version')
      expect(res.toString()).toMatch('host')
      expect(res.toString()).toMatch('serviceName')
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
