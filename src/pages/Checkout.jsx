import { useEffect, useState } from 'react'
import Toast from '../components/Toast'
import { validateCheckoutForm } from '../utils/validation'
import { getCart, setCart, clearCart as clearCartApi, getClientId } from '../utils/api'

export default function Checkout() {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [bankInfo, setBankInfo] = useState(null)
  const apiBase = import.meta.env.VITE_API_BASE || 'https://adhra-8.onrender.com'

  useEffect(() => {
    loadCart()
  }, [])

  async function loadCart() {
    const clientId = getClientId()
    const data = await getCart(clientId).catch(() => ({ items: [] }))
    const c = data.items || []
    setCart(c)
    const t = c.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0)
    setTotal(t)
  }

  async function removeFromCart(idx) {
    const clientId = getClientId()
    const data = await getCart(clientId).catch(() => ({ items: [] }))
    const c = data.items || []
    c.splice(idx, 1)
    await setCart(clientId, c)
    window.dispatchEvent(new Event('cart:updated'))
    loadCart()
  }

  async function clearCart() {
    if (!confirm('Clear cart?')) return
    const clientId = getClientId()
    await clearCartApi(clientId)
    window.dispatchEvent(new Event('cart:updated'))
    loadCart()
  }

  async function proceedToPayment(e) {
    e.preventDefault()
    const form = e.target
    const formData = {
      name: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      city: form.city?.value?.trim() || '',
      zipcode: form.zipcode?.value?.trim() || ''
    }
    const paymentMethod = form.paymentMethod.value

    const validationErrors = validateCheckoutForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setToast({ message: 'Please correct the form errors', type: 'error' })
      return
    }

    setErrors({})
    setLoading(true)
    setBankInfo(null)

    const customerInfo = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipcode
    }

    try {
      if (paymentMethod === 'paystack') {
        const resp = await fetch(`${apiBase}/api/paystack/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: customerInfo,
            items: cart,
            total
          })
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || 'Paystack initialization failed')

        const clientId = getClientId()
        await clearCartApi(clientId)
        window.dispatchEvent(new Event('cart:updated'))
        loadCart()
        window.location.href = data.authorizationUrl
        return
      }

      if (paymentMethod === 'bank') {
        const resp = await fetch(`${apiBase}/api/bank/intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: customerInfo,
            items: cart,
            total
          })
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || 'Bank transfer setup failed')

        const clientId = getClientId()
        await clearCartApi(clientId)
        window.dispatchEvent(new Event('cart:updated'))
        loadCart()
        setBankInfo({
          reference: data.reference,
          ...data.bankDetails
        })
        setToast({ message: '✅ Bank transfer instructions generated', type: 'success' })
      }
    } catch (err) {
      setToast({ message: err.message || 'Payment failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="checkout-container">
      <div className="checkout-content">
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div id="cartItems" className="cart-items">
            {cart.length === 0 && <p className="no-items">Your cart is empty. <a href="/">Continue shopping</a></p>}
            {cart.map((item, i) => (
              <div className="cart-item" key={i}>
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>₦{parseInt(item.price).toLocaleString()}</p>
                  <p className="cart-item-qty">Quantity: {item.quantity}</p>
                </div>
                <div className="cart-item-actions">
                  <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                  <button onClick={() => removeFromCart(i)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-total"><h3>Total: ₦<span id="totalAmount">{total.toLocaleString()}</span></h3></div>
          <button onClick={clearCart}>Clear Cart</button>
        </div>

        <div className="checkout-form">
          <h2>Billing Information</h2>
          {bankInfo && (
            <div className="bank-transfer-box" role="status" aria-live="polite">
              <h3>Bank Transfer Details</h3>
              <p><strong>Bank:</strong> {bankInfo.bankName}</p>
              <p><strong>Account Name:</strong> {bankInfo.accountName}</p>
              <p><strong>Account Number:</strong> {bankInfo.accountNumber}</p>
              <p><strong>Reference:</strong> {bankInfo.reference}</p>
              <p className="bank-transfer-note">Use the reference as your payment narration.</p>
            </div>
          )}
          <form onSubmit={proceedToPayment} aria-label="Checkout form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                placeholder="Full name"
                required
                aria-required="true"
                autoComplete="name"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                aria-required="true"
                autoComplete="email"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                placeholder="Phone (e.g., +234 123 456 7890)"
                required
                aria-required="true"
                autoComplete="tel"
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                placeholder="Address"
                rows="3"
                required
                aria-required="true"
                autoComplete="street-address"
                className={errors.address ? 'input-error' : ''}
              ></textarea>
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                placeholder="City"
                autoComplete="address-level2"
                className={errors.city ? 'input-error' : ''}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="zipcode">Zip Code</label>
              <input
                id="zipcode"
                name="zipcode"
                placeholder="Zip code"
                autoComplete="postal-code"
                className={errors.zipcode ? 'input-error' : ''}
              />
              {errors.zipcode && <span className="error-message">{errors.zipcode}</span>}
            </div>

            <div className="payment-method">
              <label><input type="radio" name="paymentMethod" value="paystack" defaultChecked /> Pay with Paystack</label>
              <label><input type="radio" name="paymentMethod" value="bank" /> Bank Transfer</label>
            </div>

            <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
              {loading ? '🔄 Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  )
}
