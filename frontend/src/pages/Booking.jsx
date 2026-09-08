import { CalendarDays, CheckCircle2, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BookingSummary from '../components/BookingSummary'
import PackageCarousel from '../components/PackageCarousel'
import AddOnsPicker from '../components/AddOnsPicker'
import { addOns, bookingOffers } from '../data/offers'
import '../booking-builder.css'
import '../booking-builder-detail.css'
import '../booking-polish.css'
import '../rental-schedule.css'
import { isBookingTimeAllowed } from '../data/bookingTime'

const toDateInputValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const getToday = () => toDateInputValue(new Date())
const getCurrentTime = () => { const now = new Date(); const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; return time < '09:00' ? '09:00' : time > '22:00' ? '22:00' : time }
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
  const pickupTime = deliveryTime
  const [dateError, setDateError] = useState('')
  const [notice, setNotice] = useState('3-Day Duo Pack is ready. Pickup is set exactly 3 calendar days from the delivery date.')
  const selectedOffer = bookingOffers.find((offer) => offer.id === selectedId)
  const totalDays = selectedOffer?.id === 'midweek-single' ? 3 : getTotalDays(rentalStartDate, rentalEndDate)
  const planAmount = selectedOffer ? (selectedOffer.price / selectedOffer.days) * totalDays : 0
  const selectedAddOns = addOns.filter((addOn) => selectedAddOnIds.includes(addOn.id) && addOn.id !== 'controller-only').concat(extraControllerQuantity > 0 ? addOns.filter((addOn) => addOn.id === 'extra-controller').map((addOn) => ({ ...addOn, quantity: extraControllerQuantity })) : []).concat(controllerOnlyQuantity > 0 ? addOns.filter((addOn) => addOn.id === 'controller-only').map((addOn) => ({ ...addOn, quantity: controllerOnlyQuantity })) : [])
  const addOnsTotal = selectedAddOns.reduce((total, addOn) => total + addOn.price * (addOn.quantity || 1) * (addOn.perDay && addOn.id !== 'extra-controller' ? totalDays : 1), 0)
  const totalAmount = planAmount + addOnsTotal
  const selectionCount = (selectedOffer ? 1 : 0) + selectedAddOns.length
  const toggleAddOn = (id) => {
    const option = addOns.find((item) => item.id === id)
    if (option?.gameOption && !selectedOffer) return
    setSelectedAddOnIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      const remaining = option?.gameOption ? current.filter((item) => !addOns.find((addOn) => addOn.id === item)?.gameOption) : current
      return [...remaining, id]
    })
  }

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
    let message = ''
    let field = 'delivery-datetime'
    if (!selectedOffer && !controllerOnlyQuantity) message = 'Choose a PS5 package or Controllers Only rental.'
    else if (!rentalStartDate || !rentalEndDate) message = 'Please select both delivery and pickup dates.'
    else if (rentalStartDate < getToday()) message = 'Delivery date cannot be in the past.'
    else if (rentalEndDate <= rentalStartDate) { message = 'Pickup date must be after the delivery date.'; field = 'pickup-datetime' }
    else if (!isBookingTimeAllowed(deliveryTime)) { message = 'Choose a delivery time between 9:00 AM and 10:00 PM.'; field = 'delivery-datetime' }
    else if (!isBookingTimeAllowed(pickupTime)) { message = 'Choose a pickup time between 9:00 AM and 10:00 PM.'; field = 'delivery-datetime' }
    setDateError(message)
    if (message) {
      document.getElementById(field)?.focus({ preventScroll: true })
      document.querySelector('.rental-dates')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return false
    }
    return true
  }

  return <section className="page-section booking-page booking-builder-page"><div className="container"><div className="booking-builder-layout"><div className="booking-builder-main"><div className="booking-builder-heading"><p className="eyebrow">PS5 RENTAL BUILDER</p><h1>Build Your PS5 Package</h1><p>Choose your delivery and pickup dates. Service hours: 9:00 AM to 10:00 PM.</p></div>{notice && <div className="booking-notice" role="status"><CheckCircle2 size={18} /><span>{notice}</span></div>}<section className="rental-dates" aria-label="Select rental schedule"><div className="rental-date-title"><CalendarDays size={18} /><span>Delivery & pickup schedule</span></div><div className="rental-date-fields"><label><span><CalendarDays size={16} /> Delivery date &amp; time</span><input id="delivery-datetime" type="datetime-local" step="60" min={`${getToday()}T09:00`} aria-describedby="schedule-hours schedule-error" aria-invalid={Boolean(dateError) && !isBookingTimeAllowed(deliveryTime)} value={rentalStartDate && deliveryTime ? `${rentalStartDate}T${deliveryTime}` : ''} onChange={(event) => {
    const [date, time] = event.target.value.split('T')
    if (!date || !time) { setDateError('Please choose a complete delivery date and time.'); return }
    if (selectedOffer?.id === 'midweek-single' && new Date(`${date}T00:00:00`).getDay() !== 2) { setDateError('Midweek Special delivery must be on a Tuesday.'); return }
    updateStartDate(date)
    setDeliveryTime(time)
    setDateError(isBookingTimeAllowed(time) ? '' : 'Choose a delivery time between 9:00 AM and 10:00 PM.')
  }} /><small>Select your arrival date and time</small></label><label><span><CalendarDays size={16} /> Pickup date &amp; time</span><input id="pickup-datetime" type="datetime-local" step="60" min={`${addDays(rentalStartDate, 1)}T${pickupTime}`} aria-describedby="pickup-auto-help schedule-error" value={rentalEndDate && pickupTime ? `${rentalEndDate}T${pickupTime}` : ''} readOnly={selectedOffer?.id === 'midweek-single'} onChange={(event) => {
    const [date, time] = event.target.value.split('T')
    if (!date || !time) { setDateError('Please choose a complete pickup date. Pickup time is calculated automatically.'); return }
    setRentalEndDate(date)
    setDateError(date <= rentalStartDate ? 'Pickup date must be after the delivery date.' : !isBookingTimeAllowed(deliveryTime) ? 'Choose a delivery time between 9:00 AM and 10:00 PM.' : '')
    if (time !== pickupTime) showNotice('Pickup time automatically matches delivery time: 24 hours per rental day.')
  }} /><small id="pickup-auto-help">{selectedOffer?.id === 'midweek-single' ? 'Automatically set to Friday at your delivery time' : 'Choose a date; time automatically matches delivery'}</small></label></div>{selectedOffer?.id === 'midweek-single' && <div className="midweek-explainer"><strong>How the Midweek Special works</strong><span>Delivery: Tuesday, 8:00 PM</span><span>Play: Tuesday, Wednesday and Thursday</span><span>Pickup: Friday, 8:00 PM</span></div>}<p className="schedule-hours" id="schedule-hours"><Clock3 size={15} /> Delivery & pickup: 9:00 AM to 10:00 PM</p><p className="schedule-hours">Pickup matches your delivery time on the pickup date: 24 hours per rental day.</p><small className="date-error" id="schedule-error" role="alert">{dateError}</small></section><PackageCarousel offers={bookingOffers} selectedId={selectedId} onSelect={applyPlan} /><AddOnsPicker addOns={addOns} days={totalDays} selectedIds={selectedAddOnIds} onToggle={toggleAddOn} extraControllerQuantity={extraControllerQuantity} onExtraControllerChange={updateExtraControllers} controllerOnlyQuantity={controllerOnlyQuantity} onControllerOnlyChange={updateControllerOnly} onControllerOnlySelect={selectControllerOnly} onControllerOnlyCancel={cancelControllerOnly} hasPlan={Boolean(selectedOffer)} /></div><BookingSummary selectedOffer={selectedOffer} selectedAddOns={selectedAddOns} startDate={rentalStartDate} endDate={rentalEndDate} deliveryTime={deliveryTime} pickupTime={pickupTime} totalDays={totalDays} planAmount={planAmount} addOnsTotal={addOnsTotal} totalAmount={totalAmount} selectionCount={selectionCount} controllerOnlyQuantity={controllerOnlyQuantity} onValidateSchedule={confirmBooking} onContinue={confirmBooking} /></div></div></section>
}

export default Booking
