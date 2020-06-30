'use strict';

const findGitRoot = require('find-git-root')
const { resolve } = require('path')

const {
  mkdirSync,
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync
} = require('fs')

const ROOT = resolve(findGitRoot(), '..')
const PACKAGES_ROOT = resolve(ROOT, 'packages')
const COV_DIR = 'coverage'
const COV_FINAL = 'coverage-final.json'
const LCOV = 'lcov.info'

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => resolve(source, dirent.name))

const read = (file, cb) => {
  if (existsSync(file)) {
    const data = readFileSync(file, { encoding: 'utf-8' })

    try {
      cb(data)

    } catch (e) {
      console.warn(e)
    }
  }
}

const write = (dir, name, data) => {
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, name), data)
}

const mergeCoverage = () => {
  let lcov = ''
  const covFinal = {}
  const packages = getDirectories(PACKAGES_ROOT)

  packages.forEach(pack => {
    read(resolve(pack, COV_DIR, COV_FINAL), data => Object.assign(covFinal, JSON.parse(data)))
    read(resolve(pack, COV_DIR, LCOV), data => {lcov = lcov + data})
  })

  write(resolve(ROOT, COV_DIR), LCOV, lcov)
  write(resolve(ROOT, COV_DIR), COV_FINAL, JSON.stringify(covFinal))
}

mergeCoverage()
