import { equal } from 'node:assert'
import http from 'node:http'
import { after, before, describe, it } from 'node:test'

import { Controller, Get, Module, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import axios from 'axios'
import express from 'express'
import { factory as iop } from 'inside-out-promise'
import lodash from 'lodash'

import { Port } from '../../main/ts'

const toMatchObject = (actual: any, expected: any) => {
  equal(lodash.isMatch(actual, expected), true)
}

const multiport = (server: any) => {
  const instances: any[] = []

  const multiServer = {
    listen(port: number | number[], host: string): Promise<any> {
      // @ts-ignore
      const ports = Array.isArray(port) ? port : [port]
      return Promise.all(
        ports.map((port: number) => {
          const promise = iop()
          // @ts-ignore
          const instance = http.createServer(server)
          instances.push(instance)

          instance
            // @ts-ignore
            .listen(port, host, (err, data) => {
              if (err) {
                multiServer.close()
                promise.reject(err)
              } else {
                promise.resolve(data)
              }
            })

          return promise
        }),
      )
    },

    close() {
      return Promise.all(
        instances.map((instance) => {
          const promise = iop()
          if (instance.listening) {
            instance.close(() => promise.resolve())
          } else {
            promise.resolve()
          }
          return promise
        }),
      )
    },
  }
  return multiServer
}

@Controller()
export class TestController {
  @Port('8080')
  @Get('only8080')
  async only8080(@Port() port: number) {
    return port
  }

  @Port('8081')
  @Get('only8081')
  async only8081(@Port() port: number) {
    return port
  }
}

@Module({
  controllers: [TestController],
})
class AppModule {}

describe('port decorators', () => {
  let multiServer: ReturnType<typeof multiport>

  const host = '127.0.0.1'
  before(async () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    async function bootstrap() {
      const server = express()
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
        { cors: true },
      )

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          disableErrorMessages: false,
        }),
      )

      await app.init()

      multiServer = multiport(server)
      await multiServer.listen([8080, 8081], host)
    }

    await bootstrap()
  })

  after(async () => {
    await multiServer.close()
  })

  it('test cases', async (t) => {
    const cases: Array<[string, string, any, any?]> = [
      [
        '8080 > 8080 = 200',
        `http://${host}:8080/only8080`,
        { data: 8080, status: 200 },
      ],
      [
        '8081 > 8081 = 200',
        `http://${host}:8081/only8081`,
        { data: 8081, status: 200 },
      ],
      [
        '8081 > 8080 = 403',
        `http://${host}:8081/only8080`,
        null, // eslint-disable-line unicorn/no-null
        { response: { status: 403 } },
      ],
      [
        '8080 > 8081 = 403',
        `http://${host}:8080/only8081`,
        null, // eslint-disable-line unicorn/no-null
        { response: { status: 403 } },
      ],
    ]

    for await (const [description, url, succ, err] of cases) {
      await t.test(description, async () => {
        await axios
          .get(url)
          .then((data) => toMatchObject(data, succ))
          .catch((e) => toMatchObject(e, err))
      })
    }
  })
})
