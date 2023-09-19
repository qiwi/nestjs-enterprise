import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
// @ts-ignore
import { Histogram, Meter, Timer } from 'measured-core'

@Injectable()
export class MetricService implements OnModuleDestroy {
  private collectionTimer: Record<string, Timer> = {}
  private collectionHistogram: Record<string, Histogram> = {}
  private collectionMeter: Record<string, Meter> = {}
  private metricsCallbacks: Array<(args?: Array<any>) => any> = []

  private readonly metricPrefix
  private readonly interval: any

  onModuleDestroy() {
    this.clearInterval()
  }

  constructor(
    @Inject('IGraphiteService') private graphiteService: any,
    opts: { prefix: string; interval: number },
  ) {
    this.metricPrefix = opts.prefix
    if (opts.interval) {
      this.interval = setInterval(this.push.bind(this), opts.interval)
    }
  }

  histogram(metricName: string) {
    if (!this.collectionHistogram[metricName]) {
      this.collectionHistogram[metricName] = new Histogram()
    }

    const histogram = this.collectionHistogram[metricName]
    return {
      update(value: number) {
        histogram.update(value)
      },
    }
  }

  meter(metricName: string) {
    if (!this.collectionMeter[metricName]) {
      this.collectionMeter[metricName] = new Meter()
    }

    const meter = this.collectionMeter[metricName]
    return {
      update(value?: number) {
        meter.mark(value)
      },
    }
  }

  timer(metricName: string) {
    if (!this.collectionTimer[metricName]) {
      this.collectionTimer[metricName] = new Timer()
    }

    const timer = this.collectionTimer[metricName]
    return {
      update(value?: number) {
        timer.update(value)
      },
    }
  }

  async push() {
    const metric = {
      ...this.formatTimers(),
      ...this.formatMeter(),
      ...this.formatHistogram(),
      ...(await this.getMetricsFromCallbacks()),
    }

    return this.graphiteService.sendMetric(metric)
  }

  attach(callback: (args?: Array<any>) => any) {
    this.metricsCallbacks.push(callback)
  }

  clearInterval() {
    clearInterval(this.interval)
  }

  private async getMetricsFromCallbacks() {
    const data = await Promise.all(this.metricsCallbacks.map((el) => el()))
    const flatData = data.reduce((acc, el) => ({ ...acc, ...el }), {})

    return Object.entries(flatData).reduce((acc, [key, value]) => {
      return { ...acc, [`${this.metricPrefix}.${key}`]: value }
    }, {})
  }

  private formatTimers() {
    return Object.entries(this.collectionTimer).reduce(
      (acc, [name, value]) => {
        const { meter, histogram } = value.toJSON()

        return {
          ...acc,
          ...Object.entries(meter).reduce(
            (acc, [key, value]) => {
              acc[`${this.metricPrefix}.${name}.meter.${key}`] = value
              return acc
            },
            {} as Record<string, unknown>,
          ),

          ...Object.entries(histogram).reduce(
            (acc, [key, value]) => {
              acc[`${this.metricPrefix}.${name}.histogram.${key}`] = value
              return acc
            },
            {} as Record<string, unknown>,
          ),
        }
      },
      {} as Record<string, unknown>,
    )
  }

  private formatMeter() {
    return Object.entries(this.collectionMeter).reduce(
      (acc, [name, value]) => {
        return {
          ...acc,
          ...Object.entries(value.toJSON()).reduce(
            (acc, [key, value]) => {
              acc[`${this.metricPrefix}.${name}.meter.${key}`] = value
              return acc
            },
            {} as Record<string, unknown>,
          ),
        }
      },
      {} as Record<string, unknown>,
    )
  }

  private formatHistogram() {
    return Object.entries(this.collectionHistogram).reduce(
      (acc, [name, value]) => {
        return {
          ...acc,
          ...Object.entries(value.toJSON()).reduce(
            (acc, [key, value]) => {
              acc[`${this.metricPrefix}.${name}.meter.${key}`] = value
              return acc
            },
            {} as Record<string, unknown>,
          ),
        }
      },
      {} as Record<string, unknown>,
    )
  }
}
