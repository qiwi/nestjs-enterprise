import { Controller, Get, Inject, Optional } from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { ILogger } from '@qiwi/substrate'
import { promises } from 'node:fs'
import { createRequire } from 'node:module'
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
  async version() {
    const { version, name } =
      this.opts.package ||
      JSON.parse(
        await promises.readFile(
          resolveCwd(this.opts.packagePath || './package.json'),
          'utf-8',
        ),
      )
    return { version, name }
  }

  @Get('buildstamp')
  @ApiExcludeEndpoint()
  buildInfo() {
    const path = this.opts.path || './buildstamp.json'
    try {
      return createRequire(import.meta.url)(resolveCwd(path))
    } catch (e) {
      const message = `required buildstamp on path ${path} is malformed or unreachable`
      this.logger.warn(message, e)
      return message
    }
  }
}
