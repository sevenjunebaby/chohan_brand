import { readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import products from '../src/data/products.json' with { type: 'json' }

const distRoot = path.resolve('dist/images/products')
const referenced = new Set(products.map(product => decodeURIComponent(product.image.slice('/images/products/'.length))))
let removedFiles = 0
let removedBytes = 0

async function prune(directory, relative = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const relativePath = path.posix.join(relative, entry.name)
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await prune(fullPath, relativePath)
      if ((await readdir(fullPath)).length === 0) await rm(fullPath, { recursive: true })
    } else if (entry.isFile() && !referenced.has(relativePath)) {
      removedBytes += (await stat(fullPath)).size
      await rm(fullPath)
      removedFiles++
    }
  }
}

await prune(distRoot)
console.log(`Pruned ${removedFiles} unused catalog source files (${(removedBytes / 1024 / 1024).toFixed(1)} MiB) from dist; source files were left untouched.`)
