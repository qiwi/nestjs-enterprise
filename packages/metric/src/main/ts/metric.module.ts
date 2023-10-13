import { GraphiteService, MetricService } from './'
import { DynamicModule, Global, Module } from '@nestjs/common'
import { IConfig } from '@qiwi/substrate'
import { IGraphiteService } from './graphite.servise.interface'
@Global()
@Module({
  providers: [
    {
      provide: 'IGraphiteService',
      useFactory: (config: IConfig) => {
        const url = config.get('graphite.url')
        return new GraphiteService(url)
      },
      inject: ['IConfigService'],
    },
    {
      provide: 'IMetricService',
      useFactory: (graphiteService: IGraphiteService, metricsConfig: IConfig) => {
        const options = {
          prefix: metricsConfig.get('metric.prefix'),
          interval: metricsConfig.get('metric.interval'),
        }
        return new MetricService(graphiteService, options)
      },
      inject: ['IGraphiteService', 'IConfigService'],
    },
  ],
  exports: ['IGraphiteService', 'IMetricService'],
})
export class MetricModule {
  static register(
    config: string,
    metricsConfig: { prefix: string; interval: number },
  ): DynamicModule {
    return {
      module: MetricModule,
      providers: [
        {
          provide: 'GraphiteService',
          useFactory: () => {
            return new GraphiteService(config)
          },
          inject: ['IConfigService'],
        },
        {
          provide: 'MetricService',
          useFactory: (graphiteService) => {
            return new MetricService(graphiteService, metricsConfig)
          },
          inject: ['IGraphiteService', 'IConfigService'],
        },
      ],
      exports: ['IGraphiteService', 'IMetricService'],
    }
  }
}
