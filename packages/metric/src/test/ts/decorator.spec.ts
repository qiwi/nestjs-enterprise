import { equal } from 'node:assert'
import { after, before, describe, it } from 'node:test'

import { Controller, Get, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import lodash from 'lodash'
import request from 'supertest'

import {
  ErrorDecorator,
  GraphiteService,
  MeteredDecorator,
  MetricService,
  RequestRateDecorator,
} from '../../main/ts'

const toMatchObject = (actual: any, expected: any) => {
  equal(lodash.isMatch(actual, expected), true)
}

const toMatchObjectTypes = (
  actual: Record<string, any>,
  expected: Record<string, any>,
) => {
  for (const key of Object.keys(expected)) {
    if (!actual[key]) console.error('exist', key)
    equal(typeof actual[key], typeof expected[key])
  }
}

@Controller()
export class TestClassController {
  @Get('RpmDecorator')
  @MeteredDecorator('RpmDecorator')
  async RpmDecorator() {
    return 'RpmDecorator'
  }

  @Get('RequestRateDecorator')
  @RequestRateDecorator('RequestRateDecorator')
  async RequestRateDecorator() {
    return 'RequestRateDecorator'
  }

  @Get('ErrorDecorator')
  @ErrorDecorator('ErrorDecorator')
  async ErrorDecorator() {
    throw new TypeError('ErrorDecorator')
  }
}

describe('Decorators', () => {
  let data = {}
  let app: INestApplication
  let metricService: MetricService

  before(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestClassController],
      providers: [
        {
          provide: 'IMetricService',
          useFactory(graphiteService) {
            return new MetricService(graphiteService, {
              interval: 0,
              prefix: 'decorator-test-prefix',
            }, console)
          },
          inject: ['IGraphiteService'],
        },
        { provide: 'IGraphiteService', useClass: GraphiteService },
      ],
    })
      .overrideProvider('IGraphiteService')
      .useValue({
        sendMetric(metrics: any) {
          data = { ...data, ...metrics }
        },
      })
      .compile()

    app = moduleRef.createNestApplication()
    metricService = app.get('IMetricService')
    await app.init()
  })

  after(async () => {
    await app.close()
  })

  describe('Decorators', () => {
    it('RpmDecorator', async () => {
      await request(app.getHttpServer()).get('/RpmDecorator').expect(200)

      await metricService.push()
      toMatchObject(data, {
        'decorator-test-prefix.RpmDecorator.meter.count': 1,
        'decorator-test-prefix.RpmDecorator.meter.1MinuteRate': 0,
        'decorator-test-prefix.RpmDecorator.meter.5MinuteRate': 0,
        'decorator-test-prefix.RpmDecorator.meter.15MinuteRate': 0,
      })
    })

    it('RequestRateDecorator', async () => {
      await request(app.getHttpServer())
        .get('/RequestRateDecorator')
        .expect(200)

      await metricService.push()
      toMatchObjectTypes(data, {
        'decorator-test-prefix.RequestRateDecorator.meter.count': 1,
        'decorator-test-prefix.RequestRateDecorator.meter.1MinuteRate': 0,
        'decorator-test-prefix.RequestRateDecorator.meter.5MinuteRate': 0,
        'decorator-test-prefix.RequestRateDecorator.meter.15MinuteRate': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.min': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.max': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.sum': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.variance': null,
        'decorator-test-prefix.RequestRateDecorator.histogram.mean': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.stddev': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.count': 1,
        'decorator-test-prefix.RequestRateDecorator.histogram.median': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.p75': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.p95': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.p99': 0,
        'decorator-test-prefix.RequestRateDecorator.histogram.p999': 0,
      })
    })

    it('ErrorDecorator', async () => {
      await request(app.getHttpServer()).get('/ErrorDecorator').expect(500)

      await metricService.push()
      toMatchObject(data, {
        'decorator-test-prefix.ErrorDecorator.TypeError.meter.count': 1,
        'decorator-test-prefix.ErrorDecorator.TypeError.meter.1MinuteRate': 0,
        'decorator-test-prefix.ErrorDecorator.TypeError.meter.5MinuteRate': 0,
        'decorator-test-prefix.ErrorDecorator.TypeError.meter.15MinuteRate': 0,
      })
    })
  })
})
