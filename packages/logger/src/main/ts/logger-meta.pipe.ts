import { ILogEntry } from '@qiwi/logwrap'
import { pick } from 'lodash'

export const createMetaPipe = () => ({
  meta,
  input,
  level,
}: ILogEntry): ILogEntry => {
  // eslint-disable-line unicorn/consistent-function-scoping
  const { name, version, host, event, origin, extra } = meta
  const { trace_id, span_id, parent_span_id } = meta.trace || {}
  const auth = pick(meta.auth || {}, 'value.principal', 'type')
  const publicMeta = {
    ...extra,
    mdc: {
      traceId: trace_id || undefined,
      spanId: span_id || undefined,
      parentSpanId: parent_span_id || undefined,
    },
    event,
    origin,
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
