# @qiwi/nestjs-enterprise-config
Nestjs module for processing [uniconfig-based](https://github.com/qiwi/uniconfig) configs.
## Installation
```shell script
yarn add @qiwi/nestjs-enterprise-config
```
## Configuration
Static import
```typescript
import { Module } from '@nestjs/common'

@Module({
  imports: [
    ConfigModule,
    // and so on
  ],
})

export class AppModule {}
```
Import as dynamic module
```typescript
@Module({
  imports: [
    ConfigModule.register({
      // Absolute or relative path to the config file
      path: '/custom/config/path.json'
    }),
  ]
})

export class AppModule {}
```
## Usage
```typescript
@Injectable()
export class MyService {
  constructor(@Inject('IConfigService') config: IConfigService) {}

  myMethod() {
    return this.config.get('name')
  }
}
````
## API
### Class ConfigModule
Exports `ConfigService` with token `IConfigService`
##### static register (opts: { path: string }): DynamicModule

### Function resolveConfigPath
#### resolveConfigPath (path?: string, local?: boolean): string

###  DEFAULT_KUBE_CONFIG_PATH
#### '\<root>/config/local.json'
###  DEFAULT_LOCAL_CONFIG_PATH
#### '\<root>/config/kube.json'
