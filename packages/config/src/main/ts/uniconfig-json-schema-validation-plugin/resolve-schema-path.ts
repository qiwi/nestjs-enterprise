import { existsSync as nodeExistsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export const defaultAppSchemaFilename = 'app.config.schema.json'

const defaultDeps = {
  existsSync: nodeExistsSync,
}

export const resolveSchemaPath = (
  options: {
    path?: any
    schemaPath?: string
  } = {},
  deps = defaultDeps,
): string | undefined => {
  if (options.schemaPath) {
    return options.schemaPath
  }

  const defaultSchemaPath =
    options.path && typeof options.path === 'string'
      ? resolve(dirname(options.path), defaultAppSchemaFilename)
      : resolve(process.cwd(), 'config', defaultAppSchemaFilename)

  if (deps.existsSync(defaultSchemaPath)) {
    return defaultSchemaPath
  }
}
