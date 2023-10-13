import { Test } from '@nestjs/testing'
import assert from 'node:assert/strict'
import { MetricModule } from '../../main/ts/metric.module'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import { before, after } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'

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
      imports: [MetricModule, ConfigModule.register({ path: testConfigPath })],
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
