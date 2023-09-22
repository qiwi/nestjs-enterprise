import { deepEqual, equal, notEqual } from 'node:assert'
import { describe, it } from 'node:test'

import type { ILogEntry } from '@qiwi/logwrap'

import { createAppPipe } from '../../main/ts/app.pipe'

describe('createAppPipe', () => {
  it('is defined', () => notEqual(createAppPipe, undefined))

  it('creates pipe', () => {
    const pipe = createAppPipe('name', 'version', 'localhost')
    equal(typeof pipe, 'function')
  })

  it('pipe processes log entry', () => {
    const name = 'name'
    const version = 'version'
    const host = 'localhost'
    const pipe = createAppPipe(name, version, host)
    const input: ILogEntry = {
      level: 'info',
      input: [],
      meta: {},
    }
    deepEqual(pipe(input), { ...input, meta: { name, version, host } })
  })
})
