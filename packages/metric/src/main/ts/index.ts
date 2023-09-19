import { applyDecorators } from '@nestjs/common'

import { ErrorDecorator } from './decorators/error.decorator'
import { MeteredDecorator } from './decorators/metered.decorator'
import { RequestRateDecorator } from './decorators/request-rate.decorator'
export { GraphiteService } from './graphite.service'
export { MetricService } from './metric.service'
export { getNodeMetrics } from './get-node-metrics'

/**
 * Union {@link ErrorDecorator},  {@link MeteredDecorator} and {@link RequestRateDecorator}
 *
 * @param metricName
 * @constructor
 */
function MetricDecorator(metricName: string) {
  return applyDecorators(
    ErrorDecorator(metricName + '.Error'),
    MeteredDecorator(metricName + '.Metered'),
    RequestRateDecorator(metricName + '.Request-rate'),
  )
}

export { MetricDecorator }

export { RequestRateDecorator } from './decorators/request-rate.decorator'
export { MeteredDecorator } from './decorators/metered.decorator'
export { ErrorDecorator } from './decorators/error.decorator'
