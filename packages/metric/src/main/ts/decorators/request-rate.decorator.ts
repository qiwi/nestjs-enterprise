import { Inject } from '@nestjs/common'
import { constructDecorator } from '@qiwi/decorator-utils'

export const RequestRateDecorator = constructDecorator(
  ({ target, proto, args: [metricName] }) => {
    const injectMetric = Inject('IMetricService')
    injectMetric(proto, 'metricService')
    return async function (...args: Array<any>) {
      const start = Date.now()
      const res = await target(args)
      // @ts-ignore
      this.metricService.timer(metricName).update(Date.now() - start)
      return res
    }
  },
)
