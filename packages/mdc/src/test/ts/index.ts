import { Test } from '@nestjs/testing'
import { MdcModule } from '../../main/ts'
// @ts-ignore
import { getContext, setContextValue } from '@qiwi/mware-context'
// @ts-ignore
import { TRACE_KEY } from '@qiwi/mware-mdc'

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
      expect(mdcService.getTrace(ctx)).toMatchObject({
        trace_id: '1',
        span_id: '2',
        parent_span_id: '3',
      })
    })
  })
})
