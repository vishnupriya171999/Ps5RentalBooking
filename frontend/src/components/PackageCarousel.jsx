import { Check, Gamepad2 } from 'lucide-react'
import { formatPrice } from '../data/offers'

function PackageCarousel({ offers, selectedId, onSelect }) {
  return <section className="package-carousel package-plan-grid" aria-label="Choose a rental package"><div className="package-carousel-heading"><div><h2><Gamepad2 size={19} /> Choose your plan</h2><p>Choose one rental pack to continue.</p></div></div><div className="package-carousel-track">{offers.map((offer) => <button type="button" className={`package-slide ${selectedId === offer.id ? 'selected' : ''}`} onClick={() => onSelect(offer.id)} aria-pressed={selectedId === offer.id} key={offer.id}><span className="package-slide-days">{offer.days === 1 ? 'SINGLE DAY' : offer.id.includes('monthly') ? 'MONTHLY' : `${offer.days}+ DAYS`}</span><h3>{offer.name}</h3><p>{offer.description}</p><div className="package-slide-meta"><span><Gamepad2 size={15} /> {offer.controllers} controller{offer.controllers > 1 ? 's' : ''}</span></div><div className="package-slide-price"><strong>{formatPrice(offer.price)}</strong><span>{offer.rate}</span></div>{selectedId === offer.id && <span className="package-selected"><Check size={12} /> Selected</span>}</button>)}</div></section>
}

export default PackageCarousel
