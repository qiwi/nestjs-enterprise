import { getNodeMetrics, MetricService } from '../../main/ts'

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
    expect(metricAcc).toMatchObject({
      'prefix.timer.meter.count': 2,
      'prefix.timer.meter.1MinuteRate': 0,
      'prefix.timer.meter.5MinuteRate': 0,
      'prefix.timer.meter.15MinuteRate': 0,
      'prefix.timer.histogram.min': 100,
      'prefix.timer.histogram.max': 200,
      'prefix.timer.histogram.sum': 300,
      'prefix.timer.histogram.variance': 5000,
      'prefix.timer.histogram.mean': 150,
      'prefix.timer.histogram.stddev': 70.71067811865476,
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
    expect(metricAcc).toMatchObject({
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
    expect(metricAcc).toMatchObject({
      'prefix.histogram.meter.min': 200,
      'prefix.histogram.meter.max': 500,
      'prefix.histogram.meter.sum': 700,
      'prefix.histogram.meter.variance': 45000,
      'prefix.histogram.meter.mean': 350,
      'prefix.histogram.meter.stddev': 212.13203435596427,
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
    expect(metricAcc).toMatchObject({ testMetric: 1000 })
  })

  it('get node metric from callback', async () => {
    await metricService.attach(getNodeMetrics)
    await metricService.push()
    console.log(JSON.stringify(metricAcc))
    expect(metricAcc).toMatchObject({
      'node.process.memory-usage.rss': expect.any(Number),
      'node.process.memory-usage.heap-total': expect.any(Number),
      'node.process.memory-usage.heap-used': expect.any(Number),
      'node.os.loadavg.1m': expect.any(Number),
      'node.os.loadavg.5m': expect.any(Number),
      'node.os.loadavg.15m': expect.any(Number),
      'node.os.freemem': expect.any(Number),
      'node.os.totalmem': expect.any(Number),
    })
  })
})
