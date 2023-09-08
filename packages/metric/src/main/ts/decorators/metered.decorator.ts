import { constructDecorator } from '@qiwi/decorator-utils'

import { Inject } from '@nestjs/common'

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
