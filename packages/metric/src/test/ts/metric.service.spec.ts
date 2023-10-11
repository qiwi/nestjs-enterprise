import { describe, it } from 'node:test'
import { equal } from 'node:assert'
import { Test } from '@nestjs/testing'
import {
  MetricService, GraphiteService, getNodeMetrics,
} from '../../main/ts'
import assert from 'node:assert/strict'
import lodash from 'lodash'
import { MetricModule } from '../../main/ts/metric.module'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {before, after} from 'node:test'

const toMatchObject = (actual: any, expected: any) => {
  equal(lodash.isMatch(actual, expected), true)
}

const toMatchObjectTypes = (
  actual: Record<string, any>,
  expected: Record<string, string>,
) => {
  for (const key of Object.keys(expected)) {
    if (!actual[key]) console.error('exist', key)
    equal(typeof actual[key], expected[key])
  }
}

const testConfigPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'config',
  'test.json',
)

describe('MetricService', () => {
  let metricAcc: Record<string, any> = {}
  const graphiteMock = {
    sendMetric: (metric: any) => {
      metricAcc = { ...metricAcc, ...metric }
    },
  }
  const metricService = new MetricService(graphiteMock, {
    prefix: 'prefix',
    interval: 0,
  })

  it('timer', async () => {
    await metricService.timer('timer').update(100)
    await metricService.timer('timer').update(200)
    await metricService.push()
    toMatchObject(metricAcc, {
      'prefix.timer.meter.count': 2,
      'prefix.timer.meter.1MinuteRate': 0,
      'prefix.timer.meter.5MinuteRate': 0,
      'prefix.timer.meter.15MinuteRate': 0,
      'prefix.timer.histogram.min': 100,
      'prefix.timer.histogram.max': 200,
      'prefix.timer.histogram.sum': 300,
      'prefix.timer.histogram.variance': 5000,
      'prefix.timer.histogram.mean': 150,
      'prefix.timer.histogram.stddev': 70.710_678_118_654_76,
      'prefix.timer.histogram.count': 2,
      'prefix.timer.histogram.median': 150,
      'prefix.timer.histogram.p75': 200,
      'prefix.timer.histogram.p95': 200,
      'prefix.timer.histogram.p99': 200,
      'prefix.timer.histogram.p999': 200,
    })
  })

  it('meter', async () => {
    await metricService.meter('meter').update()
    await metricService.meter('meter').update()
    await metricService.push()
    toMatchObject(metricAcc, {
      'prefix.meter.meter.count': 2,
      'prefix.meter.meter.1MinuteRate': 0,
      'prefix.meter.meter.5MinuteRate': 0,
      'prefix.meter.meter.15MinuteRate': 0,
    })
  })

  it('histogram', async () => {
    await metricService.histogram('histogram').update(200)
    await metricService.histogram('histogram').update(500)
    await metricService.push()
    toMatchObject(metricAcc, {
      'prefix.histogram.meter.min': 200,
      'prefix.histogram.meter.max': 500,
      'prefix.histogram.meter.sum': 700,
      'prefix.histogram.meter.variance': 45_000,
      'prefix.histogram.meter.mean': 350,
      'prefix.histogram.meter.stddev': 212.132_034_355_964_27,
      'prefix.histogram.meter.count': 2,
      'prefix.histogram.meter.median': 350,
      'prefix.histogram.meter.p75': 500,
      'prefix.histogram.meter.p95': 500,
      'prefix.histogram.meter.p99': 500,
      'prefix.histogram.meter.p999': 500,
    })
  })

  it('attach', async () => {
    await metricService.attach(() => ({ testMetric: 1000 }))
    await metricService.push()
    toMatchObject(metricAcc, { 'prefix.testMetric': 1000 })
  })

  it('get node metric from callback', async () => {
    await metricService.attach(getNodeMetrics)
    await metricService.push()
    toMatchObjectTypes(metricAcc, {
      'prefix.node.process.memory-usage.rss': 'number',
      'prefix.node.process.memory-usage.heap-total': 'number',
      'prefix.node.process.memory-usage.heap-used': 'number',
      'prefix.node.os.loadavg.1m': 'number',
      'prefix.node.os.loadavg.5m': 'number',
      'prefix.node.os.loadavg.15m': 'number',
      'prefix.node.os.freemem': 'number',
      'prefix.node.os.totalmem': 'number',
    })
  })

describe('MetricModule', () => {
  let metricService : MetricService;
  let graphiteService : GraphiteService;
  let moduleFixture: any;

  before(async () => {
    const graphiteApiEndpoint = 'http://example.com';
    const prefix = 'prefix';
    const interval = 1000;
    

    moduleFixture = await Test.createTestingModule({
      imports: [MetricModule.register(
        graphiteApiEndpoint, 'graphiteService', { prefix, interval },
      ), ConfigModule.register({ path: testConfigPath })],
    }).compile();

    metricService = moduleFixture.get('IMetricService');
    graphiteService = moduleFixture.get('IGraphiteService');
  });

  after(async () => {
     await moduleFixture.close();
  });

  it('should be defined with parameters', () => {
    assert.ok(metricService, 'metricService is not defined');
    assert.ok(graphiteService, 'graphiteService is not defined');
  });
});
  });


