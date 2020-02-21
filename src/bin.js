#!/usr/bin/env node

const fs = require('fs')

const yargs = require('yargs')
const CLI = require('./cli')

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

const cli = CLI.new(argv)

if (argv['log-file'] && argv['log-file'] !== '') {
  const stream = fs.createWriteStream(argv['log-file'], { encoding: 'utf8' })

  cli.on('log', (msg) => {
    stream.write(msg)
  })
}

process.stdin
  .pipe(cli.createStream())
  .pipe(process.stdout)
