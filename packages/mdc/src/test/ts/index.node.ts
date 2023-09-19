import { Test } from '@nestjs/testing'
// @ts-ignore
import { getContext, setContextValue } from '@qiwi/mware-context'
// @ts-ignore
import { TRACE_KEY } from '@qiwi/mware-mdc'

import { describe, it } from 'node:test'
import { equal } from 'node:assert'
import lodash from 'lodash'

import { MdcModule } from '../../main/ts'

const toMatchObject = (actual: any, expected: any) => {
  equal(lodash.isMatch(actual, expected), true)
}

describe('mdc', () => {
  it('test', async () => {
    const module = await Test.createTestingModule({
      imports: [MdcModule],
    }).compile()

    const mdcService = module.get('IMdc')

    const ctx = getContext()
    ctx.run(() => {
      setContextValue(
        TRACE_KEY,
        {
          trace_id: '1',
          span_id: '2',
          parent_span_id: '3',
        },
        ctx,
      )
      toMatchObject(mdcService.getTrace(ctx), {
        trace_id: '1',
        span_id: '2',
        parent_span_id: '3',
      })
    })
    await module.close()
  })
})
