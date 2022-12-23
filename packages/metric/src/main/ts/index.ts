import { applyDecorators } from '@nestjs/common'

import { ErrorDecorator } from './decorators/error.decorator'
import { RequestRateDecorator } from './decorators/request-rate.decorator'
import { RpmDecorator } from './decorators/rpm.decorator'
export { GraphiteService } from './graphite.service'
export { MetricService } from './metric.service'
export { getNodeMetrics } from './get-node-metrics'

function MetricDecorator(metricName: string) {
  return applyDecorators(
    ErrorDecorator(metricName + '.Error'),
    RpmDecorator(metricName + '.Rpm'),
    RequestRateDecorator(metricName + '.Request-rate'),
  )
}

export { MetricDecorator, RequestRateDecorator, RpmDecorator, ErrorDecorator }
