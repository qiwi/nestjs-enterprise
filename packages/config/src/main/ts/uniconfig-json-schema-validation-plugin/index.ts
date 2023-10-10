import { readFileSync as nodeReadFileSync, promises } from 'node:fs'
import { resolve } from 'node:path'

import type { IAny, IContext } from '@qiwi/uniconfig'
import { pipe as ajvPipe } from '@qiwi/uniconfig-plugin-ajv'

type TOptionalValidationPluginInput = any

type TOptionalValidationPluginOpts = {
  deps?: {
    readFileSync: (path: string) => Buffer
    readFile: (path: string) => Promise<Buffer>
  }
  schemaPath?: string
}

const optionalValidationPluginDefaultDeps = {
  readFile: promises.readFile,
  readFileSync: nodeReadFileSync,
}

const readJsonFactory = (deps: TOptionalValidationPluginInput['deps']) => ({
  readJson: (path: string) =>
    deps
      .readFile(path)
      .then((d: Buffer) => d.toString())
      .then(JSON.parse),
  readJsonSync: (path: string) =>
    JSON.parse(deps.readFileSync(path).toString()),
})

export const uniconfigJsonSchemaValidationPluginFactory = (
  opts: TOptionalValidationPluginOpts,
) => {
  const { deps = optionalValidationPluginDefaultDeps, schemaPath } = opts
  const { readJson, readJsonSync } = readJsonFactory(deps)

  return {
    name: 'json-schema-validation',
    async handle(
      context: IContext,
      data: TOptionalValidationPluginInput,
    ): Promise<IAny> {
      return schemaPath ?
        ajvPipe.handle(context, {
          data: data,
          schema: await readJson(resolve(schemaPath)),
        })
        : data
    },
    handleSync(context: IContext, data: TOptionalValidationPluginInput): IAny {
      return schemaPath
        ? ajvPipe.handleSync(context, {
          data: data,
          schema: readJsonSync(resolve(schemaPath)),
        })
        : data
    },
  }
}
