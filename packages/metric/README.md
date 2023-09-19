# @qiwi/nestjs-enterprise-metric
Nestjs metric module

## Installation
```shell script
yarn add @qiwi/nestjs-enterprise-metric
```

## Usage
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  metricService = app.get('IMetricService')
  metricService.attach(getNodeMetrics)
  
  // ...etc
}
```
```typescript
import {GraphiteService, MetricDecorator, MetricService} from '@qiwi/nestjs-enterprise-metric'
import {Controller, Get, Module} from "@nestjs/common";

@Controller()
export class TestClassController {
    @Get('MeteredDecorator')
    @MetricDecorator('Controller')
    async test() {
        return 'foo'
    }
}

@Module({
    controllers: [TestClassController],
    imports: [
        // and so on
    ],
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
