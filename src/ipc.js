const { Server } = require('@influxdata/flux-lsp-node')

const server = new Server(true)

process.on('message', (data) => {
  const input = data.toString()

  const resp = server.process(input)
  const msg = resp.get_message()

  if (msg) {
    process.send(msg)
  }
})
