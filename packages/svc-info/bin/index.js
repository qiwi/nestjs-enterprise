#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

const getGitInfo = () => {
  const rev = fs
    .readFileSync(`${process.cwd()}/.git/HEAD`)
    .toString()
    .trim()

  const commitId = !rev.includes(':')
    ? rev
    : fs
      .readFileSync(`${process.cwd()}/.git/` + rev.substring(5))
      .toString()
      .trim()

  const repoName = fs
    .readFileSync(`${process.cwd()}/.git/config`)
    .toString()
    .split('\n')
    .filter((line) => /\turl =/.exec(line))
    .reduce((acc, line) => acc + line.split('/').slice(-2).join('/'), '')

  return {
    commitId,
    repoName,
  }
}

const createBuildInfo = (generateBuildInfo, outputFile = `${process.cwd()}/build-info.json`) => {
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
