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

export const uniconfigJsonSchemaValidationPluginFactory = (
  opts: TOptionalValidationPluginOpts,
) => {
  const { deps = optionalValidationPluginDefaultDeps, schemaPath } = opts
  const readJson = (path: string) =>
    deps
      .readFile(path)
      .then((d) => d.toString())
      .then(JSON.parse)
  const readJsonSync = (path: string) =>
    JSON.parse(deps.readFileSync(path).toString())

  return {
    name: 'json-schema-validation',
    async handle(
      context: IContext,
      data: TOptionalValidationPluginInput,
    ): Promise<IAny> {
      if (!schemaPath) {
        return data
      }

      const runtimeConfigSchema = await readJson(resolve(schemaPath))
      return ajvPipe.handle(context, {
        data: data,
        schema: runtimeConfigSchema,
      })
    },
    handleSync(context: IContext, data: TOptionalValidationPluginInput): IAny {
      if (!schemaPath) {
        return data
      }

      const runtimeConfigSchema = readJsonSync(resolve(schemaPath))
      return ajvPipe.handleSync(context, {
        data: data,
        schema: runtimeConfigSchema,
      })
    },
  }
}
