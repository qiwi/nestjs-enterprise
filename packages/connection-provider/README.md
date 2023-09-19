# @qiwi/nestjs-enterprise-connection-provider
Nestjs module for getting endpoints from consul or config

## Installation
Requires following packages to be installed
- [@qiwi/nestjs-enterprise-consul](https://github.com/qiwi/nestjs-enterprise/tree/master/packages/consul)

```shell script
yarn add @qiwi/nestjs-enterprise-connection-provider
```

## Configuration
Imports
```typescript
import { Module } from '@nestjs/common'
import { ConnectionProviderModule } from '@qiwi/nestjs-enterprise-connection-provider'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger-nestjs'
import { ConsulModule } from '@qiwi/nestjs-enterprise-consul-nestjs'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config-nestjs'

@Module({
  imports: [
    ConsulModule,
    ConnectionProviderModule,
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
    "services": {
      "service-1": {
        "type": "thrift",
        "thriftServiceName": "test service 1",
        "discovery": {
          "type": "endpoint",
          "endpoints": [{ "host": "service-1.test.com", "port": "8080" }]
        }
      },
      "service-2": {
        "type": "thrift",
        "thriftServiceName": "test service 2",
        "discovery": {
          "type": "consul",
          "serviceName": "consul name"
        },
        "creds": {
          "type": "username-and-password",
          "username": "username",
          "password": "password"
        }
      }
    }
  }
}
```
## Usage
```typescript
@Injectable()
export class ThriftClientProvider implements IThriftClientProvider, OnModuleDestroy {
    constructor(
    @Inject('IConnectionProvider') private connectionProvider: IConnectionProvider,
    @Inject('IConfigService') private config: IConfig,
    ) {}
  
    async createConnection(
      serviceProfile: IThriftServiceProfile | string,
      connectionOpts?: { transport: any; protocol: any },
    ): Promise<thrift.Connection> {
      const profile = typeof serviceProfile === 'string' ? this.config.get(serviceProfile) : serviceProfile
      const { host, port } = await this.getConnectionParams(profile)
      return  connection = thrift.createConnection(host, port, connectionOpts)
    }
}
```

## API
### Class ConnectionProviderModule
Exports `IConnectionProvider` with token `IConnectionProviderService`
### Class ConnectionProviderService
#### getConnectionParams( serviceProfile: IServiceDeclaration ): Promise<IConnectionParams>

### [Docs](https://qiwi.github.io/nestjs-enterprise/connection-provider/)
