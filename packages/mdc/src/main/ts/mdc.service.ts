// @ts-ignore
import { getContextValue } from '@qiwi/mware-context'
// @ts-ignore
import { TRACE_KEY } from '@qiwi/mware-mdc'

import { Injectable } from '@nestjs/common'

export interface IMdcService {
  getTrace(): any
}

@Injectable()
export class MdcService implements IMdcService {
  getTrace(ns?: unknown) {
    const trace = getContextValue(TRACE_KEY, ns)
    if (!trace) {
      return {
        trace_id: 'foo',
        span_id: 'bar',
        parent_span_id: 'baz',
      }
    }

    return trace
  }
}
