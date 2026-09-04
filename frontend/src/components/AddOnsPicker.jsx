import { Check, Gamepad2, Headphones, Minus, Plus } from 'lucide-react'
import { formatPrice } from '../data/offers'
import '../booking-controls.css'

function QuantityControl({ quantity, onChange, label, disabled = false }) {
  return <span className="addon-stepper" aria-label={label} onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => onChange(Math.max(0, quantity - 1))} disabled={disabled || quantity === 0} aria-label={`Remove ${label}`}><Minus size={15} /></button><strong>{quantity}</strong><button type="button" onClick={() => onChange(quantity + 1)} disabled={disabled} aria-label={`Add ${label}`}><Plus size={15} /></button></span>
}

function AddOnsPicker({ addOns, days, selectedIds, onToggle, extraControllerQuantity, onExtraControllerChange, controllerOnlyQuantity, onControllerOnlyChange, onControllerOnlySelect, onControllerOnlyCancel, hasPlan }) {
  const itemPrice = (addOn) => addOn.price * (addOn.perDay ? days : 1)
  return <section className="booking-addons"><div className="booking-addons-heading"><div><p className="eyebrow">OPTIONAL EXTRAS</p><h2>Games & <span>add-ons.</span></h2></div><p>Add only what you want for this session.</p></div><div className="booking-addons-grid">{addOns.map((addOn) => {
    const isExtraController = addOn.id === 'extra-controller'
    const isControllerOnly = addOn.id === 'controller-only'
    const selected = isExtraController ? extraControllerQuantity > 0 : isControllerOnly ? controllerOnlyQuantity > 0 : selectedIds.includes(addOn.id)
    const Icon = addOn.id === 'gaming-headphones' ? Headphones : Gamepad2
    if (isExtraController) return <div className={`booking-addon extra-controller-addon ${selected ? 'selected' : ''} ${!hasPlan ? 'unavailable' : ''}`} key={addOn.id} role="button" tabIndex={hasPlan ? '0' : '-1'} aria-pressed={selected} aria-disabled={!hasPlan} onClick={() => hasPlan && !selected && onExtraControllerChange(1)}><span className="booking-addon-icon">{selected ? <Check size={18} /> : <Icon size={18} />}</span><span className="booking-addon-copy"><strong>{addOn.name}</strong><small>{hasPlan ? 'Use the controls to add or remove controllers.' : 'Choose a PS5 plan to unlock this add-on.'}</small></span><span className="booking-addon-price"><strong>{formatPrice(addOn.price)}/day</strong><small>Per controller</small></span><QuantityControl quantity={extraControllerQuantity} onChange={onExtraControllerChange} label="extra controller" disabled={!hasPlan} /></div>
    if (isControllerOnly) return <div className={`booking-addon extra-controller-addon controller-only-addon ${selected ? 'selected' : ''}`} key={addOn.id} role="button" tabIndex="0" aria-pressed={selected} onClick={() => selected ? onControllerOnlyCancel() : onControllerOnlySelect()}><span className="booking-addon-icon">{selected ? <Check size={18} /> : <Gamepad2 size={18} />}</span><span className="booking-addon-copy"><strong>Controllers Only</strong><small>{selected ? 'Click again to restore the default PS5 package.' : 'Rent controllers without a PS5 console.'}</small></span><span className="booking-addon-price"><strong>{formatPrice(addOn.price)}/day</strong><small>Per controller</small></span><QuantityControl quantity={controllerOnlyQuantity} onChange={onControllerOnlyChange} label="controller" /></div>
    return <button type="button" className={`booking-addon ${selected ? 'selected' : ''}`} onClick={() => onToggle(addOn.id)} aria-pressed={selected} key={addOn.id}><span className="booking-addon-icon">{selected ? <Check size={18} /> : <Icon size={18} />}</span><span className="booking-addon-copy"><strong>{addOn.name}</strong><small>{addOn.description}</small></span><span className="booking-addon-price"><strong>{formatPrice(itemPrice(addOn))}</strong><small>{addOn.perDay ? `${formatPrice(addOn.price)}/day x ${days} days` : addOn.unit}</small></span></button>
  })}</div></section>
}

export default AddOnsPicker
