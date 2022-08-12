import {
  IConfig as IConfigService,
} from '@qiwi/uniconfig/target/es5/'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const uniconfig = require('@qiwi/uniconfig')

export const DEFAULT_LOCAL_CONFIG_PATH = '<root>/config/local.json'
export const DEFAULT_KUBE_CONFIG_PATH = '<root>/config/kube.json'

export const resolveConfigPath = (path?: string, local?: boolean): string => {
  if (path) {
    return path
  }

  return local ? DEFAULT_LOCAL_CONFIG_PATH : DEFAULT_KUBE_CONFIG_PATH
}

export function createOpts(path?: string) {
  return {
    mode: uniconfig.ASYNC,
    data: {
      data: {
        data: {
          target: '$env:ENVIRONMENT_PROFILE_NAME',
          local: '$env:LOCAL',
          path,
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

export { IConfigService }


// @ts-ignore
export class ConfigService extends uniconfig.Config implements IConfigService {
  constructor(opts: string) {
    super(createOpts(opts))
  }
}
