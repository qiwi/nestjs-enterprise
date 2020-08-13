import { ILogEntry } from '@qiwi/logwrap'
import { pick } from 'lodash'

// eslint-disable-next-line unicorn/consistent-function-scoping
export const createMetaPipe = () => ({
  meta,
  input,
  level,
}: ILogEntry): ILogEntry => {
  const { trace_id, span_id, parent_span_id } = meta.trace || {}
  const auth = pick(meta.auth || {}, 'value.principal', 'type')
  const { name, version, host } = meta
  const publicMeta = {
    mdc: {
      traceId: trace_id || undefined,
      spanId: span_id || undefined,
      parentSpanId: parent_span_id || undefined,
    },
    event: meta.event,
    auth,
    app_version: version,
    serviceName: name,
    host,
  }

  return {
    meta: { ...meta, publicMeta },
    input,
    level,
  }
}
