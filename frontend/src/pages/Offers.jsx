import { Headphones, Plus, Truck } from 'lucide-react'
import OfferCard from '../components/OfferCard'
import SpecialOffer from '../components/SpecialOffer'
import { addOns, deliveryNote, formatPrice, offers } from '../data/offers'

function Offers() {
  return <section className="page-section offers-page"><div className="container"><div className="page-intro"><p className="eyebrow">PICK YOUR PLAYTIME</p><h1>PS5 packs for <span>every game night.</span></h1><p>Choose your console pack, then add the extras that make the session yours.</p></div><div className="delivery-banner"><Truck size={21} /><span><strong>Delivery made simple</strong>{deliveryNote}</span></div><SpecialOffer /><div className="packs-heading"><div><p className="eyebrow">ALL RENTAL PACKS</p><h2>Choose your <span>play style.</span></h2></div><p>Every pack includes the PS5 console and listed controllers.</p></div><div className="offer-grid full-offer-grid">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div><div className="add-ons-heading"><div><p className="eyebrow">MAKE IT YOURS</p><h2>Games & <span>add-ons.</span></h2></div><p>Add these to any console package.</p></div><div className="add-ons-grid">{addOns.map((addOn, index) => <article className="add-on-card" key={addOn.name}>{index === 3 ? <Headphones size={23} /> : <Plus size={23} />}<div><h3>{addOn.name}</h3><p>{addOn.description}</p></div><strong>{formatPrice(addOn.price)} <small>{addOn.unit}</small></strong></article>)}</div></div></section>
}

export default Offers
