import { useState } from 'react'

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null)

  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 3-5 business days within Minna and 5-7 days for other regions. Express delivery (1-2 days) is available for selected areas at an additional fee."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Paystack, bank transfers, and multiple payment platforms. All transactions are encrypted and secure."
    },
    {
      question: "Can I return items?",
      answer: "Yes! You can return items within 30 days of purchase if they are unused and in original condition. Return shipping is free for defective items."
    },
    {
      question: "Are your products authentic?",
      answer: "100% authentic! We source directly from manufacturers and authorized distributors. Each product is verified before shipment."
    },
    {
      question: "Do you offer discounts or promotions?",
      answer: "Yes! We regularly offer seasonal sales, promotional discounts, and loyalty rewards. Subscribe to our newsletter for exclusive offers."
    },
    {
      question: "How can I track my order?",
      answer: "You'll receive a tracking number via email after your order is shipped. You can track your package in real-time through our portal."
    },
    {
      question: "What if I receive a damaged item?",
      answer: "Contact our customer service immediately with photos of the damage. We'll arrange a replacement or refund within 24 hours."
    },
    {
      question: "Is there a warranty on products?",
      answer: "Yes! All products come with manufacturer's warranty. Our customer service team can assist with warranty claims."
    }
  ]

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section className="faq content-section" id="faq">
      <div className="faq-container">
        <h2 className="reveal">Frequently Asked Questions</h2>
        <p className="faq-subtitle reveal">Find answers to common questions</p>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div className="faq-item reveal" key={idx}>
              <button
                className="faq-question"
                onClick={() => toggleFAQ(idx)}
                aria-expanded={openIdx === idx}
                aria-controls={`faq-answer-${idx}`}
              >
                <span>{faq.question}</span>
                <span className="faq-toggle">{openIdx === idx ? '−' : '+'}</span>
              </button>
              {openIdx === idx && (
                <div className="faq-answer" id={`faq-answer-${idx}`}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
