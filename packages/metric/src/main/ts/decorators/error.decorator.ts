import { Inject } from '@nestjs/common'
import { constructDecorator } from '@qiwi/decorator-utils'

export const ErrorDecorator = constructDecorator(
  ({ target, proto, args: [metricName] }) => {
    const injectMetric = Inject('IMetricService')
    injectMetric(proto, 'metricService')
    return function (...args: Array<any>) {
      let res
      try {
        // @ts-ignore
        res = target.apply(this, args)
      } catch (e) {
        // @ts-ignore
        this.metricService
          .meter(`${metricName}.${(e as Error).name || 'UnresolvedError'}`)
          .update()
        throw e
      }

      if (
        res instanceof Promise ||
        (typeof res === 'object' && typeof res.then === 'function')
      ) {
        return res.catch((e: any) => {
          // @ts-ignore
          this.metricService
            .meter(`${metricName}.${(e as Error).name || 'UnresolvedError'}`)
            .update()
          throw e
        })
      }
    }
  },
)
