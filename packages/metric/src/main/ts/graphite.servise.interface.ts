export interface IGraphiteService {
  sendMetric(metrics: Record<string, any>): Promise<void>
}
