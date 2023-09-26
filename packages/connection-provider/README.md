# @qiwi/nestjs-enterprise-connection-provider
Nestjs module for getting endpoints from serviceProfile

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

## Usage
```typescript
@Injectable()
export class ThriftClientProvider implements IThriftClientProvider {
    constructor(
    @Inject('IConnectionProvider') private connectionProvider: IConnectionProvider,
    @Inject('IConfig') private config: IConfig
    ) {}

  private async createConnection(
    serviceProfile: IThriftServiceProfile | string,
  ): Promise<IConnectionParams> {
    const profile = serviceProfile ? this.config.get(serviceProfile) : serviceProfile
    const connectionParams = await this.connectionProvider.getConnectionParams(profile)
    //...etc
  }
}
```

## API
### Class ConnectionProviderModule
Exports `IConnectionProvider` with token `IConnectionProviderService`
### Class ConnectionProviderService
#### getConnectionParams( serviceProfile: IServiceDeclaration ): Promise<IConnectionParams>

### [Docs](https://qiwi.github.io/nestjs-enterprise/connection-provider/)
