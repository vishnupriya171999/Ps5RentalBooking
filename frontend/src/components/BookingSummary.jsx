import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, PackageCheck, Sparkles } from 'lucide-react'
import { formatPrice } from '../data/offers'
import '../booking-card.css'

const displayDate = (value) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const displayTime = (value) => {
  const [hour, minute] = value.split(':').map(Number)
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
}

function BookingSummary({ selectedOffer, selectedAddOns, startDate, endDate, deliveryTime, pickupTime, totalDays, planAmount, addOnsTotal, totalAmount, selectionCount, controllerOnlyQuantity, onContinue }) {
  const controllerOnly = !selectedOffer && controllerOnlyQuantity > 0
  const dailyRate = selectedOffer ? selectedOffer.price / selectedOffer.days : 0
  const optionalAddOns = selectedAddOns.filter((addOn) => addOn.id !== 'controller-only')
  const baseAmount = controllerOnly ? addOnsTotal : planAmount
  const rentalName = controllerOnly ? `Controllers Only - ${controllerOnlyQuantity} selected` : `${selectedOffer.name} - ${totalDays} days`
  const rentalRate = controllerOnly ? `${formatPrice(200)} / controller / day x ${totalDays} days` : `${formatPrice(dailyRate)} / day x ${totalDays} days`
  const controllerText = controllerOnly ? `${controllerOnlyQuantity} controller${controllerOnlyQuantity > 1 ? 's' : ''}` : `${selectedOffer.controllers} controller${selectedOffer.controllers > 1 ? 's' : ''}`

  return <aside className="booking-summary booking-summary-premium booking-summary-detailed"><div className="summary-glow" /><div className="summary-header"><div><p className="eyebrow">BOOKING SUMMARY</p><h2><PackageCheck size={20} /> Booking Summary</h2></div><span><Sparkles size={18} /></span></div><div className="summary-details"><section className="summary-block"><div className="summary-block-title"><span>{controllerOnly ? 'Rental' : 'Package'}</span><small>{controllerOnly ? 'Controllers only' : 'Selected plan'}</small></div><div className="summary-row"><span>{rentalName}</span><strong>{formatPrice(baseAmount)}</strong></div><div className="summary-rate-line"><span>{rentalRate}</span><span>{controllerText}</span></div></section><section className="summary-block"><div className="summary-block-title"><span>Rental period</span><small>{totalDays} days</small></div><div className="summary-date-line"><CalendarDays size={15} /><span>{displayDate(startDate)} to {displayDate(endDate)}</span><strong>{totalDays} days</strong></div><div className="summary-time-line"><Clock3 size={14} /><span>Delivery {displayTime(deliveryTime)}</span><span>Pickup {displayTime(pickupTime)}</span></div></section>{optionalAddOns.length > 0 && <section className="summary-block"><div className="summary-block-title"><span>Add-ons</span><small>{optionalAddOns.length} selected</small></div><div className="summary-addon-list">{optionalAddOns.map((addOn) => { const amount = addOn.price * (addOn.quantity || 1) * (addOn.perDay && addOn.id !== 'extra-controller' ? totalDays : 1); const rate = addOn.perDay && addOn.id !== 'extra-controller' ? `${formatPrice(addOn.price)}/day x ${totalDays} days` : `${formatPrice(addOn.price)} each`; return <div key={addOn.id}><span>{addOn.name}<small>{addOn.quantity > 1 ? `${addOn.quantity} x ` : ''}{rate}</small></span><strong>{formatPrice(amount)}</strong></div> })}</div></section>}<section className="summary-charges"><div><span>{controllerOnly ? 'Controller rental' : 'Daily rental'}</span><strong>{controllerOnly ? `${formatPrice(200 * controllerOnlyQuantity)} / day` : `${formatPrice(dailyRate)} / day`}</strong></div>{optionalAddOns.length > 0 && <div><span>Add-ons</span><strong>{formatPrice(addOnsTotal)}</strong></div>}</section><div className="summary-delivery summary-delivery-inline"><MapPin size={16} /><span><strong>Delivery</strong><em>Free up to 10 km; Rs.200 above 10 km</em></span></div></div><div className="summary-total summary-total-premium"><span>Grand total</span><strong>{formatPrice(totalAmount)}</strong><small>{selectionCount} selection{selectionCount > 1 ? 's' : ''} included</small></div><button type="button" className="button button-primary summary-continue" onClick={onContinue}>Confirm booking <ArrowRight size={18} /></button><p className="secure-note"><CheckCircle2 size={17} /> Your package is ready to confirm.</p></aside>
}

export default BookingSummary
