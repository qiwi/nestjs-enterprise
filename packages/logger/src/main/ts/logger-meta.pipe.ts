import { ILogEntry } from '@qiwi/logwrap'
import { pick } from 'lodash'

export const createMetaPipe = () => ({
  meta,
  input,
  level,
}: ILogEntry): ILogEntry => {
  // eslint-disable-line unicorn/consistent-function-scoping
  const { name, version, host, event, origin, service, ttl } = meta
  const { trace_id, span_id, parent_span_id } = meta.trace || {}
  const auth = pick(meta.auth || {}, 'value.principal', 'type')
  const publicMeta = {
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
    service,
    ttl
  }

  return {
    meta: { ...meta, publicMeta },
    input,
    level,
  }
}
