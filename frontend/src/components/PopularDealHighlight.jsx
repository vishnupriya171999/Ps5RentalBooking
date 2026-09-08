import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, X } from 'lucide-react'
import OfferCard from './OfferCard'
import { bookingOffers } from '../data/offers'
import '../popular-deal.css'

export default function PopularDealHighlight() {
  const [open, setOpen] = useState(false)
  const sectionMarker = useRef(null)
  const panel = useRef(null)
  const offer = bookingOffers.find(item => item.id === 'three-day-duo')

  useEffect(() => {
    const section = sectionMarker.current?.closest('section')
    const heading = section?.querySelector('.section-heading, .page-intro')
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setOpen(true); observer.disconnect() }
    }, { threshold: 0, rootMargin: '-64px 0px -25% 0px' })
    if (heading) observer.observe(heading)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector('button')?.focus({ preventScroll: true })
    const handleKey = event => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key !== 'Tab') return
      const controls = panel.current?.querySelectorAll('button, a[href]')
      if (!controls?.length) return
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      previousFocus?.focus({ preventScroll: true })
    }
  }, [open])

  return <>
    <span ref={sectionMarker} hidden />
    {open && createPortal(<div className="popular-deal-backdrop" onClick={event => { if (event.target === event.currentTarget) setOpen(false) }}>
      <section ref={panel} className="popular-deal-panel" role="dialog" aria-modal="true" aria-labelledby="popular-deal-title">
        <button className="popular-deal-close" type="button" aria-label="Close popular deal" onClick={() => setOpen(false)}><X size={22} /></button>
        <p className="eyebrow" id="popular-deal-title"><Sparkles size={16} /> THE CROWD FAVOURITE</p>
        <OfferCard offer={offer} />
        <button className="popular-deal-dismiss" type="button" onClick={() => setOpen(false)}>Keep exploring Power Deals</button>
      </section>
    </div>, document.body)}
  </>
}
