const apiBase = import.meta.env.VITE_API_BASE || 'https://adhra-8.onrender.com'

export const getClientId = () => {
  let id = localStorage.getItem('clientId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('clientId', id)
  }
  return id
}

const request = async (path, options = {}) => {
  const resp = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const getProducts = () => request('/api/products')

export const createProduct = (payload) => request('/api/products', {
  method: 'POST',
  body: JSON.stringify(payload)
})

export const deleteProduct = (id) => request(`/api/products/${id}`, {
  method: 'DELETE'
})

export const getCart = (clientId) => request(`/api/cart/${clientId}`)

export const setCart = (clientId, items) => request(`/api/cart/${clientId}`, {
  method: 'POST',
  body: JSON.stringify({ items })
})

export const clearCart = (clientId) => request(`/api/cart/${clientId}/clear`, {
  method: 'POST'
})
