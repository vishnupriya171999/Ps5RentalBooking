import { Menu, X, Zap } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
function Navbar() { const [isOpen, setIsOpen] = useState(false); const close = () => setIsOpen(false); return <header className="site-header"><nav className="navbar container" aria-label="Main navigation"><Link to="/" className="brand" onClick={close}><span className="brand-mark"><Zap size={17} fill="currentColor" /></span>PLAY<span>LOOP</span></Link><button className="menu-button" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">{isOpen ? <X /> : <Menu />}</button><div className={`nav-links ${isOpen ? 'open' : ''}`}><NavLink to="/" end onClick={close}>Home</NavLink><NavLink to="/offers" onClick={close}>Offers</NavLink><Link to="/book" className="nav-cta" onClick={close}>Book PS5</Link></div></nav></header> }
export default Navbar
