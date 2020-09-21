import meow from 'meow'
import { createBuildInfo } from './build-info'

const cli = meow(`
    Options
      --ci, generates file with build info, if true
      --out, path to generated file with build info
`, {
  flags: {
    out: {
      type: 'string',
    },
    ci: {
      type: 'boolean'
    }
  }
});

const run = () => {
  createBuildInfo(cli.flags)
}

run()
