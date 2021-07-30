import {Inject} from '@nestjs/common'
import * as thrift from 'thrift'
import {
  IThriftClientService,
  IThriftConnectionOpts,
  IThriftServiceProfile
} from './interfaces';

// TODO reflect.metadata?
const factoryArgs: IThriftFactoryArgs[] = []
const cache = new WeakMap()

type IThriftFactoryArgs = [any, any, IThriftServiceProfile | string, IThriftConnectionOpts | undefined]

export const InjectThriftService = <C>(Client: thrift.TClientConstructor<C>, serviceProfile: IThriftServiceProfile | string, connOpts?: IThriftConnectionOpts) => {

  const inject = Inject('Foo')

  return (...args: Parameters<typeof inject>) => {
    factoryArgs.push([args[0], Client, serviceProfile, connOpts])

    return inject(...args)
  }
}

export const fooFactory = (thriftClientService: IThriftClientService) => {
  const [_Parent, Client, serviceProfile, connOpts] = factoryArgs.pop() as IThriftFactoryArgs
  const cached = cache.get(Client) // TODO use composite key

  if (cached) {
    return cached
  }

  const thriftService = thriftClientService.getClient(serviceProfile, Client, connOpts)
  cache.set(Client, thriftService)

  return thriftService
}