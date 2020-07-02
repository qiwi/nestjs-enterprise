# @qiwi/nestjs-enterprise-core
Set of utility tools for nestjs

## Install
```shell script
yarn add @qiwi/nestjs-enterprise-core-nestjs
```
## API
### Decorator @Port


```typescript
import { Controller, Get} from '@nestjs/common'
import { Port } from '@qiwi/nestjs-enterprise-core-nestjs'

@Controller()
export class CardInfoController {

  @Port('8080')
  @Get('only8080')
  async test(@Port() port: number) {
    return port
  }
}
```

- When used as a method decorator or class decorator, works like [guard](https://docs.nestjs.com/guards), letting only the specified port.
- When used as a parameter decorator, get port form request.  

### Decorator @RequestSize
```typescript
import { Controller, Post,} from '@nestjs/common'
import { RequestSize } from '@qiwi/nestjs-enterprise-core-nestjs'

// Class decorator
@Controller()
@RequestSize(512)
export class TestClassController {
  @Post('req-limit-512-class')
  async test(@RequestSize() size: number) {
    return size
  }
}

// Method decorator
@Controller()
export class TestMethodController {
  @RequestSize(512)
  @Post('req-limit-512-method')
  async test(@RequestSize() size: number) {
    return size
  }
}

// Parameter decorator
@Controller()
export class TestParamController {
  @Post('return-req-size')
  async test(@RequestSize() size: number) {
    return size
  }
}
```

- When used as a method decorator or class decorator, work like [guard](https://docs.nestjs.com/guards), allows a request that is smaller than the specified size.
- When used as a parameter decorator, get size of request.   
