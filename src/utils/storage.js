export const safeJsonParse = (value, fallback) => {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export const getStorageArray = (key) => {
  return safeJsonParse(localStorage.getItem(key), [])
}

export const getStorageObject = (key) => {
  return safeJsonParse(localStorage.getItem(key), {})
}

export const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

npx prisma migrate dev --name add_products_cart