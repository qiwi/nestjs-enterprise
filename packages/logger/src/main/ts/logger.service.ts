import * as os from 'node:os'

import { Logwrap, mdc } from '@qiwi/logwrap'
// @ts-ignore
import { DEFAULT_NS } from '@qiwi/mware-context'
import type { IConfig, ILogger } from '@qiwi/substrate'
import { LogLevel } from '@qiwi/substrate'

import {
  Inject,
  Injectable,
  LoggerService as LoggerServiceNest,
} from '@nestjs/common'

import { createAppPipe } from './app.pipe'
import type { TLoggerPipe } from './interfaces'
import { createLoggerPipe } from './logger.pipe'
import createWinstonLogger from './winston'

@Injectable()
export class LoggerService
  extends Logwrap
  implements ILogger, LoggerServiceNest
{
  // @ts-ignore
  constructor(
    @Inject('ILoggerPipeline') pipeline: TLoggerPipe[],
    @Inject('IConfigService') config: IConfig,
  ) {
    const loggerConfig = config.get('logger')
    super({
      level: loggerConfig.level,
      pipeline: [
        mdc({ ns: DEFAULT_NS }),
        createAppPipe(config.get('name'), config.get('version'), os.hostname()),
        ...pipeline,
        createLoggerPipe(createWinstonLogger(loggerConfig)),
      ],
    })
  }

  log = (...args: any[]): void => {
    return this.info(...args)
  }

  push = (entry: {
    meta: Record<string, any>
    level: LogLevel
    input: any[]
  }) => {
    // @ts-ignore
    LoggerService.perform(this.level, this.pipeline, entry)
  }

  verbose(...args: any[]): void {
    return this.debug(...args)
  }
}
