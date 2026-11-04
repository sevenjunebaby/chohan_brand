import { useEffect, useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'

const links = [['Shop All', '#shop'], ['Brands', '#brands'], ['Delivery', '#delivery'], ['Contact', '#contact']]

export default function Header() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpen(false)
        document.querySelector('.menu-toggle')?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])
  return <header className="site-header">
    <a className="wordmark" href="#home" aria-label="Chohan Brand home"><span className="mark">C</span><span>CHOHAN<span className="wordmark-light"> BRAND</span></span></a>
    <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
      <a href="#home" onClick={() => setOpen(false)}>Home</a>
      {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      <a className="nav-cta" href="#shop" onClick={() => setOpen(false)}>Explore products <ArrowUpRight size={15}/></a>
    </nav>
    <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
  </header>
}
