import { Inject, Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { notEqual, equal } from 'node:assert'

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
      notEqual(ConfigModule, undefined)
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
      equal(service.getServiceName(),'test-name-app')
      await module.close()
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
      equal(service.getServiceName(),'fake-service-name')
      await module.close()
    })
  })

  describe('resolveConfigPath', () => {
    it('correctly resolve path', () => {
      equal(resolveConfigPath(undefined, true), DEFAULT_LOCAL_CONFIG_PATH)
      equal(resolveConfigPath(undefined, false), DEFAULT_KUBE_CONFIG_PATH)
      equal(resolveConfigPath('test'), 'test')
    })
  })
})
