import { createReadStream } from 'node:fs'
import { createHash } from 'node:crypto'
import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('public/images/products')
const productOutput = path.resolve('src/data/products.json')
const categoryOutput = path.resolve('src/data/categories.js')
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp', '.tif', '.tiff'])
const categoryLabels = new Map([
  ['belt-bags', 'Belt Bags'],
  ['summer-wearing', 'Summer Wearing'],
  ['t- shirts', 'T-Shirts'],
])

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const results = []
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...await walk(fullPath))
    else if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) results.push(fullPath)
  }
  return results
}

function labelFor(directory) {
  const key = directory.trim().toLowerCase()
  if (categoryLabels.has(key)) return categoryLabels.get(key)
  return directory.trim().replace(/\s+/g, ' ')
}

async function sha256(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

function urlPath(file) {
  return `/${path.relative(path.resolve('public'), file).split(path.sep).map(encodeURIComponent).join('/')}`
}

const files = (await walk(root)).sort((a, b) => path.relative(root, a).localeCompare(path.relative(root, b), 'en'))
// Omit these known category mismatches from the catalog if they are reintroduced:
// a floor-length dress in T-Shirts, two knit hats and a beanie in Coats, and a scarf in Coats.
const excludedCategoryMismatch = new Set([
  'T- Shirts/1000044793.jpg',
  'Coats/Balenciaga coats/IMG-20221223-WA0042.jpg',
  'Coats/Balenciaga coats/IMG-20221223-WA0045.jpg',
  'Coats/Dior Coats/IMG-20211219-WA0061.jpg',
  'Coats/YSL coats/IMG-20221209-WA0030.jpg',
])
const topLevel = await readdir(root, { withFileTypes: true })
const categories = topLevel.filter(e => e.isDirectory()).map(e => ({ folder: e.name, name: labelFor(e.name) })).sort((a, b) => a.name.localeCompare(b.name, 'en'))
const counts = new Map(categories.map(c => [c.name, 0]))
const seenHashes = new Set()
const products = []
let duplicateCopies = 0
for (const file of files) {
  const relative = path.relative(root, file)
  if (excludedCategoryMismatch.has(relative.split(path.sep).join('/'))) continue
  const hash = await sha256(file)
  if (seenHashes.has(hash)) { duplicateCopies++; continue }
  seenHashes.add(hash)
  const folder = relative.split(path.sep)[0]
  const category = labelFor(folder)
  const index = (counts.get(category) || 0) + 1
  counts.set(category, index)
  const idPrefix = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  products.push({
    id: `${idPrefix}-${String(index).padStart(4, '0')}`,
    // Avoid making brand, model, or attribute claims from unverified filenames.
    name: `${category} item ${String(index).padStart(4, '0')}`,
    category,
    image: urlPath(file),
    price: null,
  })
}

await writeFile(productOutput, `${JSON.stringify(products)}\n`)
await writeFile(categoryOutput, `// Generated from top-level directories in public/images/products.\nexport const categories = ${JSON.stringify(categories.map(c => c.name), null, 2)}\n`)

console.log(`Generated ${products.length} image catalog entries across ${categories.length} categories.`)
console.log(`Skipped ${duplicateCopies} byte-identical duplicate image copies.`)
console.log(`Skipped ${excludedCategoryMismatch.size} confirmed category mismatch: ${[...excludedCategoryMismatch].join(', ')}`)
for (const category of categories) console.log(`${category.name}: ${counts.get(category.name) || 0}`)
