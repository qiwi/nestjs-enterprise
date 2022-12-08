// https://javadoc.io/doc/io.dropwizard.metrics/metrics-core/4.0.5/com/codahale/metrics/ExponentiallyDecayingReservoir.html

export class CountReservoir {
  private limit: number
  constructor(limit = 1024) {
    this.limit = limit
  }

  data: Array<Record<string, number>> = []
  push(value: number) {
    if (this.data.length >= this.limit) {
      this.data.shift()
    }
    this.data.push({ value })
  }

  getPercentiles(percentiles = [0.5, 0.75, 0.95, 0.99]) {
    const data = this.data.map((d) => d.value).sort((a, b) => a - b)
    return percentiles.map((p) => data[Math.floor(data.length * p)])
  }

  getData(name: string) {
    const percentiles = this.getPercentiles()

    return {
      [`${name}-p50`]: percentiles[0],
      [`${name}-p75`]: percentiles[1],
      [`${name}-p95`]: percentiles[2],
      [`${name}-p99`]: percentiles[3],
    }
  }
}
