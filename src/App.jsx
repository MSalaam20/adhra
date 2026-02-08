import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './style.css'
import './index.css'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
