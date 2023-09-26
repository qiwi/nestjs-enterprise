# @qiwi/nestjs-enterprise-mdc
Nestjs module for working with continuation-local storage.

## Installation
```shell script
yarn add @qiwi/nestjs-enterprise-mdc
```

## Configuration
```typescript
import { MdcModule } from '@qiwi/nestjs-enterprise-mdc'

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
// main.ts
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
#### mdc, validator, logger, context as clscxt
see [@qiwi/mware](https://github.com/qiwi/mware)

### [Docs](https://qiwi.github.io/nestjs-enterprise/mdc/)
