import { constructDecorator } from '@qiwi/decorator-utils'

import { Inject } from '@nestjs/common'

import { isPromise } from '../utills'

const onError = (service: any, metricName: string, e: any) => {
  service
    .meter(`${metricName}.${(e as Error).name || 'UnresolvedError'}`)
    .update()
  throw e
}

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
