#!/usr/bin/env node

const fs = require('fs')
const { Server } = require('@influxdata/flux-lsp-node')
const yargs = require('yargs')

const argv = yargs
  .option('disable-folding', {
    default: false,
    describe: 'some editors have built-in folding, this allows you to disable lsp based folding',
    type: 'boolean'
  })
  .option('log-file', {
    alias: 'l',
    type: 'string',
    describe: 'debug log file path'
  })
  .argv

let log = () => { }

const logfile = argv['log-file']
if (logfile && logfile !== '') {
  const stream = fs.createWriteStream(logfile, { encoding: 'utf8' })

  log = (msg) => {
    stream.write(msg)
  }
}

const server = new Server(argv['disable-folding'])

process.stdin.on('data', (data) => {
  const input = data.toString()

  log(`REQUEST: ${input}`)

  const resp = server.process(input)
  const msg = resp.get_message()

  if (msg) {
    log(`RESPONSE: ${msg}`)
    process.stdout.write(msg)
  }
})
