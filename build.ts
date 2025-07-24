import { transform } from '@swc/core'
import { existsSync } from 'fs'
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
    define: {
        __RDT_VERSION: JSON.stringify(rdtPkg.version),
    },
    plugins: [
        swcPlugin(),
        hermesCPlugin({
            flags: ['-O', '-finline', '-fno-static-require', '-Wno-direct-eval', '-Wno-undefined-variable'],
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

async function hermesCPlugin({
    after,
    before,
    flags,
}: {
    flags?: string[]
    before?: (v: string) => void
    after?: (v: string) => void
} = {}) {
    const paths = {
        win32: 'win64-bin/hermesc.exe',
        darwin: 'osx-bin/hermesc',
        linux: 'linux64-bin/hermesc',
    }

    if (!(process.platform in paths))
        throw new Error(`Unsupported platform: ${process.platform}`)

    const sdksDir = './node_modules/react-native/sdks'
    const binPath = `${sdksDir}/hermesc/${paths[process.platform as keyof typeof paths]}`

    if (!existsSync(binPath))
        throw new Error(
            `Hermes compiler not found at ${binPath}. Please ensure you have react-native installed.`,
        )

    const ver = await Bun.file(`${sdksDir}/.hermesversion`).text()

    return {
        name: 'hermesc',
        generateBundle(_, bundle) {
            if (before) before(ver)

            const file = bundle['index.js'] as OutputChunk
            if (!file || !file.code) throw new Error('No code to compile')

            const cmdlist = [binPath, '-emit-binary', ...(flags ?? [])]

            const cmd = Bun.spawnSync<'pipe', 'pipe'>(cmdlist, {
                // @ts-expect-error: Types are incorrect, but this works
                stdin: new Blob([file.code]),
                stdout: 'pipe',
            })

            if (cmd.exitCode) {
                if (cmd.stderr.length)
                    throw new Error(
                        `Got error from hermesc: ${cmd.stderr.toString()}`,
                    )
                else
                    throw new Error(`hermesc exited with code: ${cmd.exitCode}`)
            }

            const buf = cmd.stdout
            if (!buf.length)
                throw new Error(
                    `No output from hermesc. Probably a compilation error.\nTry running the command manually: ${cmdlist.join(' ')}`,
                )

            this.emitFile({
                type: 'asset',
                fileName: `${file.fileName.split('.')[0]!}.bundle`,
                source: buf,
            })

            if (after) after(ver)
        },
    } satisfies RolldownPlugin
}