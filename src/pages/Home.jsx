import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import Testimonials from '../components/Testimonials'
import TrustBadges from '../components/TrustBadges'
import FAQ from '../components/FAQ'
import Toast from '../components/Toast'
import { validateContactForm } from '../utils/validation'
import { getProducts, getCart, setCart, getClientId } from '../utils/api'

async function addToCart(productId) {
  const clientId = getClientId()
  const products = await getProducts()
  const product = products.find(p => Number(p.id) === Number(productId))
  if (!product) return alert('Product not found')

  const cartData = await getCart(clientId)
  const items = cartData.items || []
  const existing = items.find(i => Number(i.productId) === Number(product.id))
  if (existing) existing.quantity += 1
  else items.push({ productId: product.id, name: product.name, price: parseInt(product.price) || 0, quantity: 1, image: product.image })
  await setCart(clientId, items)
  window.dispatchEvent(new Event('cart:updated'))
  alert(`${product.name} added to cart!`)
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [contactErrors, setContactErrors] = useState({})
  const [contactLoading, setContactLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const apiBase = import.meta.env.VITE_API_BASE || 'https://adhra-8.onrender.com'

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports']

  useEffect(() => {
    const loadProducts = async () => {
      const p = await getProducts().catch(() => [])
      if (p.length === 0) {
        // demo fallback with categories
        const demo = [
          {
            id: 1,
            name: 'Sample Product',
            price: '1000',
            description: 'Demo item — add real products via Admin',
            category: 'Electronics',
            image: '/assets/Flier.png',
            rating: 4.5,
            reviews: 24
          }
        ]
        setProducts(demo)
      } else {
        setProducts(p)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('.reveal'))
    if (targets.length === 0) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          obs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' })

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [products])

  useEffect(() => {
    let scrollTimer
    const onScroll = () => {
      document.body.classList.add('pause-animations')
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(() => {
        document.body.classList.remove('pause-animations')
      }, 160)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(scrollTimer)
      document.body.classList.remove('pause-animations')
    }
  }, [])

  // Filter and search products
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0)
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0)
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      return 0 // featured (original order)
    })

  const renderStars = (rating) => {
    if (!rating) return '☆☆☆☆☆'
    const stars = Math.round(rating)
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars)
  }

  return (
    <main role="main">
      <section className="hero" id="home">
        <div className="hero-background" aria-hidden="true">
          <div className="hero-glow"></div>
        </div>
        <div className="hero-wave" aria-hidden="true"></div>
        <div className="hero-vcut" aria-hidden="true"></div>
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-badge">Nigerian trusted marketplace</span>
            <h1 className="hero-title">
              Welcome to <span className="hero-title-accent">ADHRA</span>.
              Quality you can trust, delivery you can track.
            </h1>
            <p className="hero-subtitle">
              Shop premium essentials curated for everyday life. Fast nationwide delivery,
              secure checkout, and responsive support when you need it.
            </p>
            <div className="hero-actions">
              <a className="hero-cta primary" href="#products">Shop products</a>
              <a className="hero-cta ghost" href="#contact">Talk to support</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span>Delivery</span>
                <strong>24-72 hrs</strong>
              </div>
              <div className="hero-stat">
                <span>Support</span>
                <strong>24/7 chat</strong>
              </div>
              <div className="hero-stat">
                <span>Secure</span>
                <strong>Encrypted pay</strong>
              </div>
            </div>
          </div>
          <div className="hero-showcase" aria-hidden="true">
            <div className="hero-card">
              <img src="/assets/Flier.png" alt="" className="hero-card-image" />
              <div className="hero-card-body">
                <p className="hero-card-title">Featured essentials</p>
                <p className="hero-card-text">Handpicked for quality, price, and fast delivery.</p>
              </div>
            </div>
            <div className="hero-pill">Verified quality</div>
            <div className="hero-pill">Nationwide shipping</div>
          </div>
        </div>
      </section>

      <section id="products" className="products content-section">
        <h2 className="reveal">Our Products</h2>

        <div className="products-controls reveal">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
              className="search-input"
            />
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="category-filter" className="filter-label">Category:</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter" className="filter-label">Sort by:</label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="filter-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="products-grid reveal">
          {filteredProducts.length === 0 ? (
            <p className="no-products-message reveal">No products found. Try adjusting your filters.</p>
          ) : (
            filteredProducts.map(p => (
              <div className="product-card reveal" key={p.id}>
                <div className="product-image-wrapper">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="product-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="product-content">
                  <h3>{p.name}</h3>
                  {p.category && <p className="product-category">{p.category}</p>}
                  <p className="product-description">{p.description}</p>
                  {p.rating && (
                    <div className="product-rating">
                      <span className="stars">{renderStars(p.rating)}</span>
                      <span className="rating-text">{p.rating} ({p.reviews || 0} reviews)</span>
                    </div>
                  )}
                  <p className="price">₦{parseInt(p.price).toLocaleString()}</p>
                  <button className="add-to-cart" onClick={() => addToCart(p.id)} aria-label={`Add ${p.name} to cart`}>Add to Cart</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section id="about" className="about content-section">
        <div className="about-content">
          <h2 className="reveal">About ADHRA</h2>
          <p className="reveal">ADHRA is a leading online marketplace dedicated to bringing you the finest selection of products with uncompromising quality standards. Founded with a mission to make premium products accessible to everyone, we've built our reputation on trust, reliability, and exceptional customer service.</p>
          <div className="about-features">
            <div className="feature reveal">
              <h4>✓ Quality Assured</h4>
              <p>Every product is carefully selected and tested</p>
            </div>
            <div className="feature reveal">
              <h4>✓ Fast Delivery</h4>
              <p>Quick processing and shipping nationwide</p>
            </div>
            <div className="feature reveal">
              <h4>✓ Secure Payment</h4>
              <p>Multiple payment options for your convenience</p>
            </div>
            <div className="feature reveal">
              <h4>✓ Customer First</h4>
              <p>24/7 support for all your inquiries</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact content-section">
        <h2 className="reveal">Get in Touch</h2>
        <p className="contact-subtitle reveal">Have questions? We'd love to hear from you. Reach out to us anytime!</p>
        <form className="contact-form reveal" onSubmit={handleContactSubmit} aria-label="Contact form">
          <div className="form-group">
            <label htmlFor="contactName">Your Name *</label>
            <input
              id="contactName"
              name="name"
              type="text"
              placeholder="Full Name"
              required
              aria-required="true"
              autoComplete="name"
              className={contactErrors.name ? 'input-error' : ''}
            />
            {contactErrors.name && <span className="error-message">{contactErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactEmail">Email Address *</label>
            <input
              id="contactEmail"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              aria-required="true"
              autoComplete="email"
              className={contactErrors.email ? 'input-error' : ''}
            />
            {contactErrors.email && <span className="error-message">{contactErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone">Phone Number *</label>
            <input
              id="contactPhone"
              name="phone"
              type="tel"
              placeholder="+234..."
              autoComplete="tel"
              className={contactErrors.phone ? 'input-error' : ''}
            />
            {contactErrors.phone && <span className="error-message">{contactErrors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactSubject">Subject *</label>
            <input
              id="contactSubject"
              name="subject"
              type="text"
              placeholder="What is this about?"
              required
              aria-required="true"
              className={contactErrors.subject ? 'input-error' : ''}
            />
            {contactErrors.subject && <span className="error-message">{contactErrors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactMessage">Message *</label>
            <textarea
              id="contactMessage"
              name="message"
              placeholder="Your Message"
              rows="5"
              required
              aria-required="true"
              className={contactErrors.message ? 'input-error' : ''}
            ></textarea>
            {contactErrors.message && <span className="error-message">{contactErrors.message}</span>}
          </div>

          <button type="submit" disabled={contactLoading} className={contactLoading ? 'loading' : ''}>
            {contactLoading ? '🔄 Sending...' : 'Send Message'}
          </button>
        </form>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </section>

      <TrustBadges />
      <Testimonials />
      <FAQ />

      <Footer />
    </main>
  )

  async function handleContactSubmit(e) {
    e.preventDefault()
    const form = e.target
    const formData = {
      name: form.querySelector('[name="name"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      subject: form.querySelector('[name="subject"]').value.trim(),
      message: form.querySelector('[name="message"]').value.trim()
    }

    const validationErrors = validateContactForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setContactErrors(validationErrors)
      setToast({ message: 'Please correct the form errors', type: 'error' })
      return
    }

    setContactErrors({})
    setContactLoading(true)

    try {
      const resp = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Message failed')

      setToast({ message: '✅ Thank you! We\'ll respond within 24 hours.', type: 'success' })
      form.reset()
    } catch (err) {
      setToast({ message: err.message || 'Message failed', type: 'error' })
    } finally {
      setContactLoading(false)
    }
  }
}
