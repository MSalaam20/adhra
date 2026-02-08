export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]{10,}$/
  return re.test(phone.replace(/\s/g, ''))
}

export const validateRequired = (value) => {
  return value && value.trim().length > 0
}

export const validateCheckoutForm = (formData) => {
  const errors = {}

  if (!validateRequired(formData.name)) {
    errors.name = 'Full name is required'
  }

  if (!validateRequired(formData.email)) {
    errors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!validateRequired(formData.phone)) {
    errors.phone = 'Phone number is required'
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!validateRequired(formData.address)) {
    errors.address = 'Address is required'
  }

  if (!validateRequired(formData.city)) {
    errors.city = 'City is required'
  }

  if (!validateRequired(formData.zipcode)) {
    errors.zipcode = 'Zip code is required'
  }

  return errors
}

export const validateContactForm = (formData) => {
  const errors = {}

  if (!validateRequired(formData.name)) {
    errors.name = 'Name is required'
  }

  if (!validateRequired(formData.email)) {
    errors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!validateRequired(formData.phone)) {
    errors.phone = 'Phone number is required'
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!validateRequired(formData.subject)) {
    errors.subject = 'Subject is required'
  }

  if (!validateRequired(formData.message)) {
    errors.message = 'Message is required'
  }

  return errors
}
