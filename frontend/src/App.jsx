import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Offers from './pages/Offers'
import Booking from './pages/Booking'
import BookingSuccess from './pages/BookingSuccess'
import FloatingWhatsApp from './components/FloatingWhatsApp'

function App() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }))
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [hash, pathname])

  return <div className="app-shell"><Navbar /><main><Routes><Route path="/" element={<Home />} /><Route path="/offers" element={<Offers />} /><Route path="/book" element={<Booking />} /><Route path="/booking-success" element={<BookingSuccess />} /><Route path="*" element={<Home />} /></Routes></main><Footer /><FloatingWhatsApp /></div>
}
export default App
