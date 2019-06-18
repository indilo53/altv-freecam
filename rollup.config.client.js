import path from 'path';
import autoExternal from 'rollup-plugin-auto-external';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';
import { terser } from "rollup-plugin-terser";

export default {
  input: path.resolve(__dirname, './src/client/index.js'),
  output: {
    file: 'dist/client.bundle.js',
    format: 'cjs'
  },
  plugins: [
    builtins(),
    autoExternal({
      builtins: false,
      dependencies: true,
      packagePath: path.resolve('./src/server/package.json'),
      peerDependencies: false,
    }),
    resolve(),
    json(),
    terser(),
  ],
};

