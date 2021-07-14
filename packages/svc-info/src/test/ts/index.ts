import { HttpStatus, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import {
  createMetaPipe,
  LoggerModule,
  maskerLoggerPipeFactory,
} from '@qiwi/nestjs-enterprise-logger'
import fs from 'fs'
import path, { resolve } from 'path'
import rimraf from 'rimraf'
import request from 'supertest'

import { ISvcInfoModuleOpts, SvcInfoModule } from '../../main/ts'

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
jest.setTimeout(10000);

const moduleFactory = (opts?: ISvcInfoModuleOpts) => {
  return Test.createTestingModule({
    imports: [
      ConfigModule,
      LoggerModule.register(createMetaPipe(), maskerLoggerPipeFactory()),
      opts ? SvcInfoModule.register(opts) : SvcInfoModule,
    ],
  })
    .overrideProvider('IConfigService')
    .useValue(fakeConfig)
    .compile()
}

describe('SvcModule', () => {
  beforeAll(async () => {
    fs.writeFileSync(buildstampPath, JSON.stringify(buildstamp))
    fs.mkdirSync(tempFolderPath, { recursive: true })
    fs.writeFileSync(tempCustomBuldstampPath, JSON.stringify(buildstamp))
    jest.setTimeout(10000)
  })

  afterAll(() => {
    fs.unlinkSync(buildstampPath)
    rimraf.sync(tempFolderPath)
  })

  describe('/version', () => {
    it('returns version and name of service from package.json', async () => {
      const module = await moduleFactory({ packagePath: resolve(__dirname, './mock/package.json') })
      const app = module.createNestApplication()
      await app.init()
      app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
      await request(app.getHttpServer())
        .get('/svc-info/version')
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.body).toMatchObject({
            version: expect.any(String),
            name: expect.any(String),
          })
        })
      return app.close()
    })
  })

  describe('/uptime', () => {
    it('returns human readable uptime', async () => {
      const module = await moduleFactory()
      const app = module.createNestApplication()
      await app.init()
      await request(app.getHttpServer())
        .get('/svc-info/uptime')
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.text).toMatch(
            /^Uptime is \d+ days, \d+ hours, \d+ mins, \d+ secs$/,
          )
        })
      return app.close()
    })
  })

  describe('/buildstamp', () => {
    const buildstampEndpoint = '/svc-info/buildstamp'

    it('returns buildstamp by default path', async () => {
      const module = await moduleFactory()
      const app = module.createNestApplication()
      await app.init()
      await request(app.getHttpServer())
        .get(buildstampEndpoint)
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.body).toEqual(buildstamp)
        })
      return app.close()
    })

    it('returns buildstamp by custom path', async () => {
      const module = await moduleFactory({ path: tempCustomBuldstampPath })
      const app = module.createNestApplication()
      await app.init()
      await request(app.getHttpServer())
        .get(buildstampEndpoint)
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.body).toEqual(buildstamp)
        })
      return app.close()
    })

    it('returns error message, when builstamp does not exist', async () => {
      const module = await moduleFactory({ path: 'foo/bar/baz.json' })
      const app = module.createNestApplication()
      await app.init()
      await request(app.getHttpServer())
        .get(buildstampEndpoint)
        .expect(HttpStatus.OK)
        .expect((data) => {
          expect(data.text).toEqual(
            'required buildstamp on path foo/bar/baz.json is malformed or unreachable',
          )
        })
      return app.close()
    })
  })
})
