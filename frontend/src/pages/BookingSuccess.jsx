import { CheckCircle2, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
function BookingSuccess() { const { state } = useLocation(); return <section className="success-page"><div className="success-card"><span className="success-icon"><CheckCircle2 /></span><p className="eyebrow">REQUEST RECEIVED</p><h1>Booking Request <span>Submitted!</span></h1><p>Thank you for choosing us. Your booking request has been received and our team will contact you shortly.</p><div className="booking-id">Booking ID <strong>{state?.bookingId || 'PL-REQUEST'}</strong></div><Link className="button button-primary" to="/"><Home size={17} /> Back to Home</Link></div></section> }
export default BookingSuccess
