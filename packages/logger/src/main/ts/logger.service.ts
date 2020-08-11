import * as os from 'os'
import {
  Inject,
  Injectable,
  LoggerService as LoggerServiceNest,
} from '@nestjs/common'
import createWinstonLogger from './winston'
import { ILogger, IConfig, LogLevel } from '@qiwi/substrate'
import { Logwrap, mdc, ILogEntry } from '@qiwi/logwrap'
// @ts-ignore
import { DEFAULT_NS } from '@qiwi/mware-context'

@Injectable()
export class LoggerService extends Logwrap
  implements ILogger, LoggerServiceNest {
  constructor(
    @Inject('ILoggerPipeline') pipeline: any[],
    @Inject('IConfigService') config: IConfig,
  ) {
    const host = os.hostname()
    const name = config.get('name')
    const version = config.get('version')
    const loggerConfig = config.get('logger')
    const winstonLogger = createWinstonLogger(loggerConfig)

    // todo: в pipe
    const appInfo = (entry: ILogEntry) => {
      Object.assign(entry.meta, {
        name,
        version,
        host,
      })
      return entry
    }

    const logger = (entry: ILogEntry) => {
      const { input, meta, level } = entry
      winstonLogger.log({
        level,
        message: input.join(' '),
        meta,
      })

      return entry
    }

    super({
      level: loggerConfig.level,
      pipeline: [mdc({ ns: DEFAULT_NS }), appInfo, ...pipeline, logger],
    })

    this.log = (...args): void => {
      return this.info(...args)
    }

    this.push = (entry: {
      meta: Record<string, any>
      level: LogLevel
      input: any[]
    }) => {
      // @ts-ignore
      LoggerService.perform(this.level, this.pipeline, entry)
    }
  }

  verbose(...args: any[]): void {
    return this.debug(...args)
  }
}
