import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCart, getClientId } from '../utils/api'

export default function Navbar() {
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const updateCartCount = async () => {
      const clientId = getClientId()
      const cart = await getCart(clientId)
      setTotal((cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0))
    }
    updateCartCount()
    window.addEventListener('cart:updated', updateCartCount)
    return () => window.removeEventListener('cart:updated', updateCartCount)
  }, [])

  const closeMobileMenu = () => setOpen(false)

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <img src="/assets/logo.png" alt="ADHRA Logo" className="logo-img" />
          <span className="brand-name">ADHRA</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(o => !o)}
        >
          ☰
        </button>

        <ul id="primary-navigation" className={`nav-menu ${open ? 'open' : ''}`}>
          <li><Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link></li>
          <li><a href="#products" className="nav-link" onClick={closeMobileMenu}>Products</a></li>
          <li><a href="#about" className="nav-link" onClick={closeMobileMenu}>About</a></li>
          <li><a href="#contact" className="nav-link" onClick={closeMobileMenu}>Contact</a></li>
          <li className="cart-icon"><Link to="/checkout" onClick={closeMobileMenu} aria-live="polite">🛒 Cart ({total})</Link></li>
          <li><Link to="/admin" className="nav-link admin-link" onClick={closeMobileMenu}>Admin</Link></li>
        </ul>
      </div>
    </nav>
  )
}
