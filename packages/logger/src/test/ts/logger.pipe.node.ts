import type { ILogEntry } from '@qiwi/logwrap'
import type { ILogger } from '@qiwi/substrate'

import { describe, it, mock } from 'node:test'
import { equal, notEqual, deepEqual } from 'node:assert'

import { createLoggerPipe } from '../../main/ts/logger.pipe'
import createWinstonLogger from '../../main/ts/winston'

const loggerConfig = {
  dir: 'somepath',
  level: 'debug',
  maxsize: 157_286_400,
  datePattern: 'YYYY-MM-DD',
  appJsonFilename: 'application-json.log',
  appFilename: 'testlog.log',
  maxFiles: 10,
  tailable: true,
  zippedArchive: true,
}

const dummy = () => {
  /* noop */
}

describe('createAppPipe', () => {
  it('is defined', () => notEqual(createLoggerPipe, undefined))

  it('creates pipe', () => {
    const pipe = createLoggerPipe(createWinstonLogger(loggerConfig))
    equal(typeof pipe, 'function')
  })

  it('pipe calls log and ', () => {
    const log = mock.fn()
    const loggerMock: ILogger = {
      log,
      trace: dummy,
      debug: dummy,
      info: dummy,
      warn: dummy,
      error: dummy,
    }
    const pipe = createLoggerPipe(loggerMock)
    const input = ['foo', 'bar', 'baz']
    const inputEntry: ILogEntry = {
      level: 'info',
      input,
      meta: {},
    }
    deepEqual(pipe(inputEntry), inputEntry)
    deepEqual(log.mock.calls.at(0)?.arguments.at(0), {
      level: inputEntry.level,
      message: input.join(' '),
      meta: inputEntry.meta,
    })
  })
})
