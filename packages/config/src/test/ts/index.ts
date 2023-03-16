import { Inject, Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  ConfigModule,
  DEFAULT_KUBE_CONFIG_PATH,
  DEFAULT_LOCAL_CONFIG_PATH,
  resolveConfigPath,
} from '../../main/ts'

const testFileDir = dirname(fileURLToPath(import.meta.url))

const testCfgPath = join(testFileDir, 'config', 'test.json')

describe('configModule', () => {
  describe('index', () => {
    it('properly exposes its inners', () => {
      expect(ConfigModule).toBeDefined()
    })
  })

  describe('config module', () => {
    it('correctly work as dynamic module', async () => {
      @Injectable()
      class TestService {
        @Inject('IConfigService') config: any

        getServiceName() {
          return this.config.get('name')
        }
      }

      const module = await Test.createTestingModule({
        imports: [ConfigModule.register({ path: testCfgPath })],
        providers: [TestService],
      }).compile()

      const service = module.get(TestService)
      expect(service.getServiceName()).toBe('test-name-app')
    })

    it('correctly work as static module', async () => {
      @Injectable()
      class TestService {
        @Inject('IConfigService') config: any

        getServiceName() {
          return this.config.get('name')
        }
      }

      @Injectable()
      class FakeProvider {
        get() {
          return 'fake-service-name'
        }
      }

      const module = await Test.createTestingModule({
        imports: [ConfigModule],
        providers: [TestService],
      })
        .overrideProvider('IConfigService')
        .useClass(FakeProvider)
        .compile()

      const service = module.get(TestService)
      expect(service.getServiceName()).toBe('fake-service-name')
    })
  })

  describe('resolveConfigPath', () => {
    it('correctly resolve path', () => {
      expect(resolveConfigPath(undefined, true)).toBe(DEFAULT_LOCAL_CONFIG_PATH)
      expect(resolveConfigPath(undefined, false)).toBe(DEFAULT_KUBE_CONFIG_PATH)
      expect(resolveConfigPath('test')).toBe('test')
    })
  })
})
