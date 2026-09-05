import { CalendarDays, CheckCircle2, Clock3, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BookingSummary from '../components/BookingSummary'
import PackageCarousel from '../components/PackageCarousel'
import AddOnsPicker from '../components/AddOnsPicker'
import { addOns, bookingOffers } from '../data/offers'
import '../booking-builder.css'
import '../booking-builder-detail.css'
import '../booking-polish.css'

const toDateInputValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const getToday = () => toDateInputValue(new Date())
const getCurrentTime = () => { const now = new Date(); return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` }
const addDays = (date, days) => { const next = new Date(`${date}T00:00:00`); next.setDate(next.getDate() + days); return toDateInputValue(next) }
const getTotalDays = (startDate, endDate) => {
  const difference = Math.round((new Date(`${endDate}T00:00:00`) - new Date(`${startDate}T00:00:00`)) / 86400000)
  return difference >= 1 ? difference : 1
}
const getNextTuesday = (fromDate) => { const date = new Date(`${fromDate}T00:00:00`); date.setDate(date.getDate() + ((2 - date.getDay() + 7) % 7)); return toDateInputValue(date) }

function Booking() {
  const [searchParams] = useSearchParams()
  const defaultOffer = bookingOffers.find((offer) => offer.id === 'three-day-duo')
  const initialOffer = bookingOffers.find((offer) => offer.id === searchParams.get('package')) || defaultOffer
  const defaultStart = getToday()
  const [selectedId, setSelectedId] = useState(initialOffer.id)
  const [selectedAddOnIds, setSelectedAddOnIds] = useState([])
  const [extraControllerQuantity, setExtraControllerQuantity] = useState(0)
  const [controllerOnlyQuantity, setControllerOnlyQuantity] = useState(0)
  const [rentalStartDate, setRentalStartDate] = useState(defaultStart)
  const [rentalEndDate, setRentalEndDate] = useState(addDays(defaultStart, initialOffer.id === 'midweek-single' ? 3 : initialOffer.days))
  const [deliveryTime, setDeliveryTime] = useState(getCurrentTime)
  const [pickupTime, setPickupTime] = useState(getCurrentTime)
  const [dateError, setDateError] = useState('')
  const [notice, setNotice] = useState('3-Day Duo Pack is ready. Pickup is set exactly 3 calendar days from the delivery date.')
  const selectedOffer = bookingOffers.find((offer) => offer.id === selectedId)
  const totalDays = selectedOffer?.id === 'midweek-single' ? 3 : getTotalDays(rentalStartDate, rentalEndDate)
  const planAmount = selectedOffer ? (selectedOffer.price / selectedOffer.days) * totalDays : 0
  const selectedAddOns = addOns.filter((addOn) => selectedAddOnIds.includes(addOn.id) && addOn.id !== 'controller-only').concat(extraControllerQuantity > 0 ? addOns.filter((addOn) => addOn.id === 'extra-controller').map((addOn) => ({ ...addOn, quantity: extraControllerQuantity })) : []).concat(controllerOnlyQuantity > 0 ? addOns.filter((addOn) => addOn.id === 'controller-only').map((addOn) => ({ ...addOn, quantity: controllerOnlyQuantity })) : [])
  const addOnsTotal = selectedAddOns.reduce((total, addOn) => total + addOn.price * (addOn.quantity || 1) * (addOn.perDay && addOn.id !== 'extra-controller' ? totalDays : 1), 0)
  const totalAmount = planAmount + addOnsTotal
  const selectionCount = (selectedOffer ? 1 : 0) + selectedAddOns.length
  const toggleAddOn = (id) => setSelectedAddOnIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  const showNotice = (message) => setNotice(message)
  const applyPlan = (id) => {
    const offer = bookingOffers.find((item) => item.id === id)
    if (!offer) return
    const start = offer.id === 'midweek-single' ? getNextTuesday(rentalStartDate) : rentalStartDate
    const end = addDays(start, offer.id === 'midweek-single' ? 3 : offer.days)
    setSelectedId(id)
    setControllerOnlyQuantity(0)
    setRentalStartDate(start)
    setRentalEndDate(end)
    setDateError('')
    showNotice(offer.id === 'midweek-single' ? 'Midweek Special: delivery Tuesday at your selected time, play Tuesday to Thursday, pickup Friday at your selected time.' : `${offer.name} selected. Your pickup date was updated to match its ${offer.days}-day rental.`)
  }
  const updateStartDate = (value) => {
    if (selectedOffer?.id === 'midweek-single' && new Date(`${value}T00:00:00`).getDay() !== 2) { showNotice('Midweek Special starts on Tuesday only. Please choose a Tuesday.'); return }
    setRentalStartDate(value)
    if (selectedOffer) setRentalEndDate(addDays(value, selectedOffer.id === 'midweek-single' ? 3 : selectedOffer.days))
    setDateError('')
  }
  const updateExtraControllers = (nextQuantity) => {
    const safeQuantity = Math.max(0, nextQuantity)
    setExtraControllerQuantity(safeQuantity)
    showNotice(safeQuantity ? `${safeQuantity} extra controller${safeQuantity > 1 ? 's' : ''} added at Rs.100 each.` : 'Extra controller removed.')
  }
  const selectControllerOnly = () => {
    setSelectedId(null)
    setSelectedAddOnIds([])
    setExtraControllerQuantity(0)
    setControllerOnlyQuantity(1)
    showNotice('Controllers Only selected. Your PS5 package and other add-ons were cleared.')
  }
  const updateControllerOnly = (nextQuantity) => {
    const safeQuantity = Math.max(0, nextQuantity)
    if (safeQuantity === 0) {
      const restoredEndDate = addDays(rentalStartDate, defaultOffer.days)
      setControllerOnlyQuantity(0)
      setSelectedId(defaultOffer.id)
      setRentalEndDate(restoredEndDate)
      showNotice(`Controllers Only removed. ${defaultOffer.name} is active again with a ${defaultOffer.days}-day rental.`)
      return
    }
    setControllerOnlyQuantity(safeQuantity)
    showNotice(`${safeQuantity} controller${safeQuantity > 1 ? 's' : ''} selected at Rs.200 per day.`)
  }
  const cancelControllerOnly = () => updateControllerOnly(0)
  const confirmBooking = () => {
    if (!selectedOffer && !controllerOnlyQuantity) { setDateError('Choose a PS5 package or Controllers Only rental.'); return false }
    if (!rentalStartDate || !rentalEndDate) { setDateError('Please choose rental dates.'); return false }
    return true
  }

  return <section className="page-section booking-page booking-builder-page"><div className="container"><div className="booking-builder-layout"><div className="booking-builder-main"><div className="booking-builder-heading"><p className="eyebrow">PS5 RENTAL BUILDER</p><h1>Build Your PS5 Package</h1><p>Delivery and pickup default to your current local time.</p></div>{notice && <div className="booking-notice" role="status"><CheckCircle2 size={18} /><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={16} /></button></div>}<section className="rental-dates" aria-label="Select rental schedule"><div className="rental-date-title"><CalendarDays size={18} /><span>Delivery & pickup schedule</span></div><div className="rental-date-fields"><label><span>Delivery date</span><input type="date" value={rentalStartDate} onChange={(event) => updateStartDate(event.target.value)} min={getToday()} /></label><label><span>Pickup date</span><input type="date" value={rentalEndDate} onChange={(event) => { if (!selectedOffer || selectedOffer.id !== 'midweek-single') setRentalEndDate(event.target.value) }} min={rentalStartDate} disabled={selectedOffer?.id === 'midweek-single'} /></label><label><span><Clock3 size={13} /> Delivery time</span><input type="time" value={deliveryTime} onChange={(event) => setDeliveryTime(event.target.value)} /></label><label><span><Clock3 size={13} /> Pickup time</span><input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} /></label></div>{selectedOffer?.id === 'midweek-single' && <div className="midweek-explainer"><strong>How the Midweek Special works</strong><span>Delivery: Tuesday, 8:00 PM</span><span>Play: Tuesday, Wednesday and Thursday</span><span>Pickup: Friday, 8:00 PM</span></div>}{dateError && <small className="date-error">{dateError}</small>}</section><PackageCarousel offers={bookingOffers} selectedId={selectedId} onSelect={applyPlan} /><AddOnsPicker addOns={addOns} days={totalDays} selectedIds={selectedAddOnIds} onToggle={toggleAddOn} extraControllerQuantity={extraControllerQuantity} onExtraControllerChange={updateExtraControllers} controllerOnlyQuantity={controllerOnlyQuantity} onControllerOnlyChange={updateControllerOnly} onControllerOnlySelect={selectControllerOnly} onControllerOnlyCancel={cancelControllerOnly} hasPlan={Boolean(selectedOffer)} /></div><BookingSummary selectedOffer={selectedOffer} selectedAddOns={selectedAddOns} startDate={rentalStartDate} endDate={rentalEndDate} deliveryTime={deliveryTime} pickupTime={pickupTime} totalDays={totalDays} planAmount={planAmount} addOnsTotal={addOnsTotal} totalAmount={totalAmount} selectionCount={selectionCount} controllerOnlyQuantity={controllerOnlyQuantity} onContinue={confirmBooking} /></div></div></section>
}

export default Booking
