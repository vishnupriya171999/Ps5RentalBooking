import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import WhyChooseUs from '../components/WhyChooseUs'
import HowItWorks from '../components/HowItWorks'
import Games from '../components/Games'
import Contact from '../components/Contact'
import HomeOffersCarousel from '../components/HomeOffersCarousel'
import { bookingOffers } from '../data/offers'
function Home() { return <><Hero /><section className="section offers-preview" id="offers"><div className="container"><div className="section-heading"><p className="eyebrow">POWER DEALS</p><h2>More game time. <span>Better value.</span></h2><p className="power-deals-copy">Every PS5 rental pack in one place. Pick the playtime that fits your squad.</p></div><HomeOffersCarousel offers={bookingOffers} /></div></section><Games /><WhyChooseUs /><HowItWorks /><section className="cta-section"><div className="cta-orb" /><div className="container cta-content"><p className="eyebrow">READY PLAYER ONE?</p><h2>Ready to <span>play?</span></h2><p>Book your PS5 today and turn your free time into game time.</p><Link to="/book" className="button button-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>Book Now <ArrowRight size={18} /></Link></div></section><Contact /></> }
export default Home
