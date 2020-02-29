const CLI = require('../src/cli')
const expect = require('expect')

describe('CLI', () => {
  it('can be initialized', () => {
    const cli = new CLI({})

    expect(cli).toBeInstanceOf(CLI)
  })

  it('emits logging events', (done) => {
    const cli = new CLI({})

    cli.once('log', (msg) => {
      expect(msg).toEqual('hello')
      done()
    })

    cli.log('hello')
  })
})
