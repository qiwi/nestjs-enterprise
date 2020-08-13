import * as os from 'os'
import {
  Inject,
  Injectable,
  LoggerService as LoggerServiceNest,
} from '@nestjs/common'
import createWinstonLogger from './winston'
import { ILogger, IConfig, LogLevel } from '@qiwi/substrate'
import { Logwrap, mdc } from '@qiwi/logwrap'
// @ts-ignore
import { DEFAULT_NS } from '@qiwi/mware-context'
import { createAppPipe } from './app.pipe';
import { createLoggerPipe } from './logger.pipe';

@Injectable()
export class LoggerService extends Logwrap
  implements ILogger, LoggerServiceNest {
  // @ts-ignore
  constructor(
    @Inject('ILoggerPipeline') pipeline: any[],
    @Inject('IConfigService') config: IConfig,
  ) {
    const loggerConfig = config.get('logger')
    super({
      level: loggerConfig.level,
      pipeline: [
        mdc({ ns: DEFAULT_NS }),
        createAppPipe(config.get('name'), config.get('version'), os.hostname()),
        ...pipeline,
        createLoggerPipe(createWinstonLogger(loggerConfig))
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
