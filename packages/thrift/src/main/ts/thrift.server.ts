import * as thrift from 'thrift'

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
