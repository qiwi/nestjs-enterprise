import {Inject} from '@nestjs/common'
import * as thrift from 'thrift'
import {
  IThriftClientService,
  IThriftConnectionOpts,
  IThriftServiceProfile
} from './interfaces';

// TODO reflect.metadata?
const factoryArgs: IThriftFactoryArgs[] = []

type IThriftFactoryArgs = [any, any, IThriftServiceProfile | string, IThriftConnectionOpts | undefined]

export const InjectThriftService = <C>(Client: thrift.TClientConstructor<C>, serviceProfile: IThriftServiceProfile | string, connOpts?: IThriftConnectionOpts) => {

  const inject = Inject('Foo')

  return (...args: Parameters<typeof inject>) => {
    factoryArgs.push([args[0], Client, serviceProfile, connOpts])

    return inject(...args)
  }
}

export const fooFactory = (thriftClientService: IThriftClientService) => {
  // console.log('(thriftClientService=', thriftClientService)
  const [_Parent, Client, serviceProfile, connOpts] = factoryArgs.pop() as IThriftFactoryArgs
  // console.log(Parent, Client, serviceProfile, connOpts)

  return thriftClientService.getClient(serviceProfile, Client, connOpts)
}