import { ILogEntry } from '@qiwi/logwrap'
import luhn from 'fast-luhn'

/**
 * @param {string | number} input
 * @return {string} masked PAN or input
 */
export const masker = (input: string | number): string => {
  return (input + '').replace(/\s*(\d\s*){13,19}/g, (v) =>
    luhn(v.replace(/\s+/g, ''))
      ? `${v.slice(0, 4)} **** **** ${v.slice(-4)}`
      : '' + input,
  )
}
/**
 * @return {ILogEntry} logEntry with masked input
 */
export const maskerLoggerPipeFactory =
  () =>
  (entry: ILogEntry): ILogEntry => ({
    ...entry,
    input: entry.input.map(masker),
  })
