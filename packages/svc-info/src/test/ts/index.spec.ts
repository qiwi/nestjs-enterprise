import { deepEqual, equal, match } from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ConfigModule } from '@qiwi/nestjs-enterprise-config'
import {
  createMetaPipe,
  LoggerModule,
  maskerLoggerPipeFactory,
} from '@qiwi/nestjs-enterprise-logger'

import { HttpStatus, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { sync } from 'rimraf'
import request from 'supertest'

import { ISvcInfoModuleOpts, SvcInfoModule } from '../../main/ts'

const buildstamp = {
  date: 1_600_692_101_204,
  git: {
    commitId: '1234567890123456789012345678901234567890',
    repoUrl: 'http://localhost',
    repoName: 'foo/bar',
  },
  docker: {
    imageTag: 'baz',
  },
}

const buildstampPath = path.join(process.cwd(), 'buildstamp.json')
const tempFolderPath = path.join(process.cwd(), 'some')
const tempCustomBuildstampPath = path.join(tempFolderPath, 'foo.json')

const toMatchObjectTypes = (
  actual: Record<string, any>,
  expected: Record<string, string>,
) => {
  for (const key of Object.keys(expected)) {
    if (!actual[key]) console.error('exist', key)
    equal(typeof actual[key], expected[key])
  }
}

const fakeConfig = {
  get: (field: 'name' | 'logger' | 'version' | 'local') => {
    const configData = {
      name: 'test-name-app2',
      local: '',
      version: '1',
      logger: {
        dir: path.join(
          path.dirname(fileURLToPath(import.meta.url)),
          '..',
          'ts',
          'log',
        ),
        level: 'debug',
        maxsize: 157_286_400,
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
  before(async () => {
    fs.writeFileSync(buildstampPath, JSON.stringify(buildstamp))
    fs.mkdirSync(tempFolderPath, { recursive: true })
    fs.writeFileSync(tempCustomBuildstampPath, JSON.stringify(buildstamp))
  })

  after(() => {
    fs.unlinkSync(buildstampPath)
    sync(tempFolderPath)
  })

  describe('/version', () => {
    it('returns version and name of service from package.json', async () => {
      const module = await moduleFactory({
        package: { version: '0.0.0', name: 'test' },
      })
      const app = module.createNestApplication()
      await app.init()
      app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
      await request(app.getHttpServer())
        .get('/svc-info/version')
        .expect(HttpStatus.OK)
        .expect((data) => {
          toMatchObjectTypes(data.body, {
            version: 'string',
            name: 'string',
          })
        })
      await app.close()
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
          match(
            data.text,
            /^Uptime is \d+ days, \d+ hours, \d+ mins, \d+ secs$/,
          )
        })
      await app.close()
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
          deepEqual(data.body, buildstamp)
        })
      await app.close()
    })

    it('returns buildstamp by custom path', async () => {
      const module = await moduleFactory({ path: tempCustomBuildstampPath })
      const app = module.createNestApplication()
      await app.init()
      await request(app.getHttpServer())
        .get(buildstampEndpoint)
        .expect(HttpStatus.OK)
        .expect((data) => {
          deepEqual(data.body, buildstamp)
        })
      await app.close()
    })

    it('returns error message, when builstamp does not exist', async () => {
      const module = await moduleFactory({ path: 'foo/bar/baz.json' })
      const app = module.createNestApplication()
      await app.init()
      await request(app.getHttpServer())
        .get(buildstampEndpoint)
        .expect(HttpStatus.OK)
        .expect((data) => {
          equal(
            data.text,
            'required buildstamp on path foo/bar/baz.json is malformed or unreachable',
          )
        })
      await app.close()
    })
  })
})
