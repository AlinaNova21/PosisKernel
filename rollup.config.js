// rollup.config.js 
import typescript from 'rollup-plugin-typescript2';
import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
    entry: 'src/index.ts',
    plugins: [
        commonjs(),
        resolve({
          module: true
        }),
        typescript({
          // verbosity: 4
        })
    ],
    targets:[
      { dest: 'dist/kernel.cjs.js', format: 'cjs' },
      { dest: 'dist/kernel.es.js', format: 'es' },
    ]
}