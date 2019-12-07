#!/bin/sh

npm run bundle

cp node_modules/@influxdata/flux-lsp-node/flux-lsp-node_bg.wasm out/
cp node_modules/@influxdata/flux-lsp-node/flux-lsp-node_bg.js out/
cp node_modules/@influxdata/flux-lsp-node/flux-lsp-node.js out/
