// Bundles the WebView page (foliate-js + pdf.js + converters) into
// assets/web/, which the app copies into its storage and loads over file://.
//
//   node web/build.mjs
//
// The .js bundle is emitted with a .txt extension so Metro ships it as an
// asset instead of trying to compile it as app code.

import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'assets', 'web')
mkdirSync(out, { recursive: true })

// Reader fonts, embedded as data URIs so book iframes (blob: URLs) can use them.
const font = (family, weight, file) => `@font-face { font-family: '${family}'; font-weight: ${weight}; font-style: normal; src: url(data:font/ttf;base64,${
    readFileSync(join(root, 'assets', 'fonts', file)).toString('base64')}) format('truetype'); }`
const fontFaces = [
    font('Archivo', 500, 'Archivo_500Medium.ttf'),
    font('Archivo', 700, 'Archivo_700Bold.ttf'),
    font('JetBrains Mono', 500, 'JetBrainsMono_500Medium.ttf'),
].join('\n')

const result = await build({
    entryPoints: [join(root, 'web', 'src', 'main.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome100',
    minify: true,
    legalComments: 'none',
    loader: { '.css': 'text' },
    // Virtual module with the embedded fonts.
    plugins: [{
        name: 'fonts',
        setup(b) {
            b.onResolve({ filter: /\/fonts\.js$/ }, args => ({ path: args.path, namespace: 'fonts' }))
            b.onLoad({ filter: /.*/, namespace: 'fonts' }, () => ({
                contents: `export const FONT_FACES = ${JSON.stringify(fontFaces)}`,
                loader: 'js',
            }))
        },
    }],
    logOverride: { 'empty-import-meta': 'silent' },
    write: false,
})

const js = result.outputFiles[0].text
writeFileSync(join(out, 'engine.js.txt'), js)

// Book content is rendered in blob: iframes that inherit this CSP, so scripts
// inside books are blocked while our own bundle (a file: URL) runs.
writeFileSync(join(out, 'engine.html'), `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src file:; style-src 'unsafe-inline' blob: data:; img-src blob: data: file:; font-src blob: data:; media-src blob: data:; connect-src file: blob: data:; frame-src blob: data:; child-src blob:; object-src 'none'">
<style>
html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: transparent; -webkit-tap-highlight-color: transparent; }
foliate-view { display: block; width: 100%; height: 100%; }
foliate-view::part(filter) { filter: var(--page-filter, none); }
</style>
</head>
<body>
<script src="engine.js"></script>
</body>
</html>
`)

console.log(`web engine: ${(js.length / 1024 / 1024).toFixed(2)} MB -> assets/web/`)
