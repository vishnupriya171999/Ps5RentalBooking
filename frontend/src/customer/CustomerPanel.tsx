import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import { CustomerNavigationContext } from './customerNavigation'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FloatingWhatsApp from '../components/FloatingWhatsApp'
import Home from '../pages/Home'
import Offers from '../pages/Offers'
import Booking from '../pages/Booking'
import BookingSuccess from '../pages/BookingSuccess'
import SpecialCatalogue from '../pages/SpecialCatalogue'

const pages: Record<string, ComponentType> = {
  '/': Home,
  '/offers': Offers,
  '/book': Booking,
  '/booking-success': BookingSuccess,
  '/special-catalogue': SpecialCatalogue,
}

const CustomerPanel = () => {
  const [view, setView] = useState({ pathname: '/', search: '', hash: '', state: null })

  const open = (target: string) => {
    const url = new URL(target, window.location.origin)
    const pathname = Object.hasOwn(pages, url.pathname) ? url.pathname : '/'
    setView({ pathname, search: url.search, hash: url.hash, state: null })
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (view.hash) {
        document.getElementById(view.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [view])

  const Page = pages[view.pathname]

  return (
    <CustomerNavigationContext.Provider value={{ ...view, open }}>
      <div className="app-shell">
        <Navbar />
        <main><Page key={`${view.pathname}${view.search}`} /></main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </CustomerNavigationContext.Provider>
  )
}

export default CustomerPanel
