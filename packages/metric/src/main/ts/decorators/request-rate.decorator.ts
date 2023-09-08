import { constructDecorator } from '@qiwi/decorator-utils'

import { Inject } from '@nestjs/common'

import { isPromise } from '../utills'

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
