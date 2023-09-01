import {Inject, Injectable, OnModuleDestroy} from '@nestjs/common'
import { ConsulDiscoveryService } from '@qiwi/consul-service-discovery'
import type {
  IConsulKvSetOptions,
  INormalizedConsulKvValue,
} from '@qiwi/consul-service-discovery'
import type { IConfig, ILogger, IPromise } from '@qiwi/substrate'

export type IConnectionParams = {
  host: string
  port: string
}

const CONSUL_CHECK_REG_INTERVAL = 60_000

export interface IConsulService {
  register(opts: any): IPromise
  getConnectionParams(opts: any): Promise<IConnectionParams | undefined>
  getKv(key: string): Promise<INormalizedConsulKvValue>
}

@Injectable()
export class ConsulService implements IConsulService, OnModuleDestroy {
  constructor(
    @Inject('ILogger') private log: ILogger,
    @Inject('IConfigService') private config: IConfig,
    @Inject('IDiscoveryService')
    private discoveryService: ConsulDiscoveryService,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.discoveryService.clear()
  }

  async register() {
    const serviceName: string = this.config.get('name')
    const consulHost: string = this.config.get('consul.host')
    const consulPort: string = this.config.get('consul.port')
    const tags: string[] = this.config.get('consul.tags')
    const consulToken: string = this.config.get('consul.token')
    const consulUrl = `http://${consulHost}:${consulPort}/v1/agent/service/register`
    const port: number = this.config.get('server.port')
    const ip: string = this.config.get('server.host')
    const consulCheckRegInterval =
      this.config.get('consul.checkRegInterval') || CONSUL_CHECK_REG_INTERVAL

    this.log.info('consul registration attempt', consulUrl)

    return this.discoveryService
      .register(
        {
          name: serviceName,
          token: consulToken,
          tags,
          address: ip,
          port,
          check: {
            http: `http://${ip}:${port}/health`,
            interval: '15s',
            // @ts-ignore
            deregistercriticalserviceafter: '10m',
          },
        },
        consulCheckRegInterval,
      )
      .then(() => this.log.info('registered in consul OK'))
  }

  async getConnectionParams(serviceName: string) {
    return this.discoveryService.getConnectionParams(serviceName)
  }

  async getKv(key: string) {
    return this.discoveryService.getKv(key)
  }

  async setKv(data: IConsulKvSetOptions) {
    return this.discoveryService.setKv(data)
  }
}
