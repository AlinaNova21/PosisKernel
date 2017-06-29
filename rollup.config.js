// rollup.config.js 
import typescript from 'rollup-plugin-typescript2';

export default {
    entry: 'src/index.ts',
    plugins: [
        typescript({
          // verbosity: 4
        })
    ],
    targets:[
      { dest: 'dist/kernel.cjs.js', format: 'cjs' },
      { dest: 'dist/kernel.es.js', format: 'es' },
    ]
}