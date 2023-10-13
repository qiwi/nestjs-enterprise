import assert from 'node:assert'
import { describe, it, mock } from 'node:test'

import { uniconfigJsonSchemaValidationPluginFactory } from '../../../main/ts/uniconfig-json-schema-validation-plugin/index'

const appConfigSchema = {
  properties: {
    name: {
      type: 'string',
    },
  },
  required: ['name'],
}

const appConfig = {
  name: 'foo',
}

const configSchemaBuffer = {
  toString() {
    return JSON.stringify(appConfigSchema)
  },
}

const readFileFactory = () =>
  mock.fn(() => {
    return Promise.resolve(configSchemaBuffer)
  })

const readFileSyncFactory = () =>
  mock.fn(() => {
    return configSchemaBuffer
  })

const schemaPath = '/some/path'

describe('uniconfigJsonSchemaValidationPluginFactory async', () => {
  it('throws validation error', async () => {
    const readFile = readFileFactory()

    const plugin = uniconfigJsonSchemaValidationPluginFactory({
      schemaPath,
      deps: { readFile } as any,
    })
    await assert.rejects(() => plugin.handle({} as any, { foo: 42 }))
  })

  it('does not throw validation error when config is ok', async () => {
    const readFile = readFileFactory()

    const plugin = uniconfigJsonSchemaValidationPluginFactory({
      schemaPath,
      deps: { readFile } as any,
    })
    assert.deepEqual(await plugin.handle({} as any, appConfig), appConfig)
  })

  it('does not throw validation error when schema is absent', async () => {
    const readFile = readFileFactory()

    const plugin = uniconfigJsonSchemaValidationPluginFactory({
      schemaPath,
      deps: { readFile } as any,
    })
    assert.deepEqual(await plugin.handle({} as any, appConfig), appConfig)
  })
})

describe('uniconfigJsonSchemaValidationPluginFactory sync', () => {
  it('throws validation error', () => {
    const readFileSync = readFileSyncFactory()

    const plugin = uniconfigJsonSchemaValidationPluginFactory({
      schemaPath,
      deps: {
        readFileSync,
      } as any,
    })
    assert.throws(() => plugin.handleSync({} as any, { bar: 42 }))
  })

  it('does not throw validation error when config is ok', () => {
    const readFileSync = readFileSyncFactory()

    const plugin = uniconfigJsonSchemaValidationPluginFactory({
      schemaPath,
      deps: {
        readFileSync,
      } as any,
    })
    assert.deepEqual(plugin.handleSync({} as any, appConfig), appConfig)
  })

  it('does not throw validation error when schema is absent', () => {
    const readFileSync = readFileSyncFactory()

    const plugin = uniconfigJsonSchemaValidationPluginFactory({
      schemaPath,
      deps: {
        readFileSync,
      } as any,
    })
    assert.deepEqual(plugin.handleSync({} as any, appConfig), appConfig)
  })
})
