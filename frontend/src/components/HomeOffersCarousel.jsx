import { MoveRight } from 'lucide-react'
import { useRef, useState } from 'react'
import OfferCard from './OfferCard'
import '../offers-carousel.css'

function HomeOffersCarousel({ offers }) {
  const trackRef = useRef(null)
  const [position, setPosition] = useState(0)
  const updatePosition = () => {
    const track = trackRef.current
    if (!track) return
    const maxScroll = Math.max(1, track.scrollWidth - track.clientWidth)
    setPosition(Math.round((track.scrollLeft / maxScroll) * 100))
  }

  return <div className="home-offers-carousel"><div className="offers-carousel-toolbar"><span className="offers-scroll-cue">Explore every pack <MoveRight size={16} /></span></div><div className="offers-carousel-track" ref={trackRef} onScroll={updatePosition}>{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div><div className="offers-carousel-progress" aria-hidden="true"><span style={{ width: `${Math.max(12, position)}%` }} /></div></div>
}

export default HomeOffersCarousel
