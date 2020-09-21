import { Test } from '@nestjs/testing'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
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
import rimraf from 'rimraf'

const buildstamp = {
  date: 1600692101204,
  git: {
    commitId: '1234567890123456789012345678901234567890',
    repoUrl: 'http://localhost',
    repoName: 'foo/bar',
  },
  docker: {
    imageTag: 'baz',
  },
}

const buildstampPath = `${process.cwd()}/buildstamp.json`
const tempFolderPath = `${process.cwd()}/some`
const tempCustomBuldstampPath = `${tempFolderPath}/foo.json`

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

const createApp = async (svcInfoModule: any) => {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule,
      LoggerModule.register(createMetaPipe(), maskerLoggerPipeFactory()),
      svcInfoModule,
    ],
  })
    .overrideProvider('IConfigService')
    .useValue(fakeConfig)
    .compile()
  const app = module.createNestApplication()
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  return app
}

describe('SvcModule', () => {
  let app: INestApplication

  beforeAll(async () => {
    fs.writeFileSync(buildstampPath, JSON.stringify(buildstamp))
    fs.mkdirSync(tempFolderPath, { recursive: true })
    fs.writeFileSync(tempCustomBuldstampPath, JSON.stringify(buildstamp))
  })

  afterAll(() => {
    fs.unlinkSync(buildstampPath)
    rimraf.sync(tempFolderPath)
  })

  afterEach(() => {
    app.close()
  })

  describe('/version', () => {
    it('returns version and name of service from package.json', async (done) => {
      app = await createApp(SvcInfoModule)
      await app.init()
      return request(app.getHttpServer())
        .get('/svc-info/version')
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.body).toMatchObject({
            version: expect.any(String),
            name: expect.any(String),
          })
          done()
        })
    })
  })

  describe('/uptime', () => {
    it('returns human readable uptime', async (done) => {
      app = await createApp(SvcInfoModule)
      await app.init()
      return request(app.getHttpServer())
        .get('/svc-info/uptime')
        .expect(HttpStatus.OK)
        .expect((data) => {
            expect(data.text).toMatch(
              /^Uptime is \d+ days, \d+ hours, \d+ mins, \d+ secs$/,
            )
            done()
          }
        )
    })
  })

  describe('/buildstamp', () => {
    const buildstampEndpoint = '/svc-info/buildstamp'

    it('returns buildstamp by default path', async (done) => {
      app = await createApp(SvcInfoModule)
      await app.init()
      return request(app.getHttpServer())
        .get(buildstampEndpoint)
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.body).toEqual(buildstamp)
          done()
        })
    })

    it('returns buildstamp by custom path', async (done) => {
      app = await createApp(SvcInfoModule.register({ path: tempCustomBuldstampPath }))
      await app.init()
      return request(app.getHttpServer())
        .get(buildstampEndpoint)
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.body).toEqual(buildstamp)
          done()
        })
    })

    it('returns error message, when builstamp does not exist', async (done) => {
      app = await createApp(SvcInfoModule.register({ path: 'foo/bar/baz.json' }))
      await app.init()
      return request(app.getHttpServer())
        .get(buildstampEndpoint)
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.text).toEqual('required buildstamp on path foo/bar/baz.json is malformed or unreachable')
          done()
        })
    })
  })
})
