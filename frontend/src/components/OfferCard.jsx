import { ArrowRight, Gamepad2, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { deliveryNote, formatPrice } from '../data/offers'
import '../offers-polish.css'

function OfferCard({ offer }) {
  const isMidweek = offer.id === 'midweek-single'
  const isPopular = offer.id === 'three-day-duo'
  return <article className={`offer-card ${isPopular ? 'featured' : ''} ${isMidweek ? 'midweek-offer-card' : ''}`}>{isPopular && <span className="popular-badge">Most Popular</span>}{isMidweek && <span className="midweek-card-badge">MIDWEEK SPECIAL</span>}<p className="offer-days">{isMidweek ? 'TUE - THU' : offer.days === 1 ? 'ONE DAY' : `${offer.days} DAYS`}</p><h3>{offer.name}</h3><p className="offer-description">{offer.description}</p><p className="offer-price">{formatPrice(offer.price)} <small>/ package</small></p><p className="offer-rate">{offer.rate}</p><div className="offer-divider" /><p className="offer-includes"><Gamepad2 size={15} /> {offer.controllers} controller{offer.controllers > 1 ? 's' : ''} included</p><p className="offer-delivery"><MapPin size={14} /> {deliveryNote}</p><Link to={`/book?package=${offer.id}`} className="offer-link" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>Book this pack <ArrowRight size={16} /></Link></article>
}

export default OfferCard
