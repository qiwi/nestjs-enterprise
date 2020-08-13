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

const createBuildInfo = () => {
  try {
    const generateBuildInfo = process.BUILD_INFO || process.env.CI || process.env.TEAMCITY_VERSION

    if (generateBuildInfo) {
      fs.writeFileSync(
        `${process.cwd()}/build-info.json`,
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

createBuildInfo()
