#!/usr/bin/env node
import { execute } from 'buildstamp'

type TCliArguments = {
  ci?: boolean
  out?: string
}

export const createBuildInfo = (cliArgs: TCliArguments, env = process.env) => {
  const generateBuildInfo = cliArgs.ci ?? (env.CI || env.TEAMCITY_VERSION)
  const outputFile = cliArgs.out || env.BUILD_INFO_FILE_PATH || `${process.cwd()}/build-info.json`
  if (generateBuildInfo) {
    execute(
      {
        git: true,
        date: { format: 'iso' },
        docker: { imageTag: process.env.IMAGE_TAG },
        out: {
          path: outputFile
        }
      },
      {}
    )
  }
}
