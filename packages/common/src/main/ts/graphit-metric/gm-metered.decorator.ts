import { constructDecorator } from '@qiwi/decorator-utils'

import { GraphiteLogger } from './graphite.service'

export const GmMeteredDecorator = constructDecorator(
  ({ target, args: [metricName] }) => {
    const originalMethod = target
    return async function (...args: Array<any>) {
      const now = Date.now()
      // @ts-ignore
      const res = await originalMethod.apply(this, args)
      GraphiteLogger.getInstance().pushCountReservoirMetric(
        metricName + '.rpm',
        Date.now() - now,
      )
      return res
    }
  },
)
