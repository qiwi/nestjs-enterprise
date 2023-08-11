# @qiwi/nestjs-enterprise-mdc
Nestjs module for working with continuation-local storage.

## Installation
```shell script
yarn add @qiwi/nestjs-enterprise-mdc
```

## Configuration
```typescript
import { MdcModule } from '@qiwi/nestjs-enterprise-mdc'

// ...
// NOTE ConfigModule and LoggerModule are global.

@Module({
  imports: [
    MdcModule,
    // and so on
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## Usage
```typescript
import { mdc, logger as log, clscxt } from '@qiwi/nestjs-enterprise-mdc'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
 //...
  app
    .use(clscxt())
    .use(mdc())
    .use(log({ logger }))
 //...
```

## Api
#### mdc, validator, logger
see [@qiwi/mware](https://github.com/qiwi/mware)
#### clscxt
see [@qiwi/mware-context](https://github.com/qiwi/mware/tree/master/packages/mware-context)
