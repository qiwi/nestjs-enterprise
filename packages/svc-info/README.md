# @qiwi/nestjs-enterprise-svc-info
Returns uptime by `/svc-info/uptime`, application name with version by `/svc-info/version` and build info by `/svc-info/buildstamp`
## Installation
```shell script
yarn add @qiwi/nestjs-enterprise-svc-info
```
## Before using
Buildstamp is a file with build info, whose contents the module exposes by `/svc-info/buildstamp`.

Set up buidstamp forwarding into a container in your `Dockerfile`:
```dockerfile
COPY buildstamp.json $APP_DIR/buildstamp.json
``` 
Add to `"scripts"` in `package.json`:
```json
"prebuild": "<your script for generating buildstamp>",
```
We suggest using [buildstamp](https://github.com/qiwi/buildstamp).

## Usage
### Usage as module:
```typescript
import { SvcInfoModule } from '@qiwi/nestjs-enterprise-svc-info'
// ...

@Module({
  imports: [
    SvcInfoModule
    // and so on
  ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
```

### Usage as controller (if you need routes order):

```typescript
import { SvcInfoController } from '@qiwi/nestjs-enterprise-svc-info'

// ...

@Module({
  imports: [],
  controllers: [SvcInfoController],
  providers: [ ],
})
export class AppModule {}
```

### Setting a custom path to buildstamp file

If you want to give a custom path to your buildstamp file, import module via `register`, which accepts `ISvcInfoModuleOpts`:
```typescript
import { SvcInfoModule, ISvcInfoModuleOpts } from '@qiwi/nestjs-enterprise-svc-info'
// ...
const opts: ISvcInfoModuleOpts = {
  path: 'some/path/buildstamp.json'
}

@Module({
  imports: [
    SvcInfoModule.register(opts)
    // and so on
  ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
```
In case of using the module as controller: 

```typescript
import { SvcInfoController, ISvcInfoModuleOpts } from '@qiwi/nestjs-enterprise-svc-info'
// ...
const opts: ISvcInfoModuleOpts = {
  path: 'some/path/buildstamp.json'
}


@Module({
  imports: [],
  controllers: [SvcInfoController],
  providers: [
    { provide: 'ISvcInfoModuleOpts', useValue: opts }
  ],
})
export class AppModule {}
```
### [Docs](https://qiwi.github.io/nestjs-enterprise/svc-info)
