import * as buildInfo from '../../../main/ts/bin/build-info'

describe('cli', () => {
  it('calls createBuildInfo', () => {
    const spy = jest.spyOn(buildInfo, 'createBuildInfo')

    require('../../../main/ts/bin/cli')
    expect(spy).toHaveBeenCalled()
  })
})
