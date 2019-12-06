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
  .option('ipc', {
    type: 'boolean',
    describe: 'use ipc for transport',
    default: false
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

const respond = (data) => {
  if (argv.ipc) {
    const lines = data.split('\n')
    if (lines.length === 3) {
      process.send(JSON.parse(lines[2]))
    }
  } else {
    process.stdout.write(data)
  }
}

const handleInput = (data) => {
  let input = data

  if (argv.ipc) {
    input = `\n\n${JSON.stringify(input)}`
  }

  log(`REQUEST: ${input}\n`)

  const resp = server.process(input)

  const msg = resp.get_message()
  if (msg) {
    log(`RESPONSE: ${msg}\n`)
    respond(msg)
  }

  const err = resp.get_error()
  if (err) {
    log(`ERROR: ${err}\n`)
  }
}

if (argv.ipc) {
  process.on('message', handleInput)
} else {
  process.stdin.on('data', handleInput)
}
