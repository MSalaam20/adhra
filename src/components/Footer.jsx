export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About ADHRA</h3>
          <p>Your trusted destination for quality products and exceptional service. We deliver excellence in every transaction.</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>Email: <a href="mailto:info@adhra.com">info@adhra.com</a></p>
          <p>Phone: <a href="tel:+2349122603692">+234 912 260 3692</a></p>
          <p>Address: Minna, Niger State, Nigeria</p>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} ADHRA. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#returns">Returns & Refunds</a>
        </div>
      </div>
    </footer>
  )
}
