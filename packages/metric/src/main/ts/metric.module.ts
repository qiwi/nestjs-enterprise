import { GraphiteService, MetricService } from './'
import { DynamicModule, Global, Module } from '@nestjs/common'
import { IConfig } from '@qiwi/substrate'
import { IGraphiteService } from './graphite.servise.interface'
@Global()
@Module({
  providers: [
    {
      provide: 'IGraphiteService',
      useFactory: (graphiteApiEndpoint: IConfig) => {
        const url = graphiteApiEndpoint.get('graphite.url')
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
    graphiteApiEndpoint: string,
    metricsConfig: { prefix: string; interval: number },
  ): DynamicModule {
    return {
      module: MetricModule,
      providers: [
        {
          provide: 'GraphiteService',
          useFactory: () => {
            return new GraphiteService(graphiteApiEndpoint)
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
