import { buildSync } from 'esbuild'
import { dependencies } from './package.json' with { type: 'json' }

buildSync({
    entryPoints: ['index.js'],
    outfile: 'dist/index.js',
    bundle: true,
    format: 'iife',
    minify: true,
    minifyIdentifiers: false,
    define: {
        __RDTC_VERSION: `"${dependencies['react-devtools-core']}"`
    },
    banner: {
        js: "var window=globalThis,self=globalThis,console=new Proxy({},{get:()=>()=>void 0});"
    }
})