import { ILogEntry } from '@qiwi/logwrap'
import lo from 'lodash'

/**
 * Creates pipe for metadata injection, used with @qiwi-private/js-platform-mdc-nestjs
 * @see {@link https://github.qiwi.com/common/js-platform/tree/master/packages/mdc-nestjs}
 */
export const createMetaPipe =
  () =>
  ({ meta, input, level }: ILogEntry): ILogEntry => {
    const { name, version, host, event, origin, extra, trace } = meta
    const { trace_id, span_id, parent_span_id } = trace || {}
    const auth = lo.pick(meta.auth || {}, 'value.principal', 'type')
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
