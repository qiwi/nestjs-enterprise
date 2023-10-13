import { equal } from 'node:assert'
import { after, before, describe, it } from 'node:test'

import { Controller, HttpCode, Patch, Post } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { RequestSize } from '../../main/ts/request-size'

type Cases = Array<
  [string, string, 'post' | 'patch', string, { data: string; status: number }]
>

@Controller()
@RequestSize(512)
export class TestClassController {
  @HttpCode(200)
  @Post('req-limit-512-class')
  async test(@RequestSize() size: number) {
    return size
  }
}

@Controller()
export class TestMethodController {
  @RequestSize(512)
  @HttpCode(200)
  @Patch('req-limit-512-method')
  async test(@RequestSize() size: number) {
    return size
  }
}

@Controller()
export class TestParamController {
  @HttpCode(200)
  @Post('return-req-size')
  async test(@RequestSize() size: number) {
    return size
  }
}

describe('RequestSize decorators', () => {
  const testData = 'data for test'
  let module: TestingModule
  let app: NestApplication

  const processTestCases = async (cases: Cases, t) => {
    for await (const [description, path, method, data, succ] of cases) {
      await t.test(description, async () => {
        request(app.getHttpServer())
          [method](path)
          .send({ data })
          .expect(succ.status)
          .expect((res) => {
            if (res.status === 200) {
              return equal(res.text, succ.data)
            }
          })
      })
    }
  }

  before(async () => {
    module = await Test.createTestingModule({
      controllers: [
        TestClassController,
        TestMethodController,
        TestParamController,
      ],
    }).compile()
    app = module.createNestApplication()

    await app.init()
  })

  after(async () => {
    await app.close()
  })

  it('class decorator', async (t) => {
    const cases: Cases = [
      [
        '200 if request size > 512',
        '/req-limit-512-class',
        'post',
        testData,
        { data: '188', status: 200 },
      ],
      [
        '403 if request size > 512',
        '/req-limit-512-class',
        'post',
        testData.padEnd(1000),
        // @ts-ignore
        { status: 403 },
      ],
    ]
    await processTestCases(cases, t)
  })
  it('method decorator', async (t) => {
    const cases: Cases = [
      [
        '200 if request size > 512',
        '/req-limit-512-method',
        'patch',
        testData,
        { data: '190', status: 200 },
      ],
      [
        '403 if request size > 512',
        '/req-limit-512-method',
        'patch',
        testData.padEnd(1000),
        // @ts-ignore
        { status: 403 },
      ],
    ]
    await processTestCases(cases, t)
  })

  it('param decorator', async (t) => {
    const cases: Cases = [
      [
        'return request size',
        '/return-req-size',
        'post',
        testData,
        { data: '184', status: 200 },
      ],
    ]

    await processTestCases(cases, t)
  })
})
