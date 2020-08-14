const { argv } = require('yargs')
const { createBuildInfo } = require('./index')

const run = () => {
  const { ci, out } = argv
  createBuildInfo(ci, out)
}

run()
