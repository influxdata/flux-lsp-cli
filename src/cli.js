const { EventEmitter } = require('events')

const through = require('through2')
const { Server } = require('@influxdata/flux-lsp-node')
const Client = require('./client')

class CLI extends EventEmitter {
  constructor (args) {
    super()

    this.args = args
    this.server = new Server(this.args['disable-folding'], false)
    this.client = new Client(args.url, args.token, args.org)

    this.client.on('log', (msg) => this.log(msg))

    this.getBuckets = this.getBuckets.bind(this)
    this.getMeasurements = this.getMeasurements.bind(this)
    this.getTagKeys = this.getTagKeys.bind(this)

    this.server.register_measurements_callback(this.getMeasurements)
    this.server.register_buckets_callback(this.getBuckets)
    this.server.register_tag_keys_callback(this.getTagKeys)
  }

  static new (args) {
    return new CLI(args)
  }

  log (msg) {
    this.emit('log', `\n${msg.toString()}\n`)
  }

  async getBuckets () {
    return await this.client.getBuckets()
  }

  async getMeasurements (bucket) {
    return await this.client.getMeasurements(bucket)
  }

  async getTagKeys (bucket) {
    return await this.client.getTagKeys(bucket)
  }

  createStream () {
    const instance = this
    let cache = ''
    return through(function (data, _enc, cb) {
      const input = data.toString()

      instance.log(`Input: ${input}\n`)

      cache += input

      instance.log(`CACHE: ${cache.split('\n').length} ${JSON.stringify(cache)}`)

      if (cache.split('\n').length < 3 || cache.split('\r\n')[2] === '') {
        return cb()
      }

      instance.log(`REQUEST: ${cache}\n`)

      instance.server.process(cache).then((resp) => {
        cache = ''
        const msg = resp.get_message()
        if (msg) {
          instance.log(`RESPONSE: ${msg}\n`)
          this.push(msg)
        }

        const err = resp.get_error()
        if (err) {
          instance.log(`ERROR: ${err}\n`)
        }
      }).catch(() => {
        instance.log('Unknown error has occured')
      }).finally(() => {
        cb()
      })
    })
  }
}

module.exports = CLI
