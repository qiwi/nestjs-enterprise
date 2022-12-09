import { promisify } from 'node:util'

import { Controller, Get } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { GraphiteDecorator, GraphiteLogger } from '../../main/ts'
// @ts-ignore
import { GraphiteMockServer } from './mock/graphite-server'

export const sleep = promisify(setTimeout)

const podId = 'example-pod-id'
const applicationName = 'example-application-name'
const datacenter = 'datacenter'
const environment = 'environment'

const graphiteLogger = new GraphiteLogger({
  graphiteApiEndpoint: 'localhost:2003',
  applicationName,
  datacenter,
  podId,
  syncInterval: 200,
  environment,
})

describe('graphite-metric', () => {
  let mockServer: any
  beforeAll(async () => {
    mockServer = new GraphiteMockServer()
    await mockServer.start()
  })

  afterAll(async () => {
    graphiteLogger.clearInterval()
    await sleep(600)
    await mockServer.stop()
  })

  describe('graphite', () => {
    test('enrichMetricName works properly', async () => {
      expect(GraphiteLogger.enrichMetricName('testMetricKey')).toBe(
        `$type.app.$cluster.${applicationName}.$host.${environment}-${datacenter}-${podId}.$metric.testMetricKey`,
      )
      mockServer.flush()
    })

    test('formatMetrics works properly', async () => {
      expect(
        GraphiteLogger.formatMetrics({ testMetricKey: 'testMetricValue' }),
      ).toMatchObject({
        [`$type.app.$cluster.${applicationName}.$host.${environment}-${datacenter}-${podId}.$metric.testMetricKey`]:
          'testMetricValue',
      })
      mockServer.flush()
    })

    test('basic logToGraphite works', async () => {
      await graphiteLogger.log({ testMetricKey: 'testMetricValue' })
      await sleep(400)

      expect(mockServer.timestamplessRequestStack[0]).toBe(
        `${GraphiteLogger.enrichMetricName('testMetricKey')} testMetricValue`,
      )
      mockServer.flush()
    })

    test('multiple metrics logToGraphite works', async () => {
      mockServer.flush()
      await graphiteLogger.log({
        testMetricKey: 'testMetricValue',
        testMetricKey2: 'testMetricValue2',
      })
      await sleep(400)

      expect(mockServer.timestamplessRequestStack.join('')).toBe(
        [
          `${GraphiteLogger.enrichMetricName('testMetricKey')} testMetricValue`,
          `${GraphiteLogger.enrichMetricName(
            'testMetricKey2',
          )} testMetricValue2`,
        ].join(''),
      )
      mockServer.flush()
    })

    test('forced logToGraphite works', async () => {
      await graphiteLogger.log({ testMetricKey: 'testMetricValueForce' }, true)
      await sleep(10)
      expect(mockServer.timestamplessRequestStack[0]).toBe(
        `${GraphiteLogger.enrichMetricName(
          'testMetricKey',
        )} testMetricValueForce`,
      )
      mockServer.flush()
    })

    test('callback logger works', async () => {
      const getMetrics = () => {
        return { testMetricKey: 'testMetricValueCallback' }
      }
      await graphiteLogger.attach(getMetrics)
      await sleep(500)

      expect(mockServer.timestamplessRequestStack[0]).toBe(
        `${GraphiteLogger.enrichMetricName(
          'testMetricKey',
        )} testMetricValueCallback`,
      )
      mockServer.flush()
    })

    test('clearQueue works', async () => {
      graphiteLogger.queue = { testMetricKey: 'testMetricValue' }
      graphiteLogger.clearQueue()
      expect({}).toMatchObject(graphiteLogger.queue)
      mockServer.flush()
    })

    test('decorator', async () => {
      @Controller()
      class TestController {
        @Get('/graphite')
        @GraphiteDecorator('graphiteController')
        async graphiteController() {
          return 'foo'
        }
      }

      const module = await Test.createTestingModule({
        controllers: [TestController],
      }).compile()
      const app = module.createNestApplication()

      await app.init()

      await request(app.getHttpServer()).get('/graphite')

      await sleep(500)

      expect(mockServer.timestamplessRequestStack.at(-2)).toMatch(
        /\$type.app.\$cluster.example-application-name.\$host.environment-datacenter-example-pod-id.\$metric.graphiteController.rpm-p9+/g,
      )
      mockServer.flush()
    })
  })
})
