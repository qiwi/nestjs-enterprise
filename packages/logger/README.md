# @qiwi/nestjs-enterprise-logger
Nestjs module for logging based on [winston](https://github.com/winstonjs/winston)

## Installation
Following packages should be installed before
- [@qiwi/nestjs-enterprise-config](https://github.com/qiwi/nestjs-enterprise/tree/master/packages/config)
- [@qiwi/nestjs-enterprise-mdc](https://github.com/qiwi/nestjs-enterprise/tree/master/packages/mdc)
```shell script
yarn add @qiwi/nestjs-enterprise-logger
```
## Configuration
Import
```typescript
import { 
  LoggerModule,
  createMetaPipe,
  maskerLoggerPipeFactory,
 } from '@qiwi/nestjs-enterprise-logger'

@Module({
  imports: [
    ConfigModule,
    LoggerModule.register(createMetaPipe(), maskerLoggerPipeFactory()),
    // and so on
  ]
})

export class AppModule {}
```

## Usage
```typescript
  @Injectable()
  class MyService {
    constructor(@Inject('ILogger') private logger: ILogger) {}
    myError() {
      this.logger.error('foo')
    }
    myInfo() {
      this.logger.info('foo')
    }

  }
```

For `createMetaPipe`
```typescript
import {
  logger as log,
} from '@qiwi/nestjs-enterprise-logger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = app.get('ILogger')
  app
    .use(log({ logger }))
    .useLogger(logger)

 //...
 logger.info()
```
## Customization
You can inject functions of type `TLoggerPipe` as your own pipes when create `LoggerService` or register `LoggerModule`.
Your pipes will be inserted in the following order:
- `mdc` pipe from `@qiwi/logwrap`;
- `app` pipe (adds app name, app version and os info to log entry);
- your own pipe;
- ...
- your own pipe;
- `logger` pipe (prints log entry).
## API
### Class LoggerModule 
Exports `LoggerService` with token `ILogger`
#### register (...pipes: TLoggerPipe[]): DynamicModule

### Class LoggerService
#### constructor(pipeline: TLoggerPipe[], config: IConfig)
#### push(entry: ILogEntry): void
| field | type  | description |
| --- | --- | --- |
|LogEntry.meta | Record<string, any>| Metadata
|LogEntry.level | ERROR &#124; WARN &#124; INFO &#124; DEBUG &#124; TRACE | Log level
|LogEntry.input | any[] | Data
#### trace(...data: any[]): void
#### debug(...data: any[]): void
#### info(...data: any[]): void
#### warn(...data: any[]): void
#### error(...data: any[]): void

### Function createMetaPipe = () => (entry: ILogEntry): ILogEntry
Creates pipe for metadata injection, used with [@qiwi-private/js-platform-mdc-nestjs](https://github.qiwi.com/common/js-platform/tree/master/packages/mdc-nestjs)

### Function maskerLoggerPipeFactory = () => (entry: ILogEntry): ILogEntry
Creates pipe for pan masking

### Function masker = (input: string | number): string
Masks pans

### [Docs](https://qiwi.github.io/nestjs-enterprise/logger/)
