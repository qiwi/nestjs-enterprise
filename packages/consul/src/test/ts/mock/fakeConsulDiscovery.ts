import { IConsulService } from '../../../main/ts'

export class FakeConsulDiscovery implements IConsulService {
  async register() {
    return 'registered'
  }

  async getKv() {
    return Promise.resolve({
      value: 'consul',
    })
  }

  async getConnectionParams() {
    return {
      host: 'test',
      port: 'test',
    }
  }
}
