import { ILogEntry } from '@qiwi/logwrap'
import luhn from 'fast-luhn'

export const masker = (input: string | number): string => {
  return (input + '').replace(/\s*(\d\s*){13,19}/g, (v) =>
    luhn(v.replace(/\s+/g, ''))
      ? `${v.slice(0, 4)} **** **** ${v.slice(-4)}`
      : '' + input,
  )
}

// eslint-disable-next-line unicorn/consistent-function-scoping
export const maskerLoggerPipeFactory = () => (entry: ILogEntry): ILogEntry => ({
  // eslint-disable-line
  ...entry,
  input: entry.input.map(masker),
})
