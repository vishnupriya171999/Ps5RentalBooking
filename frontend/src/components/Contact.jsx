import { Check, Copy, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'

const contactNumber = '+91 9789830356'

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.05 4.94A9.87 9.87 0 0 0 12.03 2C6.56 2 2.12 6.43 2.12 11.9c0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.9-4.43 9.9-9.9a9.85 9.85 0 0 0-2.88-6.97Zm-7.02 15.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.14.82.84-3.05-.2-.32a8.16 8.16 0 1 1 6.98 3.87Zm4.49-6.12c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.57.13s-.65.8-.8.96c-.15.17-.3.19-.55.06a6.75 6.75 0 0 1-2-1.23 7.45 7.45 0 0 1-1.38-1.72c-.14-.25-.02-.38.11-.5.12-.11.25-.3.38-.45.12-.15.16-.26.25-.43.08-.17.04-.32-.02-.45-.06-.13-.57-1.36-.77-1.86-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.3s-.88.86-.88 2.1.9 2.44 1.02 2.61c.12.17 1.76 2.69 4.26 3.77.6.26 1.06.41 1.43.52.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" fill="currentColor"/></svg>
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
}

function Contact() {
  const [copied, setCopied] = useState(false)

  const copyNumber = async () => {
    await navigator.clipboard.writeText(contactNumber.replace(/\s/g, ''))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return <section className="section contact-section" id="contact"><div className="container"><div className="section-heading center"><p className="eyebrow">CONNECT</p><h2>Your next session <span>starts here.</span></h2></div><div className="contact-grid"><article className="contact-card"><Phone size={25} /><h3>Call</h3><div className="contact-number-row"><span>{contactNumber}</span><button type="button" className={`contact-copy ${copied ? 'copied' : ''}`} onClick={copyNumber} aria-label="Copy phone number">{copied ? <><Check size={15} /><span>Copied</span></> : <><Copy size={15} /><span>Copy</span></>}</button></div></article><a className="contact-card contact-action whatsapp" href="https://wa.me/919789830356" target="_blank" rel="noreferrer"><WhatsAppIcon /><h3>WhatsApp</h3><span>Chat with us</span></a><a className="contact-card contact-action" href="https://www.instagram.com/play.stationrental/" target="_blank" rel="noreferrer"><InstagramIcon /><h3>Instagram</h3><span>@play.stationrental</span></a><article className="contact-card"><MapPin size={25} /><h3>Location</h3><strong>Velachery, Chennai</strong></article></div></div></section>
}

export default Contact
