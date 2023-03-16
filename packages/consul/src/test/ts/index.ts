import { Inject, Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ConsulModule, IConsulService } from '../../main/ts'
import { FakeConsulDiscovery } from './mock/fakeConsulDiscovery'

const testConfigPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'config', 'test.json')

describe('logger module', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(ConsulModule).toBeDefined()
    })
  })

  describe('consul module', () => {
    it('getConnectionParams works', async () => {
      @Injectable()
      class TestService {
        constructor(@Inject('IConsul') private consul: IConsulService) {}
        async getConnectionParams() {
          return this.consul.getConnectionParams('test-consul-service-name')
        }
      }

      const module = await Test.createTestingModule({
        providers: [TestService],
        imports: [
          ConfigModule.register({ path: testConfigPath }),
          LoggerModule,
          ConsulModule,
        ],
      })
        .overrideProvider('IDiscoveryService')
        .useFactory({ factory: () => new FakeConsulDiscovery() })
        .overrideProvider('ILogger')
        .useValue({ info: console.log })
        .compile()

      expect(
        await module.get(TestService).getConnectionParams(),
      ).toMatchObject({ host: 'test', port: 'test' })
    })

    it('getKv works', async () => {
      @Injectable()
      class TestService {
        constructor(@Inject('IConsul') private consul: IConsulService) {}

        async getKv() {
          return this.consul.getKv('test-consul-key')
        }
      }

      const module = await Test.createTestingModule({
        providers: [TestService],
        imports: [
          ConfigModule.register({ path: testConfigPath }),
          ConsulModule,
          LoggerModule,
        ],
      })
        .overrideProvider('IDiscoveryService')
        .useFactory({ factory: () => new FakeConsulDiscovery() })
        .overrideProvider('ILogger')
        .useValue({ info: (el: undefined) => el })
        .compile()

      expect(await module.get(TestService).getKv()).toMatchObject({
        value: 'consul',
      })
    })

    it('register works', async () => {
      @Injectable()
      class TestService {
        constructor(@Inject('IConsul') private consul: IConsulService) {}
        async register() {
          return this.consul.register('test-consul-service-name')
        }
      }

      const module = await Test.createTestingModule({
        providers: [TestService],
        imports: [
          ConfigModule.register({ path: testConfigPath }),
          ConsulModule,
          LoggerModule,
        ],
      })
        .overrideProvider('IDiscoveryService')
        .useFactory({ factory: () => new FakeConsulDiscovery() })
        .overrideProvider('ILogger')
        .useValue({ info: (el: undefined) => el })
        .compile()

      expect(await module.get(TestService).register()).toBe(
        'registered in consul OK',
      )
    })
  })
})
