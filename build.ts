import { transform } from '@swc/core'
import { type OutputChunk, type RolldownPlugin, rolldown } from 'rolldown'
import rdtPkg from './node_modules/react-devtools-core/package.json' with { type: 'json' }

const bundle = await rolldown({
    input: 'index.js',
    platform: 'neutral',
    experimental: {
        strictExecutionOrder: true,
    },
    resolve: {
        tsconfigFilename: 'tsconfig.json',
    },
    treeshake: true,
    keepNames: true,
    moduleTypes: {
        '.webp': 'dataurl',
    },
    define: {
        __RDT_VERSION: rdtPkg.version,
    },
    plugins: [
        swcPlugin(),
        hermesCPlugin({
            flags: ['-O', '-eager', '-finline', '-fno-static-require', '-Wno-direct-eval', '-Wno-undefined-variable'],
        }),
    ],
})

await bundle.write({
    file: 'dist/index.js',
    format: 'iife',
    intro: 'var window = globalThis, self = globalThis, console = new Proxy({}, { get: () => () => undefined })',
    footer: '//# sourceURL=RevengeReactDevTools',
    inlineDynamicImports: true,
})

function swcPlugin() {
    return {
        name: 'swc',
        transform: {
            filter: {
                id: /\.[cm]?[jt]sx?$/,
            },
            handler(code) {
                return transform(code, {
                    jsc: {
                        transform: {
                            react: {
                                runtime: 'automatic',
                            },
                        },
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                        },
                    },
                    env: {
                        // https://github.com/discord/hermes/blob/main/doc/Features.md
                        targets: 'fully supports es6',
                        include: [
                            'transform-async-generator-functions',
                            'transform-block-scoping',
                            'transform-classes',
                            'transform-duplicate-named-capturing-groups-regex',
                            'transform-named-capturing-groups-regex',
                        ],
                        exclude: [
                            // Async functions are supported, only async arrow functions aren't
                            // Source: https://github.com/facebook/hermes/issues/1395
                            'transform-async-to-generator',
                            'transform-exponentiation-operator',
                            'transform-logical-assignment-operators',
                            'transform-nullish-coalescing-operator',
                            'transform-numeric-separator',
                            'transform-object-rest-spread',
                            'transform-optional-catch-binding',
                            'transform-optional-chaining',
                            'transform-parameters',
                            'transform-template-literals',
                        ],
                    },
                })
            },
        },
    } satisfies RolldownPlugin
}

function hermesCPlugin({ flags }: { flags?: string[] } = {}) {
    const paths = {
        win32: 'hermesc.exe',
        darwin: 'darwin/hermesc',
        linux: 'linux/hermesc',
    }

    if (!(process.platform in paths)) throw new Error(`Unsupported platform: ${process.platform}`)

    const binPath = paths[process.platform as keyof typeof paths]

    return {
        name: 'hermesc',
        generateBundle(_, bundle) {
            const file = bundle['index.js'] as OutputChunk
            if (!file || !file.code) throw new Error('No code to compile')

            const cmd = Bun.spawnSync(
                [
                    `./node_modules/@unbound-mod/hermesc/${process.platform}/${binPath}`,
                    '-emit-binary',
                    ...(flags ?? []),
                ],
                {
                    stdin: new Blob([file.code]),
                    stdout: 'pipe',
                },
            )

            const buf = cmd.stdout
            if (!buf.length) throw new Error('No output from hermesc')

            this.emitFile({
                type: 'asset',
                fileName: `${file.fileName.split('.')[0]!}.bundle`,
                source: buf,
            })
        },
    } satisfies RolldownPlugin
}
