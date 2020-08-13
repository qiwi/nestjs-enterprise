import { ILogEntry } from '@qiwi/logwrap'

export const createAppPipe = (name: string, version: string, host: string) => (
  entry: ILogEntry
): ILogEntry => {
  Object.assign(entry.meta, {
    name,
    version,
    host,
  })
  return entry
}
