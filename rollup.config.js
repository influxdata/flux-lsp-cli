const { preserveShebangs } = require('rollup-plugin-preserve-shebangs')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

module.exports = {
  input: 'src/bin.js',
  output: {
    file: 'out/bundle.js',
    format: 'cjs'
  },
  plugins: [
    preserveShebangs(),
    resolve({
      preferBuiltins: true
    }),
    commonjs({
      ignore: ['./flux-lsp-node.js']
    })
  ],
  external: ['fs', 'util', 'path'],
  onwarn (warning, warn) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      warn(warning)
    }
  }
}
