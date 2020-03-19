const { EventEmitter } = require('events')

const through = require('through2')
const { Server } = require('@influxdata/flux-lsp-node')

class CLI extends EventEmitter {
  constructor (args) {
    super()

    this.args = args
    this.server = new Server(this.args['disable-folding'], false)
  }

  static new (args) {
    return new CLI(args)
  }

  log (msg) {
    this.emit('log', msg.toString())
  }

  createStream () {
    const instance = this
    return through(function (data, _enc, cb) {
      const input = data.toString()

      instance.log(`REQUEST: ${input}\n`)

      instance.server.process(input).then((resp) => {
        const msg = resp.get_message()
        if (msg) {
          instance.log(`RESPONSE: ${msg}\n`)
          this.push(msg)
        }

        const err = resp.get_error()
        if (err) {
          instance.log(`ERROR: ${err}\n`)
        }

        cb()
      }).catch(() => {
        instance.log('Unknown error has occured')
      })
    })
  }

  registerBucketsCallback (f) {
    this.server.register_buckets_callback(f)
  }
}

module.exports = CLI
