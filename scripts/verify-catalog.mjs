import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import products from '../src/data/products.json' with { type: 'json' }
import { categories } from '../src/data/categories.js'

const ids = new Set()
const categoryCounts = new Map(categories.map(category => [category, 0]))
const missing = []
for (const product of products) {
  if (ids.has(product.id)) throw new Error(`Duplicate product id: ${product.id}`)
  ids.add(product.id)
  if (!categories.includes(product.category)) throw new Error(`Unknown product category: ${product.category}`)
  if (product.price !== null) throw new Error(`Unverified catalog price must remain null: ${product.id}`)
  if ('brand' in product) throw new Error(`Catalog item includes an unverified brand field: ${product.id}`)
  if (product.name !== `${product.category} item ${product.id.split('-').at(-1)}`) throw new Error(`Product name contains non-neutral claims: ${product.id}`)
  categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1)
  try {
    await access(fileURLToPath(new URL(`../public${product.image}`, import.meta.url)))
  } catch {
    missing.push(product.image)
  }
}
if (missing.length) {
  console.error(`Missing image files (${missing.length}):`)
  for (const image of missing.slice(0, 50)) console.error(image)
  process.exitCode = 1
} else {
  console.log(`Verified ${products.length} unique catalog items and all local image paths.`)
}
for (const [category, count] of categoryCounts) console.log(`${category}: ${count}`)
