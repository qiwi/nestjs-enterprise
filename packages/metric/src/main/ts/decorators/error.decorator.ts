import { Inject } from '@nestjs/common'
import { constructDecorator } from '@qiwi/decorator-utils'

import { isPromise } from '../utills'

const onError = (service: any, metricName: string, e: any) => {
  service
    .meter(`${metricName}.${(e as Error).name || 'UnresolvedError'}`)
    .update()
  throw e
}

/**
 * The decorator measures the number of error events and also tracks 1-, 5-, and 15-minute moving averages.
 *
 *      - **count** - The total of all values added to the meter.
 *      - **1MinuteRate** - The rate of the meter biased towards the last 1 minute.
 *      - **5MinuteRate** - The rate of the meter biased towards the last 5 minute.
 *      - **15MinuteRate** - The rate of the meter biased towards the last 15 minute.
 */
export const ErrorDecorator = constructDecorator(
  ({ target, proto, args: [metricName] }) => {
    const injectMetric = Inject('IMetricService')
    injectMetric(proto, 'metricService')
    return function (...args: Array<any>) {
      // @ts-ignore

      try {
        // @ts-ignore
        const res = target.apply(this, args)

        if (isPromise(res)) {
          return res.catch((e: Error) => {
            // @ts-ignore
            onError(this.metricService, metricName, e)
          })
        }
      } catch (e) {
        // @ts-ignore
        onError(this.metricService, metricName, e)
      }
    }
  },
)
