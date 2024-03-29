import assert from 'node:assert/strict'
import path from 'node:path'
import { after, before } from 'node:test'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { LoggerModule } from '@qiwi/nestjs-enterprise-logger'

import { Test } from '@nestjs/testing'

import { MetricModule } from '../../main/ts/metric.module'

const testConfigPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'config',
  'test.json',
)

describe('MetricModuleDynamic', () => {
  let moduleFixtureWithParams: any

  before(async () => {
    const graphiteApiEndpoint = 'http://example.com'
    const prefix = 'prefix'
    const interval = 1000

    moduleFixtureWithParams = await Test.createTestingModule({
      imports: [
        MetricModule.register(graphiteApiEndpoint, { prefix, interval }),
        ConfigModule.register({ path: testConfigPath }),
        LoggerModule,
      ],
    }).compile()
  })

  after(async () => {
    await moduleFixtureWithParams?.close()
  })

  it('should be defined with parameters', () => {
    const metricService = moduleFixtureWithParams.get('IMetricService')
    const graphiteService = moduleFixtureWithParams.get('IGraphiteService')
    assert.ok(metricService, 'metricService is not defined')
    assert.ok(graphiteService, 'graphiteService is not defined')
  })
})

describe('MetricModuleStatic', () => {
  let moduleFixture: any
  before(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        MetricModule,
        ConfigModule.register({ path: testConfigPath }),
        LoggerModule,
      ],
    }).compile()
  })

  after(async () => {
    await moduleFixture?.close()
  })

  it('should be defined without parameters', () => {
    const metricService = moduleFixture.get('IMetricService')
    const graphiteService = moduleFixture.get('IGraphiteService')
    assert.ok(metricService, 'metricService is not defined')
    assert.ok(graphiteService, 'graphiteService is not defined')
  })
})
