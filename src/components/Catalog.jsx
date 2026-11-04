import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, ArrowUpRight, PackageOpen, X, Phone, ImageOff } from 'lucide-react'
import { brands } from '../data/brands'
import { categories } from '../data/categories'
import catalogUrl from '../data/products.json?url'

function CatalogArtwork() {
  return <div className="catalog-art" aria-hidden="true"><span className="art-shape"/><span className="art-line"/><span className="art-label">CATALOG<br/>IMAGE UNAVAILABLE</span></div>
}

function ProductDetails({ product, onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  useEffect(() => {
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    closeRef.current?.focus()
    const handleKeydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (!focusable.length) { event.preventDefault(); return }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus()
    }
  }, [onClose])

  return <div className="detail-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="detail-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <button ref={closeRef} className="detail-close" onClick={onClose} aria-label="Close product details"><X size={20}/></button>
      <div className="detail-image">
        {product.image && <img src={product.image} alt={product.name} onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'grid' }}/>} 
        <div style={{display: product.image ? 'none' : 'grid'}}><CatalogArtwork/></div>
      </div>
      <div className="detail-copy">
        <p className="eyebrow">{product.category}</p><h2 id="detail-title">{product.name}</h2>
        <p>{product.description || 'Contact the business manager to confirm product details and current availability.'}</p>
        <span className="detail-price">{product.price ?? 'Contact for pricing'}</span>
        <a className="button button-dark" href="tel:+923716711308"><Phone size={16}/> Call Business Manager <ArrowUpRight size={16}/></a>
        {product.sourceUrl && <a className="detail-source" href={product.sourceUrl} target="_blank" rel="noreferrer">View source folder <ArrowUpRight size={14}/></a>}
      </div>
    </section>
  </div>
}

export default function Catalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [sort, setSort] = useState('Featured')
  const [selected, setSelected] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState([])
  const [catalogState, setCatalogState] = useState('loading')
  const pageSize = 48
  const closeDetails = useCallback(() => setSelected(null), [])

  useEffect(() => {
    let active = true
    fetch(catalogUrl)
      .then(response => { if (!response.ok) throw new Error(`Catalog request failed (${response.status})`); return response.json() })
      .then(items => { if (active) { setProducts(items); setCatalogState('ready') } })
      .catch(() => { if (active) setCatalogState('error') })
    return () => { active = false }
  }, [])

  const shown = useMemo(() => {
    let list = products.filter(product => `${product.name} ${product.category || ''}`.toLowerCase().includes(query.toLowerCase()))
    if (category !== 'All categories') list = list.filter(product => product.category === category)
    if (sort === 'Name A–Z') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, query, category, sort])
  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize))
  const pageProducts = shown.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const filtered = Boolean(query || category !== 'All categories')
  const chooseCategory = value => {
    setCategory(value)
    setCurrentPage(1)
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  let catalogContent
  if (catalogState === 'loading') {
    catalogContent = <div className="empty-state" role="status"><span className="loading-mark"/><h3>Loading catalog</h3><p>Preparing product images…</p></div>
  } else if (catalogState === 'error') {
    catalogContent = <div className="empty-state" role="alert"><PackageOpen size={32}/><h3>Catalog unavailable</h3><p>The local catalog data could not be loaded. Please refresh the page or call the business manager for product information.</p><a className="text-link" href="tel:+923716711308">Call +92 371 6711308 <ArrowUpRight size={16}/></a></div>
  } else if (shown.length) {
    catalogContent = <>
      <p className="catalog-result-count">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, shown.length)} of {shown.length.toLocaleString()} catalog images</p>
      <div className="product-grid">{pageProducts.map(product => <button className="product-card" key={product.id} onClick={() => setSelected(product)} aria-label={`View details for ${product.name}`}>
        <div className="product-image">
          {product.image && <img src={product.image} alt={product.name} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'grid' }}/>} 
          <div style={{display: product.image ? 'none' : 'grid'}}><CatalogArtwork/></div>
        </div>
        <div className="product-copy"><span className="product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description || 'Contact for product details'}</p><div className="product-bottom"><span>{product.price ?? 'Contact for pricing'}</span><span className="product-more"><ArrowUpRight size={18}/></span></div></div>
      </button>)}</div>
      {pageCount > 1 && <nav className="pagination" aria-label="Catalog pages">
        <button disabled={currentPage === 1} onClick={() => { setCurrentPage(page => page - 1); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}>Previous</button>
        <span>Page {currentPage} of {pageCount}</span>
        <button disabled={currentPage === pageCount} onClick={() => { setCurrentPage(page => page + 1); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}>Next</button>
      </nav>}
    </>
  } else {
    catalogContent = <div className="empty-state"><PackageOpen size={32}/><h3>{filtered ? 'No matching products' : 'No catalog images available'}</h3><p>{filtered ? 'Try another search or clear the filters.' : 'Product images will appear here once they are added to the local catalog.'}</p><button className="text-link clear-filters" onClick={() => { setQuery(''); setCategory('All categories') }}>Clear filters</button><a className="text-link" href="tel:+923716711308">Call +92 371 6711308 <ArrowUpRight size={16}/></a><ImageOff size={17} className="empty-note-icon"/></div>
  }

  return <>
    <section className="category-nav" aria-labelledby="category-heading">
      <div className="category-nav-head"><div><p className="eyebrow">PRODUCT CATEGORIES</p><h2 id="category-heading">Browse the <em>catalog.</em></h2></div><span>{categories.length} CATEGORIES</span></div>
      <div className="category-pills">{categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => chooseCategory(category === item ? 'All categories' : item)}>{item}<span className="category-count">{products.filter(product => product.category === item).length}</span></button>)}</div>
    </section>
    <section className="section catalog-section" id="shop">
      <div className="section-heading"><div><p className="eyebrow">THE CATALOG</p><h2>Find your next<br/><em>great product.</em></h2></div><p className="section-note">Browse the available categories below. Availability and pricing are confirmed directly with the business manager.</p></div>
      <div className="catalog-toolbar">
        <label className="search-field"><Search size={17}/><span className="sr-only">Search products</span><input value={query} onChange={event => { setQuery(event.target.value); setCurrentPage(1) }} placeholder="Search products"/></label>
        <select aria-label="Filter by category" value={category} onChange={event => { setCategory(event.target.value); setCurrentPage(1) }}><option>All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select>
        <select aria-label="Sort products" value={sort} onChange={event => { setSort(event.target.value); setCurrentPage(1) }}><option>Featured</option><option>Name A–Z</option></select>
      </div>
      {catalogContent}
    </section>
    <section className="brands-strip" id="brands"><div><p className="eyebrow">BRAND DIRECTORY</p><h2>Brands are listed<br/><em>when verified.</em></h2></div><div className="brand-directory">{brands.length ? brands.map(brand => <a href={brand.website || '#shop'} key={brand.name} className="brand-chip">{brand.name}<ArrowUpRight size={15}/></a>) : <p>Products are currently organized by their top-level image folder category. Nested folder names are not used to infer product brands.</p>}</div></section>
    {selected && <ProductDetails product={selected} onClose={closeDetails}/>}
  </>
}
