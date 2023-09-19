import { ILogEntry } from '@qiwi/logwrap'
import { ILogger } from '@qiwi/substrate'

export const createLoggerPipe =
  (logger: ILogger) =>
  (entry: ILogEntry): ILogEntry => {
    const { input, meta, level } = entry
    logger.log({
      level,
      message: input.join(' '),
      meta,
    })

    return entry
  }
