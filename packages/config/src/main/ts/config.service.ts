import { ASYNC, Config, IConfig as IConfigService } from '@qiwi/uniconfig'

export const DEFAULT_LOCAL_CONFIG_PATH = '<root>/config/local.json'
export const DEFAULT_KUBE_CONFIG_PATH = '<root>/config/kube.json'

export const resolveConfigPath = (path?: string, local?: boolean): string => {
  if (path) {
    return path
  }

  return local ? DEFAULT_LOCAL_CONFIG_PATH : DEFAULT_KUBE_CONFIG_PATH
}

const normalizeOpts = (opts?: string | Record<any, any>) => {
  if (typeof opts === 'string' || opts === undefined) {
    return {
      mode: ASYNC,
      data: {
        data: {
          data: {
            target: '$env:ENVIRONMENT_PROFILE_NAME',
            local: '$env:LOCAL',
            path: opts,
            resolveConfigPath,
          },
          template: `{{=it.resolveConfigPath(it.path, it.local)}}`,
        },
        sources: {
          env: {
            pipeline: 'env',
          },
        },
      },
      pipeline: 'datatree>dot>path>file>json>datatree',
    }
  }

  return opts
}

export class ConfigService extends Config implements IConfigService {
  constructor(opts?: string | Record<any, any>) {
    super(normalizeOpts(opts))
  }
}

export type { IConfig as IConfigService } from '@qiwi/uniconfig'
