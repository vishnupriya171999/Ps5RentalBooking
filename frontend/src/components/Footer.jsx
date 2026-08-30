import { Camera, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
function Footer() { return <footer className="site-footer"><div className="container footer-content"><Link to="/" className="brand"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span>PLAY<span>LOOP</span></Link><p>Premium gaming, delivered.</p><a href="https://instagram.com" aria-label="Instagram"><Camera size={19} /></a></div><div className="container footer-bottom">© {new Date().getFullYear()} PlayLoop Rentals. All rights reserved.</div></footer> }
export default Footer
