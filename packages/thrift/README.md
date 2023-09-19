# @qiwi/nestjs-enterprise-thrift"

Nestjs module for working with [Apache Thrift](https://thrift.apache.org/)

# Installation
Requires following packages to be installed
- [@qiwi/nestjs-enterprise-logger](https://github.com/qiwi/nestjs-enterprise/tree/master/packages/logger)
- [@qiwi/nestjs-enterprise-config](https://github.com/qiwi/nestjs-enterprise/tree/master/packages/config)
- [@qiwi/nestjs-enterprise-connection-provider](https://github.com/qiwi/nestjs-enterprise/tree/master/packages/connection-provider)

```shell script
yarn add @qiwi/nestjs-enterprise-thrift
```

## Configuration
Imports
```typescript
import { Module } from '@nestjs/common'
import { ConnectionProviderModule } from '@qiwi/nestjs-enterprise-connection-provider'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger-nestjs'
import { ConsulModule } from '@qiwi/nestjs-enterprise-consul-nestjs'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config-nestjs'
import { ThriftModule } from '@qiwi/nestjs-enterprise-thrift'

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    ConsulModule,
    ConnectionProviderModule,
    // and so on
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```
## Usage
```typescript
@Injectable()
class AuthService {
  client?: Client
  creds?: TCredentials
  token?: TAuthentication

  @Inject('IConfigService')
  config: IConfig

  @Inject('IThriftClientService')
  thrift: IThriftClientService

    getClient() {
        const serviceProfile: IServiceDeclaration = this.config.get('serviceName')
        this.client = this.thrift.getClient(serviceProfile, Client, {
            multiplexer: false,
            connectionOpts: {
                transport: thrift.TBufferedTransport,
                protocol: thrift.TBinaryProtocol,
            },
        })
        return this.client
  }
}
```

## Decorators
### @ThriftServer
```typescript
    @ThriftServer(CalculatorProcessor, 9091)
    class TestServer {
      ping(result: () => void) {
        result()
      }

      add(n1: any, n2: any, result: (arg0: null, arg1: any) => void) {
        result(null, n1 + n2)
      }
    }
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

## API
### Class ConnectionProviderModule
Exports `IThriftClientService` with token `IThriftClientService`

