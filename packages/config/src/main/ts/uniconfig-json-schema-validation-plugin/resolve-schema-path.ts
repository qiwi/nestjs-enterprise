import { existsSync as nodeExistsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export const defaultAppSchemaFilename = 'app.config.schema.json'

const defaultDeps = {
  existsSync: nodeExistsSync,
}

export const resolveSchemaPath = (
  options: {
    path?: string
    schemaPath?: string
  } = {},
  deps = defaultDeps,
): string | undefined => {
  if (options.schemaPath) {
    return options.schemaPath
  }

  const defaultSchemaPath = options.path
    ? resolve(dirname(options.path), defaultAppSchemaFilename)
    : resolve(process.cwd(), 'config', defaultAppSchemaFilename)

  if (deps.existsSync(defaultSchemaPath)) {
    return defaultSchemaPath
  }
}
