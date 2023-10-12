export { ConfigModule } from './config.module'
export {
  resolveConfigPath,
  DEFAULT_KUBE_CONFIG_PATH,
  DEFAULT_LOCAL_CONFIG_PATH,
  ConfigService,
  configServiceFactory,
} from './config.service'
export type { IConfigService } from './config.service'
