import os from 'node:os'

import graphite from 'graphite'

import { CountReservoir } from './count.reservoir'

export class GraphiteLogger {
  static applicationName: string
  static podId: string
  #graphiteApiEndpoint
  #syncInterval

  reservoirs: Map<string, CountReservoir> = new Map()
  queue = {}
  getMetricsCallbacks: Array<(args?: Array<any>) => any> = []

  // @ts-ignore
  private static instance: this
  private static environment: string
  private static datacenter: string
  private interval: NodeJS.Timeout | undefined

  constructor({
    applicationName,
    podId,
    graphiteApiEndpoint,
    syncInterval,
    datacenter,
    environment,
  }: {
    applicationName?: string
    podId?: string
    graphiteApiEndpoint?: string
    syncInterval?: number
    datacenter?: string
    environment?: string
  } = {}) {
    if (!GraphiteLogger.instance) {
      GraphiteLogger.applicationName = applicationName || 'application'
      GraphiteLogger.podId = podId || os.hostname()
      GraphiteLogger.datacenter = datacenter || 'no_dc'
      GraphiteLogger.environment = environment || 'dev'
      this.#graphiteApiEndpoint = `plaintext://${graphiteApiEndpoint}/`
      this.#syncInterval = syncInterval || 60 * 1000

      // @ts-ignore
      this.interval = setInterval(
        this.pushToServer.bind(this),
        this.#syncInterval,
      )
      GraphiteLogger.instance = this
    } else {
      return GraphiteLogger.instance
    }
  }

  public static getInstance(): GraphiteLogger {
    return GraphiteLogger.instance
      ? GraphiteLogger.instance
      : new GraphiteLogger()
  }

  getCountReservoir(metricName: string) {
    if (this.reservoirs.has(metricName)) {
      return this.reservoirs.get(metricName)
    }

    const reservoir = new CountReservoir()
    this.reservoirs.set(metricName, reservoir)
    return reservoir
  }

  pushCountReservoirMetric(metricName: string, value: number) {
    // @ts-ignore
    this.getCountReservoir(metricName).push(value)
  }

  getDataFromReservoirs() {
    return [...this.reservoirs.keys()].reduce((acc, name) => {
      return { ...acc, ...this.reservoirs.get(name)?.getData(name) }
    }, {})
  }

  async getMetricsFromCallbacks() {
    return this.getMetricsCallbacks.reduce(
      async (acc, callback) => ({ ...acc, ...(await callback()) }),
      {},
    )
  }

  static enrichMetricName = (metricName: string) => {
    return `$type.app.$cluster.${this.applicationName}.$host.${this.environment}-${this.datacenter}-${this.podId}.$metric.${metricName}`
  }

  static formatMetrics = (metrics: Record<string, string>) => {
    return Object.fromEntries(
      Object.entries(metrics).map(([k, v]) => [this.enrichMetricName(k), v]),
    )
  }

  async pushToServer(metrics: Record<string, string>) {
    if (!metrics) {
      metrics = {
        ...this.queue,
        ...(await this.getMetricsFromCallbacks()),
        ...this.getDataFromReservoirs(),
      }
    }

    await new Promise((resolve, reject) => {
      // @ts-ignore
      const graphiteClient = graphite.createClient(this.#graphiteApiEndpoint)
      graphiteClient.write(
        GraphiteLogger.formatMetrics(metrics),
        function (error) {
          if (error) return reject(error)

          graphiteClient.end()
          // @ts-ignore
          resolve()
        },
      )
    })

    this.clearQueue()
  }

  clearQueue() {
    this.queue = {}
  }

  async log(metrics = {}, forced = false) {
    if (forced) {
      await this.pushToServer(metrics)
    } else {
      this.queue = { ...this.queue, ...metrics }
    }
  }

  attach(callback: (args?: Array<any>) => any) {
    this.getMetricsCallbacks.push(callback)
  }

  clearInterval() {
    clearInterval(this.interval)
  }
}
