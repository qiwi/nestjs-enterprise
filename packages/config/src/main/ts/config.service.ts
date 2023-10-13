import {
  ASYNC,
  Config,
  IConfig as IConfigService,
  rollupPlugin,
} from '@qiwi/uniconfig'

import { uniconfigJsonSchemaValidationPluginFactory } from './uniconfig-json-schema-validation-plugin/index'
import { resolveSchemaPath } from './uniconfig-json-schema-validation-plugin/resolve-schema-path'

export const DEFAULT_LOCAL_CONFIG_PATH = '<cwd>/config/local.json'
export const DEFAULT_KUBE_CONFIG_PATH = '<cwd>/config/kube.json'

export const resolveConfigPath = (
  path?: string,
  local?: boolean,
  env?: string,
): string | string[][] => {
  if (path) {
    return path
  }

  return local
    ? DEFAULT_LOCAL_CONFIG_PATH
    : env
    ? [[`<cwd>/config/${env}.json`], [DEFAULT_KUBE_CONFIG_PATH]]
    : DEFAULT_KUBE_CONFIG_PATH
}

const normalizeOpts = (opts?: string | Record<any, any>) => {
  if (typeof opts === 'string' || opts === undefined) {
    return {
      mode: ASYNC,
      data: resolveConfigPath(
        opts,
        !!process.env.LOCAL,
        process.env.ENVIRONMENT_PROFILE_NAME,
      ),
      pipeline: 'path>file>json>datatree>json-schema-validation',
    }
  }

  return opts
}

export class ConfigService extends Config implements IConfigService {
  constructor(opts?: string | Record<any, any>, schemaPath?: string) {
    rollupPlugin(
      uniconfigJsonSchemaValidationPluginFactory({
        schemaPath: resolveSchemaPath({
          path: opts,
          schemaPath,
        }),
      }),
    )

    super(normalizeOpts(opts))
  }
}

export type { IConfig as IConfigService } from '@qiwi/uniconfig'

export const configServiceFactory = async (
  options: { schemaPath?: string } & Record<any, any> = {},
) => {
  const service = new ConfigService(
    options.path || options.config,
    options.schemaPath,
  )
  await service.ready

  return service
}
