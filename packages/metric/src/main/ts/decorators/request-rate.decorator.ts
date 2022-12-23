import { Inject } from '@nestjs/common'
import { constructDecorator } from '@qiwi/decorator-utils'

export const RequestRateDecorator = constructDecorator(
  ({ target, proto, args: [metricName] }) => {
    const injectMetric = Inject('IMetricService')
    injectMetric(proto, 'metricService')
    return function (...args: Array<any>) {
      const start = Date.now()
      // @ts-ignore
      const res = target.apply(this, args)

      if (
        res instanceof Promise ||
        (typeof res === 'object' && typeof res.then === 'function')
      ) {
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
