import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

const PORT = process.env.PORT || 4000
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const ADMIN_API_KEY = process.env.ADMIN_API_KEY

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const SENDGRID_FROM = process.env.SENDGRID_FROM
const SENDGRID_TO = process.env.SENDGRID_TO

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER
const SMTP_TO = process.env.SMTP_TO || SMTP_FROM

const bankDetails = {
  bankName: process.env.BANK_NAME || 'Your Bank Name',
  accountName: process.env.BANK_ACCOUNT_NAME || 'ADHRA Business',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0000000000'
}

app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const canSendEmail = () => Boolean(
  (SENDGRID_API_KEY && SENDGRID_FROM && SENDGRID_TO) ||
  (SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM && SMTP_TO)
)

const getTransporter = () => {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  })
}

const sendEmail = async ({ name, email, phone, subject, message }) => {
  const content = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'N/A'}`,
    `Subject: ${subject}`,
    '',
    message
  ].join('\n')

  if (SENDGRID_API_KEY && SENDGRID_FROM && SENDGRID_TO) {
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: SENDGRID_TO }] }],
        from: { email: SENDGRID_FROM },
        reply_to: { email },
        subject: `Contact Form: ${subject}`,
        content: [{ type: 'text/plain', value: content }]
      })
    })

    if (!resp.ok) {
      const errText = await resp.text()
      throw new Error(`SendGrid error: ${errText}`)
    }
    return true
  }

  if (SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM && SMTP_TO) {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: SMTP_FROM,
      to: SMTP_TO,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: content
    })
    return true
  }

  return false
}

const saveCart = async (clientId, items) => {
  const cart = await prisma.cart.upsert({
    where: { clientId },
    create: { clientId },
    update: {}
  })

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  if (items.length > 0) {
    await prisma.cartItem.createMany({
      data: items.map((i) => ({
        cartId: cart.id,
        productId: i.productId || i.id || null,
        name: i.name,
        price: i.price || 0,
        quantity: i.quantity || 1,
        image: i.image || null
      }))
    })
  }

  return cart
}

app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(products)
})

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, image, category } = req.body
    if (!name || !price || !image) return res.status(400).json({ error: 'Missing fields' })
    const product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        description: description || '',
        image,
        category: category || null
      }
    })
    res.json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.product.delete({ where: { id } })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/cart/:clientId', async (req, res) => {
  const { clientId } = req.params
  const cart = await prisma.cart.findUnique({
    where: { clientId },
    include: { items: true }
  })
  res.json({ items: cart?.items || [] })
})

app.post('/api/cart/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params
    const { items } = req.body
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Invalid items' })
    await saveCart(clientId, items)
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/cart/:clientId/clear', async (req, res) => {
  try {
    const { clientId } = req.params
    await saveCart(clientId, [])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const record = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message
      }
    })

    let emailSent = false
    if (canSendEmail()) {
      try {
        emailSent = await sendEmail({ name, email, phone, subject, message })
      } catch (emailErr) {
        console.error(emailErr)
        emailSent = false
      }
    }

    return res.json({ ok: true, emailSent, id: record.id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/contact/messages', async (req, res) => {
  try {
    const apiKey = req.headers['x-admin-key']
    if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    return res.json({ messages })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

const createReference = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

app.post('/api/bank/intent', async (req, res) => {
  try {
    const { customer, items, total } = req.body
    if (!customer || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid request' })
    }

    const reference = createReference()
    const order = await prisma.order.create({
      data: {
        reference,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        address: customer.address,
        city: customer.city || '',
        zipCode: customer.zipCode || '',
        paymentMethod: 'bank',
        status: 'pending',
        total: total || 0,
        items: {
          create: items.map((i) => ({
            name: i.name,
            price: i.price || 0,
            quantity: i.quantity || 1
          }))
        }
      }
    })

    return res.json({
      reference: order.reference,
      bankDetails
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/paystack/initialize', async (req, res) => {
  try {
    const { customer, items, total } = req.body
    if (!customer || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid request' })
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(400).json({ error: 'Paystack secret key not configured' })
    }

    const reference = createReference()
    const amountKobo = Math.round((total || 0) * 100)

    const order = await prisma.order.create({
      data: {
        reference,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        address: customer.address,
        city: customer.city || '',
        zipCode: customer.zipCode || '',
        paymentMethod: 'paystack',
        status: 'pending',
        total: total || 0,
        paystackRef: reference,
        items: {
          create: items.map((i) => ({
            name: i.name,
            price: i.price || 0,
            quantity: i.quantity || 1
          }))
        }
      }
    })

    const resp = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: customer.email,
        amount: amountKobo,
        reference: order.reference,
        metadata: {
          customer,
          items
        }
      })
    })

    const data = await resp.json()
    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Paystack initialization failed' })
    }

    return res.json({
      authorizationUrl: data.data.authorization_url,
      reference: order.reference
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/paystack/verify', async (req, res) => {
  try {
    const { reference } = req.body
    if (!reference) return res.status(400).json({ error: 'Reference required' })
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(400).json({ error: 'Paystack secret key not configured' })
    }

    const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    })

    const data = await resp.json()
    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Verification failed' })
    }

    const status = data.data.status === 'success' ? 'paid' : 'failed'
    const order = await prisma.order.update({
      where: { reference },
      data: { status }
    })

    return res.json({ status: order.status })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
