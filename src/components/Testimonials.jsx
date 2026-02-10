export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Chioma Okonkwo",
      rating: 5,
      text: "ADHRA exceeded my expectations! Fast delivery and excellent product quality. Will definitely order again!",
      image: "👩"
    },
    {
      id: 2,
      name: "Segun Adeyemi",
      rating: 5,
      text: "Best online shopping experience. Customer service was responsive and helpful throughout my purchase.",
      image: "👨"
    },
    {
      id: 3,
      name: "Amaka Nwosu",
      rating: 5,
      text: "The products are authentic and arrived in perfect condition. Highly recommended!",
      image: "👩"
    },
    {
      id: 4,
      name: "Tunde Olawale",
      rating: 5,
      text: "Affordable prices without compromising quality. ADHRA is my go-to online store.",
      image: "👨"
    }
  ]

  return (
    <section className="testimonials content-section" id="testimonials">
      <div className="testimonials-container">
        <h2 className="reveal">What Our Customers Say</h2>
        <p className="testimonials-subtitle reveal">Join thousands of satisfied customers</p>
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div className="testimonial-card reveal" key={testimonial.id}>
              <div className="testimonial-header">
                <span className="testimonial-avatar">{testimonial.image}</span>
                <div>
                  <h4>{testimonial.name}</h4>
                  <div className="stars">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
