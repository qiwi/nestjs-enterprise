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
            return new MetricService(graphiteService, {prefix: '$some$your$metric', interval: 1000})
        },
        inject: ['IGraphiteService']
    }, {
        provide: 'IGraphiteService',
        useFactory: ()=>{
            return new GraphiteService('yourGraphiteApiEndpoint')
        }
    }]
})

export class AppModule {}
```

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
