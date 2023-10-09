import { constructDecorator } from '@qiwi/decorator-utils'

import { Inject } from '@nestjs/common'

/**
 * The decorator measures the number of function calls and also tracks 1-, 5-, and 15-minute moving averages.
 *
 *      - **count** - The total of all values added to the meter.
 *      - **1MinuteRate** - The rate of the meter biased towards the last 1 minute.
 *      - **5MinuteRate** - The rate of the meter biased towards the last 5 minute.
 *      - **15MinuteRate** - The rate of the meter biased towards the last 15 minute.
 */
export const MeteredDecorator = constructDecorator(
  ({ target, proto, args: [metricName] }) => {
    const injectMetric = Inject('IMetricService')
    injectMetric(proto, 'metricService')

    return function (...args: Array<any>) {
      // @ts-ignore
      this.metricService.meter(metricName).update()
      // @ts-ignore
      return target.apply(this, args)
    }
  },
)
