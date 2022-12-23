import { Inject } from '@nestjs/common'
import { constructDecorator } from '@qiwi/decorator-utils'

export const ErrorDecorator = constructDecorator(
  ({ target, proto, args: [metricName] }) => {
    const injectMetric = Inject('IMetricService')
    injectMetric(proto, 'metricService')
    return async function (...args: Array<any>) {
      // @ts-ignore
      return target.apply(this, args).catch((e: any) => {
        // @ts-ignore
        this.metricService
          .meter(`${metricName}.${(e as Error).name || 'UnresolvedError'}`)
          .update()
        throw e
      })
    }
  },
)
