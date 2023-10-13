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
      useFactory: (graphiteService: IGraphiteService, config: IConfig) => {
        const options = {
          prefix: config.get('metric.prefix'),
          interval: config.get('metric.interval'),
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
    graphiteUrl: string,
    metricsConfig: { prefix: string; interval: number },
    customGraphiteService?: IGraphiteService
  ): DynamicModule {
    return {
      module: MetricModule,
      providers: [
        {
          provide: 'IGraphiteService',
          useFactory: () => {
            if (customGraphiteService) {
              return customGraphiteService
            }
            return new GraphiteService(graphiteUrl)
          },
          inject: ['IConfigService'],
        },
        {
          provide: 'IMetricService',
          useFactory: (graphiteService) => {
            return new MetricService(graphiteService, metricsConfig)
          },
          inject: ['IGraphiteService'],
        },
      ],
      exports: ['IGraphiteService', 'IMetricService'],
    }
  }
}
