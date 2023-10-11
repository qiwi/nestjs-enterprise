import { GraphiteService, MetricService } from './';
import {DynamicModule, Global, Module } from '@nestjs/common'
import { IConfig} from '@qiwi/substrate'
import { IGraphiteService } from './graphite.servise.interface';
@Global()
@Module({
providers: [
  { provide: 'IGraphiteService', useFactory: (graphiteApiEndpoint: IConfig) => {
      const url = graphiteApiEndpoint.get('graphite.url')
      return new GraphiteService(url)
  }, inject: ['IConfigService']},
  { provide: 'IMetricService', useFactory: (graphiteService: IGraphiteService,opts: IConfig) => {
    const options = {
        prefix: opts.get('metric.prefix'),
        interval: opts.get('metric.interval'),
    }
    return new MetricService(graphiteService, options)
  }, inject: ['IGraphiteService', 'IConfigService']}, 
],
exports: ['IGraphiteService', 'IMetricService']})
export class MetricModule {
    static register(
        graphiteApiEndpoint: string,
        graphiteService: any,
        opts: { prefix: string; interval: number },

    ): DynamicModule {
        return {
            module: MetricModule,
            providers: [
                {
                    provide: 'GraphiteService',
                    useFactory: () => {
                        return new GraphiteService(graphiteApiEndpoint)
                    }, inject: ['IConfigService']
                },
                {
                    provide: 'MetricService',
                    useFactory: () => {
                        return new MetricService(graphiteService, opts)
                    }, inject: ['IGraphiteService', 'IConfigService']
                },
            ],
            exports: ['IGraphiteService', 'IMetricService'],
        }
    }
}
