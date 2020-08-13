import { Controller, Get, Inject } from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import resolveCwd from 'resolve-cwd'
import { ILogger } from '@qiwi/substrate'

@Controller('/svc-info')
export class SvcInfoController {
  constructor(@Inject('ILogger') private logger: ILogger) {}

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

  @Get('build-info')
  @ApiExcludeEndpoint()
  buildInfo() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    try {
      return require(resolveCwd('./build-info.json'))
    } catch (e) {
      this.logger.warn(
        'required build-info.json is malformed or unreachable',
        e,
      )
      return 'required build-info.json is malformed or unreachable'
    }
  }
}
