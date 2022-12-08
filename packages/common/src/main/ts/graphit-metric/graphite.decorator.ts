import { applyDecorators } from '@nestjs/common'

import { GmRpmDecorator } from './gm-rpm.decorator'

export function GraphiteDecorator(metricName: string) {
  return applyDecorators(GmRpmDecorator(metricName))
}
