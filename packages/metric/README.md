# @qiwi/nestjs-enterprise-metric
Nestjs metric module

## Installation
```shell script
yarn add @qiwi/nestjs-enterprise-metric
```

## Usage
```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  metricService = app.get('IMetricService')
  metricService.attach(getNodeMetrics)
  
  // ...etc
}
```
```typescript
import {
  GraphiteService, 
  MetricDecorator, 
  MetricService,
  ErrorDecorator,
  MeteredDecorator,
  RequestRateDecorator,
} from '@qiwi/nestjs-enterprise-metric'
import {Controller, Get, Module} from "@nestjs/common";

@Controller()
export class TestClassController {
    @Get('MeteredDecorator')
    @MetricDecorator('Controller')
    async test() {
        return 'foo'
    }
    
    @Get('ErrorDecorator')
    @ErrorDecorator('Controller')
    async error() {
      return 'foo'
    }

    @Get('MeteredDecorator')
    @MeteredDecorator('Controller')
    async meter() {
      return 'foo'
    }
    
    @Get('RequestRateDecorator')
    @RequestRateDecorator('Controller')
    async rate() {
      return 'foo'
    }
}

@Module({
    controllers: [TestClassController],
    providers: [{
        provide: 'IMetricService',
        useFactory: (graphiteService)=>{
            return new MetricService(graphiteService).register({prefix: '$some$your$metric-prefix', interval: 1000})
        }
    }, {
        provide: 'IGraphiteService',
        useFactory: ()=>{
            return new GraphiteService('yourGraphiteApiEndpoint')
        }
    }]
})

export class AppModule {}
```
### MetricModule
The MetricModule provides functionality for working with metrics in your application. 
It adds the MetricService to the application using the IMetricService token and GraphiteService using the IGraphiteService token.

### ConfigModule
The ConfigModule is used for loading configuration files into your application.
ConfigModule is imported from @qiwi/nestjs-enterprise-config
```typescript
ConfigModule.register({ path: testConfigPath })
```

- path - The path to the configuration file.

### Imports MetricModule and ConfigModule
```typescript
import { Module } from '@nestjs/common';
import { MetricModule, ConfigModule} from '@qiwi/nestjs-enterprise-metric';

@Module({
  imports: [
    MetricModule, 
    ConfigMoudle,
    ],
})
export class AppModule {}
```
### Imports MetricModule and ConfigModule with parametrs 

```typescript
import { Module } from '@nestjs/common';
import { MetricModule, ConfigModule} from '@qiwi/nestjs-enterprise-metric';

@Module({
  imports: [
    MetricModule.register({
      pgraphiteApiEndpoint: string,
      metricsConfig: { prefix: string; interval: number },
    }),
    ConfigMoudle.register({ path: configPath })
  ],
})
export class AppModule {}
```
You can pass parameters to a `.register()` method

- graphiteApiEndpoint - The URL for connecting to the Graphite API.
- metricsConfig - Metrics configuration, including the metric prefix and interval.
  - metricsConfig.prefix - prefix for metric entry name
  - metricsConfig.interval - period of metric sending in ms

## API
### Class MetricModule
Exports `MetricService` with token `IMetricService`

### ErrorDecorator
The decorator measures the number of error events and also tracks 1-, 5-, and 15-minute moving averages.
### MeteredDecorator
The decorator measures the number of function calls and also tracks 1-, 5-, and 15-minute moving averages.
### RequestRateDecorator
The decorator collects statistically significant query processing times skewed toward the last 5 minutes to examine their distribution.
### MetricDecorator
Union ErrorDecorator, MeteredDecorator and RequestRateDecorator
### attach
Attach your metric
### getNodeMetrics
Return process and os metric.


### [Docs](https://qiwi.github.io/nestjs-enterprise/metric/)
