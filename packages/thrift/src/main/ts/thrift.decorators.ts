import * as thrift from 'thrift'
import { Inject } from '@nestjs/common'

import type {
  IThriftClientProvider,
  IThriftConnectionOpts,
  IThriftServiceProfile,
} from './interfaces'

type IThriftFactoryArgs = [
  any,
  any,
  IThriftServiceProfile | string,
  IThriftConnectionOpts | undefined,
]

// TODO reflect.metadata?
const factoryArgs: IThriftFactoryArgs[] = []
const cache = new WeakMap()

export const INJECT_THRIFT_SERVICE = Symbol('InjectThriftService')

/**
 * Thrift client decorator
 *
 * @param Client
 * @param serviceProfile
 * @param connOpts
 * @constructor
 * @return Inject thrift client service
 */
export const InjectThriftService = <C>(
  Client: thrift.TClientConstructor<C>,
  serviceProfile: IThriftServiceProfile | string,
  connOpts?: IThriftConnectionOpts,
) => {
  const inject = Inject(INJECT_THRIFT_SERVICE)

  return (...args: Parameters<typeof inject>) => {
    factoryArgs.push([args[0], Client, serviceProfile, connOpts])

    return inject(...args)
  }
}

export const thriftServiceFactory = (
  thriftClientService: IThriftClientProvider,
) => {
  const args = factoryArgs.pop()
  if (!args) {
    return
  }

  const [_Parent, Client, serviceProfile, connOpts] = args as IThriftFactoryArgs
  const cached = cache.get(Client) // TODO use composite key

  if (cached) {
    return cached
  }

  const thriftService = thriftClientService.getClient(
    serviceProfile,
    Client,
    connOpts,
  )
  cache.set(Client, thriftService)

  return thriftService
}
