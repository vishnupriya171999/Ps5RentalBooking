import Link from '../customer/CustomerLink'
import { ArrowLeft } from 'lucide-react'
import { specialGames } from '../data/specialGames'
import { addOns, formatPrice } from '../data/offers'
import '../game-catalogue.css'

const SpecialCatalogue = () => {
  const pack = addOns.find(item => item.id === 'special-games')
  const unlistedPack = addOns.find(item => item.id === 'aaa-games')
  if (!pack || !unlistedPack) return null
  return <section className="page-section special-details-page"><div className="container">
    <div className="section-heading"><p className="eyebrow">SPECIAL GAMES PACK</p><h1>Special Catalogue</h1><span className="special-catalogue-price">{formatPrice(pack.price)} per package</span><p>Add the Special Games Pack to your PS5 rental to choose from the games below.</p></div>
    <div className="special-games-grid">{specialGames.map(({ title, image, genre, text }) => <article className="catalogue-card" key={image}><img src={`/images/games/${image}.jpg`} alt={`${title} game artwork`} width="460" height="215" loading="lazy" /><div className="catalogue-card-content"><p className="catalogue-genre">{genre}</p><h2>{title}</h2><p className="catalogue-description">{text}</p></div></article>)}</div>
    <p className="pack-install-note">Looking for a game outside this catalogue or a new title? Choose Unlisted or New Games in the booking form for {formatPrice(unlistedPack.price)} per package instead.</p>
    <div className="special-details-actions"><Link className="button button-primary" to="/book"><ArrowLeft size={18} aria-hidden="true" />Back to booking</Link></div>
  </div></section>
}

export default SpecialCatalogue
