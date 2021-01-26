import { Controller, Get, Inject, Optional } from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { ILogger } from '@qiwi/substrate'
import resolveCwd from 'resolve-cwd'

import { ISvcInfoModuleOpts } from './interfaces'

@Controller('/svc-info')
export class SvcInfoController {
  constructor(
    @Inject('ILogger') private logger: ILogger,
    @Optional()
    @Inject('ISvcInfoModuleOpts')
    private opts: ISvcInfoModuleOpts = {},
  ) {}

  @Get('uptime')
  @ApiExcludeEndpoint()
  uptime() {
    const uptime = Math.floor(process.uptime())

    const minInSec = 60
    const hoursInSec = 60 * minInSec
    const dayInSec = 24 * hoursInSec

    const days = Math.floor(uptime / dayInSec)
    const restSecWithoutDays = uptime % dayInSec
    const hours = Math.floor(restSecWithoutDays / hoursInSec)
    const restSecWithoutHoursAndDays = uptime % hoursInSec
    const min = Math.floor(restSecWithoutHoursAndDays / minInSec)
    const sec = uptime % minInSec

    return `Uptime is ${days} days, ${hours} hours, ${min} mins, ${sec} secs`
  }

  @Get('version')
  @ApiExcludeEndpoint()
  version() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { version, name } = require(resolveCwd('./package.json'))
    return { version, name }
  }

  @Get('buildstamp')
  @ApiExcludeEndpoint()
  buildInfo() {
    const path = this.opts.path || './buildstamp.json'
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    try {
      return require(resolveCwd(path))
    } catch (e) {
      const message = `required buildstamp on path ${path} is malformed or unreachable`
      this.logger.warn(message, e)
      return message
    }
  }
}
