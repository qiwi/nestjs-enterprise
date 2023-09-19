import { IConsulService } from '../../../main/ts'

export class FakeConsulDiscovery9090 implements IConsulService {
  async register() {
    return 'registered'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getConnectionParams(_serviceName: string) {
    return {
      host: 'localhost',
      port: 9090,
    }
  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getKv(key: string) {}

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setKv(data: any) {}
}
