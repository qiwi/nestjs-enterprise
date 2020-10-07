import { ILogEntry } from '@qiwi/logwrap'

import { createAppPipe } from '../../main/ts/app.pipe'

describe('createAppPipe', () => {
  it('is defined', () => expect(createAppPipe).toBeDefined())

  it('creates pipe', () => {
    const pipe = createAppPipe('name', 'version', 'localhost')
    expect(typeof pipe).toBe('function')
  })

  test('pipe processes log entry', () => {
    const name = 'name'
    const version = 'version'
    const host = 'localhost'
    const pipe = createAppPipe(name, version, host)
    const input: ILogEntry = {
      level: 'info',
      input: [],
      meta: {}
    }
    expect(pipe(input)).toEqual({ ...input, meta: { name, version, host } })
  })
})
