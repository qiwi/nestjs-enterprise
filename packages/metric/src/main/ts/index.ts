import { applyDecorators } from '@nestjs/common'

import { ErrorDecorator } from './decorators/error.decorator'
import { MeteredDecorator } from './decorators/metered.decorator'
import { RequestRateDecorator } from './decorators/request-rate.decorator'
export { GraphiteService } from './graphite.service'
export { MetricService } from './metric.service'
export { MetricModule } from './metric.module'
export { getNodeMetrics } from './get-node-metrics'
export type { IMetricService } from './metric.service.interface'
export type { IGraphiteService } from './graphite.servise.interface'

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
