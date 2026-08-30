import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Offers from './pages/Offers'
import Booking from './pages/Booking'
import BookingSuccess from './pages/BookingSuccess'

function App() {
  return <div className="app-shell"><Navbar /><main><Routes><Route path="/" element={<Home />} /><Route path="/offers" element={<Offers />} /><Route path="/book" element={<Booking />} /><Route path="/booking-success" element={<BookingSuccess />} /><Route path="*" element={<Home />} /></Routes></main><Footer /></div>
}
export default App
