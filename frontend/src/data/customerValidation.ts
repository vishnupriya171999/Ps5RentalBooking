import type { CustomerDetails, CustomerErrors } from '../types'
import { isGoogleMapsLocation } from './googleMaps'

export const validateCustomerDetails = (details: CustomerDetails) => {
  const errors: CustomerErrors = {}
  const name = details.name.trim()
  if (name.length < 2 || name.length > 80 || !/^[\p{L}\p{M} .'-]+$/u.test(name) || !/\p{L}/u.test(name)) errors.name = 'Enter your name using 2–80 characters, without numbers or symbols.'
  if (!/^[6-9]\d{9}$/.test(details.mobile.trim())) errors.mobile = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
  const location = details.location
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude) || Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180 || !isGoogleMapsLocation(details.mapsLink) || details.mapsLink !== `https://maps.google.com/?q=${location.latitude},${location.longitude}`) errors.location = 'Tap “Use current location” and allow access to capture your delivery map pin.'
  if (details.door.trim().length < 1 || details.door.trim().length > 80 || !/[\p{L}\p{N}]/u.test(details.door)) errors.door = 'Enter your door / flat number or house name (up to 80 characters).'
  if (details.address.trim().length < 10 || details.address.trim().length > 500 || !/\p{L}/u.test(details.address) || /https?:\/\//i.test(details.address)) errors.address = 'Enter your street and area in full (10–500 characters), not a Maps link.'
  if (details.city.trim().length < 2 || details.city.trim().length > 80 || !/^[\p{L}\p{M} .'-]+$/u.test(details.city)) errors.city = 'Enter your town or city name (2–80 characters).'
  if (!/^[1-9]\d{5}$/.test(details.pincode.trim())) errors.pincode = 'Enter a valid 6-digit delivery PIN code.'
  if (details.need.trim().length > 500) errors.need = 'Keep delivery notes within 500 characters.'
  if (!details.addressConfirmed) errors.addressConfirmed = 'Confirm that the address is complete and the map pin is at your delivery location.'
  return errors
}

export const buildCustomerDetails = (details: CustomerDetails) => {
  return { ...details, name: details.name.trim(), mobile: details.mobile.trim(), door: details.door.trim(), city: details.city.trim(), pincode: details.pincode.trim(), need: details.need.trim(), address: [details.door, details.address, details.city, details.pincode].map(value => value.trim()).join(', ') }
}
