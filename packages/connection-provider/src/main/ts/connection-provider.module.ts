import { Global, Module } from '@nestjs/common'

import { ConnectionProviderService } from './connection-provider.service'

@Global()
@Module({
  providers: [
    { provide: 'IConnectionProvider', useClass: ConnectionProviderService },
  ],
  exports: ['IConnectionProvider'],
})
export class ConnectionProviderModule {}
