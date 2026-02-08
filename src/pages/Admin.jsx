import { useEffect, useState } from 'react'
import { createProduct, deleteProduct as deleteProductApi, getProducts } from '../utils/api'

const ADMIN_PASSWORD = 'adhra123'

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      const p = await getProducts().catch(() => [])
      setProducts(p)
    }
    loadProducts()
  }, [])

  function handleLogin(e) {
    e.preventDefault()
    const pass = e.target.password.value
    if (pass === ADMIN_PASSWORD) {
      setLoggedIn(true)
      setMessage('')
    } else setMessage('Incorrect password')
  }

  async function handleAdd(e) {
    e.preventDefault()
    const name = e.target.productName.value
    const price = e.target.productPrice.value
    const description = e.target.productDescription.value
    const file = e.target.productImage.files[0]
    if (!file) return setMessage('Select an image')

    const reader = new FileReader()
    reader.onload = async function(ev) {
      const img = new Image()
      img.onload = async () => {
        const maxWidth = 600
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const compressed = canvas.toDataURL('image/jpeg', 0.7)
        const product = { name, price: parseInt(price), description, image: compressed }
        const created = await createProduct(product)
        setProducts((prev) => [created, ...prev])
        setMessage('Product added successfully')
        e.target.reset()
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    await deleteProductApi(id)
    setProducts((prev) => prev.filter(x => x.id !== id))
    setMessage('Product deleted')
  }

  return (
    <div className="admin-container">
      {!loggedIn ? (
        <div className="login-section">
          <h1>ADHRA Admin Login</h1>
          <form onSubmit={handleLogin} aria-label="Admin login form">
            <label htmlFor="adminPassword" className="sr-only">Admin Password</label>
            <input id="adminPassword" type="password" name="password" placeholder="Enter Admin Password" required aria-required="true" />
            <button type="submit">Login</button>
          </form>
          <p className="error" role="status">{message}</p>
        </div>
      ) : (
        <div className="dashboard-section">
          <h1>Admin Dashboard</h1>
          <button onClick={() => setLoggedIn(false)}>Logout</button>
          <section className="add-product-section">
            <h2>Add New Product</h2>
            <form onSubmit={handleAdd}>
              <input name="productName" placeholder="Name" required />
              <input name="productPrice" type="number" placeholder="Price" required />
              <textarea name="productDescription" placeholder="Description"></textarea>
              <input name="productImage" type="file" accept="image/*" required />
              <button type="submit">Add Product</button>
            </form>
            <p className="message" role="status" aria-live="polite">{message}</p>
          </section>

          <section className="products-list-section">
            <h2>Your Products</h2>
            <div className="products-list">
              {products.length === 0 && <p>No products added yet</p>}
              {products.map(p => (
                <div className="product-item" key={p.id}>
                  <img src={p.image} alt={p.name} style={{width:80}} />
                  <div>
                    <div>{p.name}</div>
                    <div>₦{parseInt(p.price).toLocaleString()}</div>
                    <div>{p.description}</div>
                    <button onClick={() => deleteProduct(p.id)} aria-label={`Delete ${p.name}`}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
