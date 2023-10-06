import assert from 'node:assert'
import { describe, it } from 'node:test'

import {
  defaultAppSchemaFilename,
  resolveSchemaPath,
} from '../../../main/ts/uniconfig-json-schema-validation-plugin/resolve-schema-path'

describe('resolveSchemaPath', () => {
  it('returns schemaPath', () => {
    assert.equal(resolveSchemaPath({ schemaPath: 'foo' }), 'foo')
  })

  it('returns ${dirname(path)}/app.config.schema.json if it exists', () => {
    const opts = { path: 'foo/bar.json' }
    assert.equal(resolveSchemaPath(opts), undefined)
    assert.ok(
      resolveSchemaPath(opts, { existsSync: () => true })?.endsWith(
        `foo/${defaultAppSchemaFilename}`,
      ),
    )
  })

  it('returns ${process.cwd()}/app.config.schema.json if it exists', () => {
    assert.equal(resolveSchemaPath(), undefined)
    assert.equal(
      resolveSchemaPath(undefined, { existsSync: () => true }),
      `${process.cwd()}/config/${defaultAppSchemaFilename}`,
    )
  })
})
