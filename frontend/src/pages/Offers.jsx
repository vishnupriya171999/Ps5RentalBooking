import OfferCard from '../components/OfferCard'
import { offers } from '../data/offers'
function Offers() { return <section className="page-section"><div className="container"><div className="page-intro"><p className="eyebrow">FIND YOUR GAME TIME</p><h1>Rental packages built for <span>every kind of player.</span></h1><p>One great console. Flexible plans. Pick your package and we’ll take care of the rest.</p></div><div className="offer-grid">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div></div></section> }
export default Offers
