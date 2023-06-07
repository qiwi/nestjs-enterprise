import safeJsonStrinify from 'fast-safe-stringify'
import {existsSync, mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import * as winston from 'winston'

export type TWinstonEntry = {
  level: string
  timestamp: unknown
  meta: Record<string, any>
  message: unknown
}

const {
  createLogger,
  transports ,
  format ,
}: any = winston
const { Console, File } = transports
const { combine, printf, timestamp } = format

const isTimestampValid = (timestamp: any) =>
  typeof timestamp === 'number' || Date.parse(timestamp)

export const formatKibanaEntry = (entry: TWinstonEntry) => {
  const { level, timestamp, meta, message } = entry
  const { timestamp: metaTimestamp, publicMeta } = meta
  const formattedTimestamp = new Date(
    (isTimestampValid(metaTimestamp) && metaTimestamp) || timestamp,
  ).toISOString()
  return {
    '@timestamp': formattedTimestamp,
    level: level.toUpperCase(),
    message,
    ...publicMeta,
  }
}

const formatJson = printf((entry: TWinstonEntry) =>
  safeJsonStrinify(formatKibanaEntry(entry)),
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

  const dirname = resolve(dir)

  try {
    if (!existsSync(dirname)) {
      mkdirSync(`${dirname}`)
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
