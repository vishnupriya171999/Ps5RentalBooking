import type { MouseEvent } from 'react'
import Link from '../customer/CustomerLink'
import { useCustomerNavigation } from '../customer/customerNavigation'
const brandLogo = '/images/brand/ps-rental-symbol.png'
import footerStory from '../assets/footer-game-story.png'
import '../footer-mobile.css'

const Footer = () => {
  const { pathname } = useCustomerNavigation()
  const goHome = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return
    event.preventDefault()
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
  }

  return <footer className="site-footer"><div className="container footer-content"><Link to="/#home" className="brand" aria-label="Go to home page" onClick={goHome}><img className="brand-mark" src={brandLogo} alt="" width="48" height="48" />PS5<span>RentalChennai</span></Link><div className="footer-slogan"><span>RENT · PLAY · REPEAT</span><strong>Premium gaming, delivered.</strong></div><img className="footer-story" src={footerStory} alt="A friendly game robot playing alongside a customer" /></div><div className="container footer-bottom">© {new Date().getFullYear()} PS5RentalChennai. All rights reserved.</div></footer>
}

export default Footer
