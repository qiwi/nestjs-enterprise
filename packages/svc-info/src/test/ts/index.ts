import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, ValidationPipe } from '@nestjs/common'
import { SvcInfoModule } from '../../main/ts'
import {
  createMetaPipe,
  LoggerModule,
  maskerLoggerPipeFactory,
} from '@qiwi/nestjs-enterprise-logger'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import request from 'supertest'
import path from 'path'
import fs from 'fs'

describe('SvcModule', () => {
  let module: TestingModule
  let app: NestApplication

  let isCi: string | undefined
  let buildInfoEnable: string | undefined
  let imageTag: string | undefined

  const fakeConfig = {
    get: (field: 'name' | 'logger' | 'version' | 'local') => {
      const configData = {
        name: 'test-name-app2',
        local: '',
        version: '1',
        logger: {
          dir: path.resolve(__dirname, '../ts/log'),
          level: 'debug',
          maxsize: 157286400,
          datePattern: 'YYYY-MM-DD',
          appJsonFilename: 'application-json.log',
          appFilename: 'testlog.log',
          maxFiles: 10,
          tailable: true,
          zippedArchive: true,
        },
      }

      return configData[field]
    },
  }

  beforeAll(async () => {
    const buildInfoPath = `${process.cwd()}/build-info.json`

    if (fs.existsSync(buildInfoPath)) {
      fs.unlinkSync(buildInfoPath)
    }

    isCi = process.env.TEAMCITY_VERSION
    buildInfoEnable = process.env.BUILD_INFO
    imageTag = process.env.IMAGE_TAG

    process.env.IMAGE_TAG = 'test_image_tag'
    process.env.TEAMCITY_VERSION = 'true'
    process.env.BUILD_INFO = 'true'

    module = await Test.createTestingModule({
      imports: [
        ConfigModule,
        LoggerModule.register(createMetaPipe(), maskerLoggerPipeFactory()),
        SvcInfoModule,
      ],
    })
      .overrideProvider('IConfigService')
      .useValue(fakeConfig)
      .compile()
    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
  })

  afterAll(() => {
    process.env.TEAMCITY_VERSION = isCi
    process.env.BUILD_INFO = buildInfoEnable
    process.env.IMAGE_TAG = imageTag
  })

  describe('/version', () => {
    it('returns version and name of service from package.json', () => {
      return request(app.getHttpServer())
        .get('/svc-info/version')
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.body).toMatchObject({
            version: expect.any(String),
            name: expect.any(String),
          })
        })
    })
  })

  describe('/uptime', () => {
    it('returns human readable uptime', () => {
      return request(app.getHttpServer())
        .get('/svc-info/uptime')
        .expect(HttpStatus.OK)
        .expect((data) =>
          expect(data.text).toMatch(
            /^Uptime is \d+ days, \d+ hours, \d+ mins, \d+ secs$/,
          ),
        )
    })
  })

  describe('/build-info', () => {
    it('returns build-info', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createBuildInfo } = require('../../main/ts/bin/build-info')
      createBuildInfo({ ci: true })

      return request(app.getHttpServer())
        .get('/svc-info/build-info')
        .expect(HttpStatus.OK)
        .expect((data) =>
          expect(data.body).toMatchObject({
            date: expect.any(String),
            git: {
              commitId: expect.any(String),
              repoUrl: expect.any(String),
              repoName: expect.any(String),
            },
            docker: {
              imageTag: 'test_image_tag',
            },
          }),
        )
    })
  })
})
