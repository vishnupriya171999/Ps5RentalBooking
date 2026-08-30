import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../data/offers'
function OfferCard({ offer }) { return <article className={`offer-card ${offer.popular ? 'featured' : ''}`}>{offer.popular && <span className="popular-badge">Most Popular</span>}<p className="offer-days">{offer.days} {offer.days === 1 ? 'DAY' : 'DAYS'}</p><h3>{offer.name}</h3><p className="offer-description">{offer.description}</p><p className="offer-price">{formatPrice(offer.price)} <small>/ PS5</small></p><div className="offer-divider" /><p className="offer-includes"><Check size={15} /> Console & controller included</p><Link to={`/book?package=${offer.id}`} className="offer-link">Book this package <ArrowRight size={16} /></Link></article> }
export default OfferCard
