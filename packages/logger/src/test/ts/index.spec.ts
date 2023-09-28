import { deepEqual, equal, match, notEqual } from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { after, describe, it, mock } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { ILogger, LogLevel } from '@qiwi/substrate'

import { Inject, Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { temporaryFile } from 'tempy'

import {
  createMetaPipe,
  LoggerModule,
  LoggerService,
  masker,
  maskerLoggerPipeFactory,
} from '../../main/ts'
import { createLoggerPipe } from '../../main/ts/logger.pipe'
import { createTransports } from '../../main/ts/winston'

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

const getLogDirAndPath = () => {
  const file = temporaryFile()
  fs.writeFileSync(file, '')

  return {
    dir: path.dirname(file),
    path: file,
  }
}

const fakeConfigFactory = (
  data: Record<'name' | 'logger' | 'version' | 'local', any>,
) => ({
  get: (field: keyof typeof data) => {
    return data[field]
  },
})

const configData = {
  // eslint-disable-next-line sonarjs/no-duplicate-string
  name: 'test-name-app2',
  local: '',
  version: '1',
  logger: {
    level: 'debug',
    maxsize: 157_286_400,
    datePattern: 'YYYY-MM-DD',
    appFilename: 'testlog.log',
    maxFiles: 10,
    tailable: true,
    zippedArchive: true,
  },
}

describe('logger', () => {
  const watcherAbortController = new AbortController()
  const watchForFileChange = (path: string) => {
    return new Promise<void>((resolve) => {
      fs.watch(path, { signal: watcherAbortController.signal }, (event) => {
        if (event === 'change') {
          resolve()
        }
      })
    })
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

  after(() => {
    watcherAbortController.abort()
  })

  describe('logger module', () => {
    it('work as static module', async () => {
      const { dir, path } = getLogDirAndPath()
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
        .useValue(
          fakeConfigFactory({
            ...configData,
            logger: {
              ...configData.logger,
              appJsonFilename: path,
              dir,
            },
          }),
        )
        .compile()
      const watchPromise = watchForFileChange(path)
      await module.get(TestService).testlog()
      console.log('******', await watchPromise)

      const res = fs.readFileSync(path)
      match(res.toString(), /testinfo-foo-static/)
    })

    it('work as dynamic module', async () => {
      const { dir, path } = getLogDirAndPath()

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
        .useValue(
          fakeConfigFactory({
            ...configData,
            logger: {
              ...configData.logger,
              appJsonFilename: path,
              dir,
            },
          }),
        )
        .compile()

      const watchPromise = watchForFileChange(path)
      module.get(TestService).testlog()
      console.log('******', await watchPromise)
      const res = fs.readFileSync(path)
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
        .useValue(fakeConfigFactory(configData))
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
      const { dir, path } = getLogDirAndPath()
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
        .useValue(
          fakeConfigFactory({
            ...configData,
            logger: {
              ...configData.logger,
              appJsonFilename: path,
              dir,
            },
          }),
        )
        .compile()

      const watchPromise = watchForFileChange(path)
      module.get(TestService).testlog()
      console.log('******', await watchPromise)
      const res = fs.readFileSync(path)
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
