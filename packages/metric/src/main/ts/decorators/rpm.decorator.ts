import { Inject } from '@nestjs/common'
import { constructDecorator } from '@qiwi/decorator-utils'

export const RpmDecorator = constructDecorator(
  ({ target, proto, args: [metricName] }) => {
    const injectMetric = Inject('IMetricService')
    injectMetric(proto, 'metricService')

    return function (...args: Array<any>) {
      console.log('metricname', ...args)
      // @ts-ignore
      this.metricService.meter(metricName).update()
      return target(args)
    }
  },
)
