import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UseGuards,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common'
import { constructDecorator, METHOD, PARAM } from '@qiwi/decorator-utils'
import { Reflector } from '@nestjs/core'

const getRequestSize = (ctx: ExecutionContext) =>
  ctx.switchToHttp().getRequest().socket.bytesRead

@Injectable()
export class RequestSizeCanActivate implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requestSizeLimit = this.reflector.get<string[]>(
      'requestSizeLimit',
      context.getHandler(),
    )
    const requestSize = getRequestSize(context)
    return requestSizeLimit > requestSize
  }
}

const RequestSizeGuard = (
  proto: any,
  propName: any,
  descriptor: any,
  requestSizeLimit?: number,
) => {
  UseGuards(RequestSizeCanActivate)(proto, propName, descriptor)
  SetMetadata('requestSizeLimit', requestSizeLimit)(proto, propName, descriptor)
}

export const RequestSizeParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => getRequestSize(ctx),
)

export const RequestSize = constructDecorator(
  ({
    targetType,
    descriptor,
    proto,
    propName,
    paramIndex,
    args: [requestSizeLimit],
  }) => {
    if (targetType === METHOD) {
      RequestSizeGuard(proto, propName, descriptor, requestSizeLimit)
    }

    if (targetType === PARAM) {
      // @ts-ignore
      RequestSizeParam()(proto, propName, paramIndex)
    }
  },
)
