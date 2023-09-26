import { Inject } from '@nestjs/common'
import { constructDecorator } from '@qiwi/decorator-utils'

import { isPromise } from '../utills'

/**
 *  The decorator collects statistically significant query processing times skewed toward the last 5 minutes to examine their distribution.
 *
 *      - **count** - The total of all values added to the meter.
 *      - **1MinuteRate** - The rate of the meter biased towards the last 1 minute.
 *      - **5MinuteRate** - The rate of the meter biased towards the last 5 minute.
 *      - **15MinuteRate** - The rate of the meter biased towards the last 15 minute.
 *      - **min** - The lowest observed value.
 *      - **max** - The highest observed value.
 *      - **sum** - The sum of all observed values.
 *      - **variance** - The variance of all observed values.
 *      - **mean** - The average of all observed values.
 *      - **stddev** - The stddev of all observed values.
 *      - **count** - The number of observed values.
 *      - **median** - 50% of all values in the resevoir are at or below this value.
 *      - **p75** - See median, 75% percentile.
 *      - **p95** - See median, 95% percentile.
 *      - **p99** - See median, 99% percentile.
 *      - **p999** - See median, 99.9% percentile.
 */
export const RequestRateDecorator = constructDecorator(
  ({ target, proto, args: [metricName] }) => {
    const injectMetric = Inject('IMetricService')
    injectMetric(proto, 'metricService')
    return function (...args: Array<any>) {
      const start = Date.now()
      // @ts-ignore
      const res = target.apply(this, args)

      if (isPromise(res)) {
        return res.then((data: any) => {
          // @ts-ignore
          this.metricService.timer(metricName).update(Date.now() - start)
          return data
        })
      }

      // @ts-ignore
      this.metricService.timer(metricName).update(Date.now() - start)
      return res
    }
  },
)
