# @qiwi/nestjs-enterprise-config
Nestjs модуль для процессинга [uniconfig](https://github.com/qiwi/uniconfig) - based конфигов.
## Установка
```shell script
yarn add @qiwi/nestjs-enterprise-config
```
## Конфигурация
Импорт как статический модуль
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
Импорт как динамический модуль
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
## Использование
```typescript
@Injectable()
export class MyService {
  constructor(@Inject('IConfigService') config: any) {}

  myMethod() {
    return this.config.get('name')
  }
}
````
## API
### Class ConfigModule
Экспортирует `ConfigService` по токену `IConfigService`
##### static register (opts: { path: string }): DynamicModule

### Function resolveConfigPath
#### resolveConfigPath (path?: string, local?: boolean): string

###  DEFAULT_KUBE_CONFIG_PATH
#### '\<root>/config/local.json'
###  DEFAULT_LOCAL_CONFIG_PATH
#### '\<root>/config/kube.json'
