import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const src = path.join(root, 'public', 'app-icon.svg')
const outDir = path.join(root, 'resources')
const outPng = path.join(outDir, 'app-icon.png')

if (!fs.existsSync(src)) {
  throw new Error(`Missing source SVG: ${src}`)
}

fs.mkdirSync(outDir, { recursive: true })

const svg = fs.readFileSync(src, 'utf8')
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 512 }
})

const pngData = resvg.render().asPng()
fs.writeFileSync(outPng, pngData)

console.log(`Wrote ${outPng}`)

