const axios = require('axios')
const { EventEmitter } = require('events')

class Client extends EventEmitter {
  constructor (url, token, org) {
    super()
    this.url = url
    this.token = token
    this.org = org
  }

  async getBuckets () {
    const query = 'buckets()'
    const response = await this.runQuery(query)
    if (!response) {
      return []
    }

    return this.parse(response)
  }

  async getMeasurements (bucket) {
    const query = `import "influxdata/influxdb/v1"
      v1.measurements(bucket:"${bucket}")`
    const response = await this.runQuery(query)
    if (!response) {
      return []
    }

    return this.parse(response)
  }

  async getTagKeys (bucket) {
    const query = `import "influxdata/influxdb/v1"
    v1.tagKeys(bucket:"${bucket}"")`
    const response = await this.runQuery(query)
    if (!response) {
      return []
    }

    return this.parse(response)
  }

  async getTagValues (bucket, tag) {
    const query = `
      import "influxdata/influxdb/v1"
      v1.tagValues(bucket: "${bucket}", tag: "${tag}")
    `

    const response = await this.runQuery(query)
    if (!response) {
      return []
    }

    return this.parse(response)
  }

  async runQuery (query) {
    if (!this.url || !this.token || !this.org) {
      this.emit('log', 'no database configured')
      return
    }

    try {
      const dialect = {
        annotations: ['group', 'datatype', 'default']
      }

      this.emit('log', `attempting ${query}`)

      const { data } = (await axios({
        method: 'POST',
        url: `${this.url}/api/v2/query?org=${encodeURI(this.org)}`,
        data: {
          type: 'flux',
          query,
          dialect
        },
        maxContentLength: Infinity,
        headers: {
          Authorization: `Token ${this.token}`
        }
      }))

      this.emit('log', JSON.stringify(data))

      return data
    } catch (e) {
      this.emit('log', `failed to query database with ${query} ${e}`)
    }
  }

  parse (body) {
    const accum = []
    return body.split(/\r?\n\r?\n/)
      .filter(v => v) // kill the blank lines
      .reduce((acc, group) => {
        const rows = group
          .split('\n')
          .filter(v => !v.startsWith('#') && v)
          .slice(1)
          .map(v => v.split(',').slice(3)[0])
        this.emit('log', JSON.stringify(rows))

        return acc.concat(...rows)
      }, accum)
  }
}

module.exports = Client
