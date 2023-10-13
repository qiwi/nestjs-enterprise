import assert from 'node:assert'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { configServiceFactory } from '../../main/ts/config.service'

const testFileDir = dirname(fileURLToPath(import.meta.url))

const testCfgPath = join(testFileDir, 'config', 'test.json')

describe('configServiceFactory', () => {
  it('returns config service', async () => {
    assert.ok(await configServiceFactory({ path: testCfgPath }))
  })
})
