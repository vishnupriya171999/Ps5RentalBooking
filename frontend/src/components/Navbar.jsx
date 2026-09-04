import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import brandLogo from '../assets/ps5-rental-chennai-logo-simple.svg'
import FloatingWhatsApp from './FloatingWhatsApp'
import '../mobile-nav.css'
import '../brand-style.css'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const menuRef = useRef(null)
  const { pathname } = useLocation()
  const close = () => setIsOpen(false)
  const isActive = (section) => pathname === '/' && activeSection === section
  const goToSection = (event, section) => {
    if (pathname === '/') event.preventDefault()
    close()
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsidePress = (event) => {
      if (!menuRef.current?.contains(event.target)) close()
    }

    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [isOpen])

  useEffect(() => {
    if (pathname !== '/') return undefined
    const sections = [...document.querySelectorAll('#home, #offers, #games, #why-us, #contact')]
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveSection(visible.target.id)
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [pathname])

  return <header className="site-header" ref={menuRef}><nav className="navbar container" aria-label="Main navigation"><Link to="/#home" className="brand" aria-label="Go to home page" onClick={(event) => goToSection(event, 'home')}><img className="brand-mark" src={brandLogo} alt="" />PS5<span>RentalChennai</span></Link><button type="button" className="menu-button" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen} aria-controls="primary-navigation">{isOpen ? <X /> : <Menu />}</button><div id="primary-navigation" className={`nav-links ${isOpen ? 'open' : ''}`}><Link to="/#home" className={isActive('home') ? 'active' : ''} onClick={(event) => goToSection(event, 'home')}>Home Base</Link><Link to="/#offers" className={isActive('offers') ? 'active' : ''} onClick={(event) => goToSection(event, 'offers')}>Power Deals</Link><Link to="/#games" className={isActive('games') ? 'active' : ''} onClick={(event) => goToSection(event, 'games')}>Game Vault</Link><Link to="/#why-us" className={isActive('why-us') ? 'active' : ''} onClick={(event) => goToSection(event, 'why-us')}>Why Us</Link><Link to="/#contact" className={isActive('contact') ? 'active' : ''} onClick={(event) => goToSection(event, 'contact')}>Connect</Link><FloatingWhatsApp compact /></div></nav></header>
}
export default Navbar
