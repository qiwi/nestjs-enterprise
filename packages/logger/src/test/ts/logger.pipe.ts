import { jest } from '@jest/globals'
import { ILogEntry } from '@qiwi/logwrap'
import { ILogger } from '@qiwi/substrate'

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
  it('is defined', () => expect(createLoggerPipe).toBeDefined())

  it('creates pipe', () => {
    const pipe = createLoggerPipe(createWinstonLogger(loggerConfig))
    expect(typeof pipe).toBe('function')
  })

  it('pipe calls log and ', () => {
    const log = jest.fn()
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
    expect(pipe(inputEntry)).toEqual(inputEntry)
    expect(log).toHaveBeenCalledWith({
      level: inputEntry.level,
      message: input.join(' '),
      meta: inputEntry.meta,
    })
  })
})
