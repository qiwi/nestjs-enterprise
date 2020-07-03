import { NestApplication } from '@nestjs/core'
import { Controller, HttpCode, Post, Patch } from '@nestjs/common'
import { RequestSize } from '../../main/ts/request-size'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

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

  const processTestCases = (cases: Cases) => {
    cases.forEach(([description, path, method, data, succ]) => {
      it(description, () => {
        return request(app.getHttpServer())
          [method](path)
          .send({ data })
          .expect(succ.status)
          .expect((res) => {
            if (res.status === 200) {
              return expect(res.text).toBe(succ.data)
            }
          })
      })
    })
  }

  beforeAll(async () => {
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

  describe('class decorator', () => {
    const cases: Cases = [
      [
        '200 if request size > 512',
        '/req-limit-512-class',
        'post',
        testData,
        { data: '223', status: 200 },
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
    processTestCases(cases)
  })
  describe('method decorator', () => {
    const cases: Cases = [
      [
        '200 if request size > 512',
        '/req-limit-512-method',
        'patch',
        testData,
        { data: '225', status: 200 },
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
    processTestCases(cases)
  })

  describe('param decorator', () => {
    const cases: Cases = [
      [
        'return request size',
        '/return-req-size',
        'post',
        testData,
        { data: '219', status: 200 },
      ],
    ]

    processTestCases(cases)
  })
})
