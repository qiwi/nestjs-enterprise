export interface IMetricService {
    histogram(metricName: string): {
        update(value: number): void
    }

    meter(metricName: string): {
        update(value?: number): void
    }

    timer(metricName: string): {
        update(value?: number): void
    }
}