# @qiwi/nestjs-enterprise-consul
Nestjs module for working with Consul

## Installation
Requires following packages to be installed 
- [@qiwi/nestjs-enterprise-config](https://github.com/qiwi/nestjs-enterprise/tree/master/packages/config) 
- [@qiwi/nestjs-enterprise-logger](https://github.com/qiwi/nestjs-enterprise/tree/master/packages/logger)

```shell script
yarn add @qiwi/nestjs-enterprise-consul
```

## Configuration
```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger'
import { ConsulModule } from '@qiwi/nestjs-enterprise-consul'

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    ConsulModule,
    // and so on
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### Config
```json
{
  "data": {
    "name": "APP_NAME",
    "server": {
      "port": 8080,
      "host": "$host:"
    },
    "consul": {
      "host": "CONSUL_AGENT_HOST",
      "port": "CONSUL_AGENT_PORT",
      "token": "consul token",
      "tags": ["tag"]
    }
  },
  "sources": {
    "host": {
      "pipeline": "ip"
    }
  }
}
```

## Usage
```typescript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {

  const app = await NestFactory.create(AppModule)
  //...

const config = app.get('IConfigService')
const consul = app.get('IConsul')
const local = config.get('local')
//...

  if (!local) {
    consul.register()
  }
}
 //...

```

## API
### ConsulModule class
Exports `ConsulService` with token `IConsul`
### ConsulService class
#### register(opts: any): IPromise
#### getConnectionParams(opts: any): Promise<IConnectionParams | undefined>
| field | type  | description |
| --- | --- | --- |
|IConnectionParams.host | string | host
|IConnectionParams.port | string | port

#### getKv(opts: any): Promise \<INormalizedConsulKvValue>
| field | type  | description |
| --- | --- | --- |
|INormalizedConsulKvValue.createIndex | number | createIndex
|INormalizedConsulKvValue.modifyIndex | number | modifyIndex
|INormalizedConsulKvValue.lockIndex | number | lockIndex
|INormalizedConsulKvValue.key | string | key
|INormalizedConsulKvValue.flags | number | flags
|INormalizedConsulKvValue.value | string | value

### [Docs](https://qiwi.github.io/nestjs-enterprise/consul/)
