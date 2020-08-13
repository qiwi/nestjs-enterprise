import { Global, Module, DynamicModule } from '@nestjs/common'
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
  static register(...pipes: any[]): DynamicModule {
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
