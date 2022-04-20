import { ILogEntry } from '@qiwi/logwrap'

const indexResolver = (days: number) => {
  if(!days) {
    return 'flp-2w'
  }

  if(days <= 7) return 'flp-1w'
  if(days <= 14) return 'flp-2w'
  if(days <= 31) return 'flp-1m'
  if(days <= 93) return 'flp-3m'
  if(days <= 186) return 'flp-6m'
  return 'flp-12m'
}

export const resolveLogIndex = () => ({
  meta,
  input,
  level,
}: ILogEntry): ILogEntry => {
  // eslint-disable-line unicorn/consistent-function-scoping
  const { ttl } = meta
  const service = indexResolver(ttl)

  return {
    meta: { ...meta, service },
    input,
    level,
  }
}
