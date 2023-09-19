import { ILogEntry } from '@qiwi/logwrap'

/**
 * @param {string} name - app name
 * @param {string} version - app version
 * @param {string} host - app host
 * @return {ILogEntry} Meta logger entry enriched with params (name, versions, host)
 */
export const createAppPipe =
  (name: string, version: string, host: string) =>
  (entry: ILogEntry): ILogEntry => {
    Object.assign(entry.meta, {
      name,
      version,
      host,
    })
    return entry
  }
