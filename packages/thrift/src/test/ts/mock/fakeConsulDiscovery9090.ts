import { IConsulService } from '../../../main/ts'

export class FakeConsulDiscovery9090 implements IConsulService {
  async register() {
    return 'registered'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getConnectionParams(_opts: any) {
    return {
      host: 'localhost',
      port: 9090,
    }
  }
}
