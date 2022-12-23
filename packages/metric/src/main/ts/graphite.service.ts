import { Injectable } from '@nestjs/common'
import GraphiteClient from 'graphite'

@Injectable()
export class GraphiteService {
  private client: GraphiteClient

  constructor(graphiteApiEndpoint: string) {
    this.client = GraphiteClient.createClient(`plaintext://${graphiteApiEndpoint}/`)
  }

  public sendMetric(metrics: Record<string, any>) {
    return new Promise((resolve, reject) => {
      this.client.write(metrics, (err) => {
        if (err) {
          reject(new Error(`Error sending metric: ${err}`))
        }

        resolve('')
      })
    })
  }
}
