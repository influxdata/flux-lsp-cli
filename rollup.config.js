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
    commonjs()
  ],
  external: ['fs', 'util', 'path'],
  onwarn (warning, rollupWarn) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      rollupWarn(warning)
    }
  }
}
