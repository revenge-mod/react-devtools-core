import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import define from 'rollup-plugin-define';
import commonJs from '@rollup/plugin-commonjs';
import rdtPkg from './node_modules/react-devtools-core/package.json' with { type: 'json' };

export default {
    input: 'index.js',
    output: {
        file: 'dist/index.js',
        format: 'iife',
        compact: true,
        intro: "var window = globalThis, self = globalThis, console = new Proxy({}, { get: () => () => void 0 })"
    },
    plugins: [
        nodeResolve(),
        commonJs(),
        define({
            replacements: {
                __RDTC_VERSION: `"${rdtPkg.version}"`
            }
        }),
        esbuild({ minify: true })
    ]
};