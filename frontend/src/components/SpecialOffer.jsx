import { ArrowRight, CalendarDays, Gamepad2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { deliveryNote, formatPrice, specialOffer } from '../data/offers'

function SpecialOffer() {
  return <section className="midweek-special"><div className="midweek-glow" /><div className="midweek-content"><div className="midweek-copy"><p className="midweek-label"><Sparkles size={15} /> LIMITED MIDWEEK SPECIAL</p><h2>Tuesday to Thursday.<span> More play for less.</span></h2><p>{specialOffer.description}</p><div className="midweek-meta"><span><CalendarDays size={16} /> Tuesday – Thursday</span><span><Gamepad2 size={16} /> 1 controller included</span></div><small>{deliveryNote}</small></div><div className="midweek-price"><span>Only</span><strong>{formatPrice(specialOffer.price)}</strong><em>{specialOffer.rate} · 3 days</em><Link to={`/book?package=${specialOffer.id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>Book midweek <ArrowRight size={16} /></Link></div></div></section>
}

export default SpecialOffer
