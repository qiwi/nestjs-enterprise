// @ts-ignore
import * as thrift from 'thrift'
// eslint-disable-next-line @typescript-eslint/ban-types
export interface ClassType<InstanceType extends Function> extends Function {
  new (...args: any[]): InstanceType
  prototype: InstanceType
}

export type Extender = <BaseClass extends ClassType<any>>(
  base: BaseClass,
) => BaseClass

export const ThriftServer = (processor: any, port: number): ClassDecorator => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <TFunction extends Function>(target: TFunction) => {
    const server = thrift.createServer(processor, target.prototype)
    server.listen(port)
    // @ts-ignore
    target.prototype._server = server
    return target
  }
}
