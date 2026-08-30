import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import WhyChooseUs from '../components/WhyChooseUs'
import HowItWorks from '../components/HowItWorks'
import OfferCard from '../components/OfferCard'
import { offers } from '../data/offers'
function Home() { return <><Hero /><WhyChooseUs /><section className="section offers-preview"><div className="container"><div className="section-heading with-action"><div><p className="eyebrow">POPULAR OFFERS</p><h2>More game time. <span>Better value.</span></h2></div><Link to="/offers" className="text-link">View all offers <ArrowRight size={16} /></Link></div><div className="offer-grid">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div></div></section><HowItWorks /><section className="cta-section"><div className="cta-orb" /><div className="container cta-content"><p className="eyebrow">READY PLAYER ONE?</p><h2>Ready to <span>play?</span></h2><p>Book your PS5 today and turn your free time into game time.</p><Link to="/book" className="button button-primary">Book Now <ArrowRight size={18} /></Link></div></section></> }
export default Home
