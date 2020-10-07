import { DynamicModule, Global, Module } from '@nestjs/common'

import { TLoggerPipe } from './interfaces'
import { LoggerService } from './logger.service'

@Global()
@Module({
  providers: [
    { provide: 'ILogger', useClass: LoggerService },
    { provide: 'ILoggerPipeline', useValue: [] },
  ],

  exports: ['ILogger'],
})
export class LoggerModule {
  static register(...pipes: TLoggerPipe[]): DynamicModule {
    return {
      module: LoggerModule,
      exports: ['ILogger'],
      providers: [
        { provide: 'ILogger', useClass: LoggerService },
        { provide: 'ILoggerPipeline', useValue: pipes },
      ],
    }
  }
}
