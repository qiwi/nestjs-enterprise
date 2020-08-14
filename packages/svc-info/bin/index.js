#!/usr/bin/env node
const fs = require('fs') // eslint-disable-line @typescript-eslint/no-var-requires
const findGitRoot = require('find-git-root') // eslint-disable-line @typescript-eslint/no-var-requires

const gitFolder = findGitRoot(process.cwd())

const getGitInfo = () => {
  const rev = fs
    .readFileSync(`${gitFolder}/HEAD`)
    .toString()
    .trim()

  const commitId = !rev.includes(':')
    ? rev
    : fs
      .readFileSync(`${gitFolder}/` + rev.substring(5))
      .toString()
      .trim()

  const repoName = fs
    .readFileSync(`${gitFolder}/config`)
    .toString()
    .split('\n')
    .filter((line) => /\turl =/.exec(line))
    .reduce((acc, line) => acc + line.split('/').slice(-2).join('/'), '')

  return {
    commitId,
    repoName,
  }
}

const createBuildInfo = (cliArgs, env = process.env) => {
  const generateBuildInfo = cliArgs.ci || env.CI
  const outputFile = cliArgs.out || env.BUILD_INFO_FILE_PATH || `${process.cwd()}/build-info.json`
  try {
    if (generateBuildInfo) {
      fs.writeFileSync(
        outputFile,
        JSON.stringify({
          imageTag: process.env.IMAGE_TAG,
          timestamp: new Date().toISOString(),
          gitInfo: getGitInfo(),
        }),
      )

      console.log('build-info.json was created')
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  createBuildInfo
}
