import { applyDecorators } from '@nestjs/common'

import { GmMeteredDecorator } from './gm-metered.decorator'

export function GraphiteDecorator(metricName: string) {
  return applyDecorators(GmMeteredDecorator(metricName))
}
