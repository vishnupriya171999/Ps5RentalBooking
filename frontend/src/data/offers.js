export const rentalConfig = { dailyRate: 499, consoleLimit: 3 }
export const offers = [
  { id: 'daily', name: 'Daily Rental', days: 1, price: 499, description: 'A full day of next-level gaming, perfect for a quick session.' },
  { id: 'weekend', name: 'Weekend Package', days: 2, price: 899, description: 'Your complete weekend sorted with more play for less.', popular: true },
  { id: 'three-day', name: '3 Day Gaming Package', days: 3, price: 1299, description: 'An extended gaming escape for the serious player.' },
]
export const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`
