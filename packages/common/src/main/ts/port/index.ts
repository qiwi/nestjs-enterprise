import { constructDecorator, METHOD, PARAM } from '@qiwi/decorator-utils'

import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class PortCanActivate implements CanActivate {
  constructor(@Inject(Reflector) private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const port = this.reflector.get<string[]>('port', context.getHandler())
    return (
      context.switchToHttp().getRequest().connection.localPort.toString() ===
      port
    )
  }
}

export const PortParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().connection.localPort
  },
)

export const Port = (args?: string) => {
  return constructDecorator(({ targetType, proto, propName, paramIndex }) => {
    if (targetType === METHOD) {
      UseGuards(PortCanActivate)(
        proto,
        // @ts-ignore
        propName,
        // @ts-ignore
        Object.getOwnPropertyDescriptor(proto, propName),
      )
      SetMetadata('port', args)(
        proto,
        // @ts-ignore
        propName,
        // @ts-ignore
        Object.getOwnPropertyDescriptor(proto, propName),
      )
    }

    if (targetType === PARAM) {
      // @ts-ignore
      return PortParam()(proto, propName, paramIndex)
    }
  })()
}
