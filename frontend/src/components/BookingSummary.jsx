import { ArrowRight, CalendarDays, CheckCircle2, Clock3, LocateFixed, MapPin, PackageCheck, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatPrice } from '../data/offers'
import { validateCustomerDetails, buildCustomerDetails } from '../data/customerValidation'
import '../booking-card.css'
import '../customer-validation.css'

const displayDate = (value) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const displayTime = (value) => { const [hour, minute] = value.split(':').map(Number); return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}` }
const emptyCustomerDetails = () => ({ name: '', mobile: '', address: '', mapsLink: '', need: '', door: '', city: '', pincode: '', location: null, addressConfirmed: false })

function CustomerDetailsModal({ details, setDetails, errors, locationStatus, locating, onClose, onLocation, onSubmit }) {
  const formRef = useRef(null)
  useEffect(() => {
    const previousFocus = document.activeElement
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    const overlay = formRef.current?.parentElement
    const viewport = window.visualViewport
    const syncViewport = () => {
      overlay?.style.setProperty('--dialog-height', `${viewport?.height ?? window.innerHeight}px`)
      overlay?.style.setProperty('--dialog-top', `${viewport?.offsetTop ?? 0}px`)
      overlay?.style.setProperty('--dialog-width', `${viewport?.width ?? window.innerWidth}px`)
      overlay?.style.setProperty('--dialog-left', `${viewport?.offsetLeft ?? 0}px`)
    }
    syncViewport()
    viewport?.addEventListener('resize', syncViewport)
    viewport?.addEventListener('scroll', syncViewport)
    window.addEventListener('resize', syncViewport)
    const initialFocus = window.matchMedia('(max-width: 650px)').matches ? '.booking-modal-close' : '#customer-name'
    formRef.current?.querySelector(initialFocus)?.focus({ preventScroll: true })
    return () => {
      viewport?.removeEventListener('resize', syncViewport)
      viewport?.removeEventListener('scroll', syncViewport)
      window.removeEventListener('resize', syncViewport)
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      previousFocus?.focus()
    }
  }, [])
  const update = (field, value) => {
    const nextValue = field === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : field === 'name' ? value.slice(0, 80) : value
    setDetails(current => ({ ...current, [field]: nextValue, ...(['door', 'address', 'city', 'pincode'].includes(field) ? { addressConfirmed: false } : {}) }))
  }
  const fieldError = (field) => errors[field] && <small className="customer-field-error" id={`${field}-error`}>{errors[field]}</small>
  const fieldProps = (field) => ({ id: `customer-${field}`, name: field, value: details[field], onChange: event => update(field, event.target.value), 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `${field}-error` : undefined })
  const handleKeys = (event) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose() }
    if (event.key !== 'Tab') return
    const controls = [...formRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]')]
    const first = controls[0], last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
  return createPortal(
    <div className="booking-details-overlay customer-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="customer-details-title">
      <form ref={formRef} className="booking-details-modal customer-validation-modal" noValidate onSubmit={onSubmit} onKeyDown={handleKeys}>
        <button type="button" className="booking-modal-close" onClick={onClose} aria-label="Close customer details"><X size={19} /></button>
        <p className="eyebrow">ONE LAST STEP</p>
        <h2 id="customer-details-title">Where should we deliver?</h2>
        <p>Capture your location at the delivery address, then complete the details below. Fields marked * are required.</p>
        <label htmlFor="customer-name">Your name <b>*</b><input {...fieldProps('name')} maxLength={80} autoComplete="name" placeholder="Your full name (max 80 characters)" aria-required="true" />{fieldError('name')}</label>
        <label htmlFor="customer-mobile">Mobile number <b>*</b><input {...fieldProps('mobile')} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit mobile number" aria-required="true" />{fieldError('mobile')}</label>
        <div className="customer-location-block">
          <button id="customer-location" className="use-location-button" type="button" onClick={onLocation} disabled={locating} aria-invalid={Boolean(errors.location)} aria-describedby="location-help location-error"><LocateFixed size={18} />{locating ? 'Finding your address...' : details.location ? 'Update current location' : 'Use current location'}</button>
          <small id="location-help">Required: allow location access while you are at the delivery address.</small>
          {details.location && <small className="location-captured"><CheckCircle2 size={15} /> Delivery map pin captured</small>}
          {locationStatus && <small className="location-status" role="status">{locationStatus}</small>}
          {fieldError('location')}
        </div>
        <label htmlFor="customer-door">Door / flat number or house name <b>*</b><input {...fieldProps('door')} placeholder="e.g. Flat 2B, Lotus Apartments" autoComplete="address-line1" aria-required="true" />{fieldError('door')}</label>
        <label htmlFor="customer-address">Street, area and address details <b>*</b><textarea {...fieldProps('address')} disabled={locating} placeholder="Street name, area and nearby landmark" autoComplete="address-line2" rows="3" aria-required="true" /><small>Review the detected address. Add missing street and area details.</small>{fieldError('address')}</label>
        <div className="customer-address-row">
          <label htmlFor="customer-city">Town / city <b>*</b><input {...fieldProps('city')} autoComplete="address-level2" placeholder="e.g. Chennai" aria-required="true" />{fieldError('city')}</label>
          <label htmlFor="customer-pincode">PIN code <b>*</b><input {...fieldProps('pincode')} inputMode="numeric" autoComplete="postal-code" placeholder="6-digit PIN code" aria-required="true" />{fieldError('pincode')}</label>
        </div>
        <label>Google Maps link <em>(for our delivery team)</em><input disabled type="url" value={details.mapsLink} placeholder="Added after location access succeeds" /></label>
        <label htmlFor="customer-need">Describe your need <em>(optional)</em><textarea {...fieldProps('need')} placeholder="Games you want or delivery instructions (up to 500 characters)" rows="2" />{fieldError('need')}</label>
        <div><label className="customer-address-confirm"><input id="customer-addressConfirmed" type="checkbox" checked={details.addressConfirmed} onChange={event => update('addressConfirmed', event.target.checked)} aria-required="true" aria-invalid={Boolean(errors.addressConfirmed)} aria-describedby={errors.addressConfirmed ? 'addressConfirmed-error' : undefined} /><span>I have checked my complete address and confirm the captured map pin is at my delivery location. <b>*</b></span></label>{fieldError('addressConfirmed')}</div>
        {Object.keys(errors).length > 0 && <p className="customer-error-summary" role="alert">Please correct the highlighted details before submitting.</p>}
        <button className="button button-primary booking-modal-submit" type="submit" disabled={locating}>Submit booking <ArrowRight size={18} /></button>
      </form>
    </div>, document.body)
}

function BookingConfirmedModal({ onClose }) {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousBodyOverflow; document.documentElement.style.overflow = previousHtmlOverflow }
  }, [])
  return createPortal(<div className="booking-details-overlay booking-confirmed-overlay" role="dialog" aria-modal="true" aria-labelledby="booking-confirmed-title"><section className="booking-confirmed-modal"><span className="booking-confirmed-icon"><CheckCircle2 size={34} /></span><p className="eyebrow">BOOKING CONFIRMED</p><h2 id="booking-confirmed-title">You are all set!</h2><p>Your booking request is confirmed. Our PS5RentalChennai team will connect with you shortly to finalise delivery.</p><button type="button" className="button button-primary" onClick={onClose}>Back to booking</button></section></div>, document.body)
}

function BookingSummary({ selectedOffer, selectedAddOns, startDate, endDate, deliveryTime, pickupTime, totalDays, planAmount, addOnsTotal, totalAmount, selectionCount, controllerOnlyQuantity, onValidateSchedule, onContinue }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [details, setDetails] = useState(emptyCustomerDetails)
  const [formErrors, setFormErrors] = useState({})
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')
  const [locating, setLocating] = useState(false)
  const locationRequest = useRef(0)
  useEffect(() => () => { locationRequest.current += 1 }, [])
  const controllerOnly = !selectedOffer && controllerOnlyQuantity > 0
  const dailyRate = selectedOffer ? selectedOffer.price / selectedOffer.days : 0
  const optionalAddOns = selectedAddOns.filter((addOn) => addOn.id !== 'controller-only')
  const baseAmount = controllerOnly ? addOnsTotal : planAmount
  const rentalName = controllerOnly ? `Controllers Only - ${controllerOnlyQuantity} selected` : `${selectedOffer.name} - ${totalDays} days`
  const rentalRate = controllerOnly ? `${formatPrice(200)} / controller / day x ${totalDays} days` : `${formatPrice(dailyRate)} / day x ${totalDays} days`
  const controllerText = controllerOnly ? `${controllerOnlyQuantity} controller${controllerOnlyQuantity > 1 ? 's' : ''}` : `${selectedOffer.controllers} controller${selectedOffer.controllers > 1 ? 's' : ''}`
  const updateDetails = (updater) => {
    setDetails(current => {
      const next = typeof updater === 'function' ? updater(current) : updater
      return next
    })
  }
  const visibleErrors = validationAttempted ? validateCustomerDetails(details) : formErrors
  const submitDetails = (event) => {
    event.preventDefault()
    if (locating) return
    const errors = validateCustomerDetails(details)
    setValidationAttempted(true)
    setFormErrors(errors)
    if (Object.keys(errors).length) {
      const firstInvalid = event.currentTarget.querySelector(`#customer-${Object.keys(errors)[0]}`)
      firstInvalid?.focus()
      firstInvalid?.scrollIntoView({ block: 'center', behavior: 'instant' })
      return
    }
    if (onContinue(buildCustomerDetails(details)) !== false) { closeDetails(); setSuccessOpen(true) }
  }
  const useCurrentLocation = () => {
    if (locating) return
    if (!navigator.geolocation) {
      setLocationStatus('Location is not supported in this browser. Please open the booking page in a browser with location access.')
      return
    }
    const requestId = ++locationRequest.current
    setLocating(true)
    setDetails(current => ({ ...current, location: null, mapsLink: '', addressConfirmed: false }))
    setFormErrors({})
    setLocationStatus('Getting your current location...')
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (requestId !== locationRequest.current) return
      const mapsLink = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`
      setDetails((current) => ({ ...current, address: '', mapsLink, location: { latitude: coords.latitude, longitude: coords.longitude }, addressConfirmed: false }))
      setLocationStatus('Location found. Looking up your address...')
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
        const response = await fetch(`${apiBase}/api/location/reverse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
          signal: AbortSignal.timeout(12000),
        })
        const data = await response.json()
        if (!response.ok || typeof data.address !== 'string' || !data.address.trim()) throw new Error('Address lookup unavailable')
        if (requestId !== locationRequest.current) return
        setDetails((current) => ({ ...current, address: data.address, city: data.city || current.city, pincode: data.pincode || current.pincode, addressConfirmed: false }))
        setLocationStatus('Address found. Please check it and add your door or flat number before submitting.')
      } catch {
        if (requestId !== locationRequest.current) return
        setLocationStatus('Your map pin is saved, but the address could not be found. Please enter your full delivery address below.')
      } finally {
        if (requestId === locationRequest.current) setLocating(false)
      }
    }, (error) => {
      if (requestId !== locationRequest.current) return
      setLocating(false)
      setLocationStatus(error.code === 1 ? 'Location permission was denied. Enable location access in your browser settings, then tap Use current location again.' : error.code === 3 ? 'Location detection timed out. Check your GPS and internet connection, then try again.' : 'Your location is unavailable. Turn on device location services and try again.')
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
  }
  const closeDetails = () => {
    locationRequest.current += 1
    setLocating(false)
    setLocationStatus('')
    setDetails(emptyCustomerDetails())
    setFormErrors({})
    setValidationAttempted(false)
    setDetailsOpen(false)
  }

  return <aside className="booking-summary booking-summary-premium booking-summary-detailed"><div className="summary-glow" /><div className="summary-header"><div><p className="eyebrow">BOOKING SUMMARY</p><h2><PackageCheck size={20} /> Booking Summary</h2></div><span><Sparkles size={18} /></span></div><div className="summary-details"><section className="summary-block"><div className="summary-block-title"><span>{controllerOnly ? 'Rental' : 'Package'}</span><small>{controllerOnly ? 'Controllers only' : 'Selected plan'}</small></div><div className="summary-row"><span>{rentalName}</span><strong>{formatPrice(baseAmount)}</strong></div><div className="summary-rate-line"><span>{rentalRate}</span><span>{controllerText}</span></div></section><section className="summary-block"><div className="summary-block-title"><span>Rental period</span><small>{totalDays} days</small></div><div className="summary-date-line"><CalendarDays size={15} /><span>{displayDate(startDate)} to {displayDate(endDate)}</span><strong>{totalDays} days</strong></div><div className="summary-time-line"><Clock3 size={14} /><span>Delivery {displayTime(deliveryTime)}</span><span>Pickup {displayTime(pickupTime)}</span></div></section>{optionalAddOns.length > 0 && <section className="summary-block"><div className="summary-block-title"><span>Add-ons</span><small>{optionalAddOns.length} selected</small></div><div className="summary-addon-list">{optionalAddOns.map((addOn) => { const amount = addOn.price * (addOn.quantity || 1) * (addOn.perDay && addOn.id !== 'extra-controller' ? totalDays : 1); const rate = addOn.perDay && addOn.id !== 'extra-controller' ? `${formatPrice(addOn.price)}/day x ${totalDays} days` : `${formatPrice(addOn.price)} each`; return <div key={addOn.id}><span>{addOn.name}<small>{addOn.quantity > 1 ? `${addOn.quantity} x ` : ''}{rate}</small></span><strong>{formatPrice(amount)}</strong></div> })}</div></section>}<section className="summary-charges"><div><span>{controllerOnly ? 'Controller rental' : 'Daily rental'}</span><strong>{controllerOnly ? `${formatPrice(200 * controllerOnlyQuantity)} / day` : `${formatPrice(dailyRate)} / day`}</strong></div>{optionalAddOns.length > 0 && <div><span>Add-ons</span><strong>{formatPrice(addOnsTotal)}</strong></div>}</section><div className="summary-delivery summary-delivery-inline"><MapPin size={16} /><span><strong>Delivery</strong><em>Free up to 10 km; Rs.200 above 10 km</em></span></div></div><div className="summary-total summary-total-premium"><span>Grand total</span><strong>{formatPrice(totalAmount)}</strong><small>{selectionCount} selection{selectionCount > 1 ? 's' : ''} included</small></div><button type="button" className="button button-primary summary-continue" onClick={() => { if (onValidateSchedule() !== false) setDetailsOpen(true) }}>Confirm booking <ArrowRight size={18} /></button><p className="secure-note"><CheckCircle2 size={17} /> Your package is ready to confirm.</p>{detailsOpen && <CustomerDetailsModal details={details} setDetails={updateDetails} errors={visibleErrors} locationStatus={locationStatus} locating={locating} onClose={closeDetails} onLocation={useCurrentLocation} onSubmit={submitDetails} />}{successOpen && <BookingConfirmedModal onClose={() => setSuccessOpen(false)} />}</aside>
}

export default BookingSummary
