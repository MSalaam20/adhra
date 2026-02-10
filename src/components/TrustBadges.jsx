export default function TrustBadges() {
  const badges = [
    {
      icon: "✅",
      title: "100% Authentic",
      description: "All products are genuine and verified"
    },
    {
      icon: "🚚",
      title: "Fast & Reliable",
      description: "Quick delivery to your doorstep"
    },
    {
      icon: "🔒",
      title: "Secure Payment",
      description: "Multiple safe payment options available"
    },
    {
      icon: "💬",
      title: "24/7 Support",
      description: "Professional customer service team"
    },
    {
      icon: "↩️",
      title: "Easy Returns",
      description: "Hassle-free returns within 30 days"
    },
    {
      icon: "💯",
      title: "Money Back",
      description: "Satisfaction guaranteed or your money back"
    }
  ]

  return (
    <section className="trust-badges content-section">
      <div className="trust-container">
        <h2 className="reveal">Why Choose ADHRA?</h2>
        <div className="badges-grid">
          {badges.map((badge, idx) => (
            <div className="badge reveal" key={idx}>
              <div className="badge-icon">{badge.icon}</div>
              <h3>{badge.title}</h3>
              <p>{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
