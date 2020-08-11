import * as path from 'path'
import * as fs from 'fs'
import * as winston from 'winston'

const {
  createLogger,
  transports: { Console, File },
  format: { combine, printf, timestamp },
}: any = winston

const formatJson = printf(
  ({
    level,
    timestamp,
    meta,
    message,
  }: {
    level: string
    timestamp: unknown
    meta: Record<string, any>
    message: unknown
  }) => {
    const data = {
      '@timestamp': timestamp,
      level: level.toUpperCase(),
      message,
      ...meta.publicMeta,
    }

    return JSON.stringify(data)
  },
)

type TWinstonFactoryOpts = {
  level: string
  dir: string
  maxsize: number
  appJsonFilename: string
  zippedArchive: boolean
  tailable: boolean
  maxFiles: number
  [key: string]: any
}

function createConsoleAppender() {
  return new Console({
    format: combine(timestamp(), formatJson),
  })
}

function createFileAppender({
  dir,
  maxsize,
  appJsonFilename,
  zippedArchive,
  tailable,
  maxFiles,
}: TWinstonFactoryOpts) {
  if (!dir) {
    return
  }

  const dirname = path.resolve(dir)

  try {
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(`${dirname}`)
    }
  } catch (e) {
    console.error(e)
  }

  return new File({
    dirname,
    filename: appJsonFilename,
    format: combine(timestamp(), formatJson),
    maxsize,
    zippedArchive,
    tailable,
    maxFiles,
  })
}

export function createTransports(opts: TWinstonFactoryOpts) {
  const transports = [createConsoleAppender(), createFileAppender(opts)]
  return transports.filter(Boolean)
}

export default function getWinstonLogger(opts: TWinstonFactoryOpts) {
  return createLogger({
    level: opts.level,
    exitOnError: false,
    transports: createTransports(opts),
  })
}
