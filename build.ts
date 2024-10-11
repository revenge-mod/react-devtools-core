import { buildSync } from 'esbuild'
import { version } from './node_modules/react-devtools-core/package.json' with { type: 'json' }

buildSync({
    entryPoints: ['index.js'],
    outfile: 'dist/index.js',
    bundle: true,
    format: 'iife',
    minify: true,
    define: {
        __RDTC_VERSION: `"${version}"`
    }
})
