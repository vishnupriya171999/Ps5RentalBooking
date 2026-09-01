import { Link } from 'react-router-dom'
import brandLogo from '../assets/ps5-rental-chennai-logo-simple.svg'
import footerStory from '../assets/footer-game-story.png'

function Footer() {
  const goHome = (event) => {
    if (window.location.pathname !== '/') return
    event.preventDefault()
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
  }

  return <footer className="site-footer"><div className="container footer-content"><Link to="/#home" className="brand" aria-label="Go to home page" onClick={goHome}><img className="brand-mark" src={brandLogo} alt="" />PS5<span>RentalChennai</span></Link><div className="footer-slogan"><span>RENT · PLAY · REPEAT</span><strong>Premium gaming, delivered.</strong></div><img className="footer-story" src={footerStory} alt="A friendly game robot playing alongside a customer" /></div><div className="container footer-bottom">© {new Date().getFullYear()} PS5RentalChennai. All rights reserved.</div></footer>
}

export default Footer
