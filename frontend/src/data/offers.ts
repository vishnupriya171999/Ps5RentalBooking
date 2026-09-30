import type { Offer, AddOn } from '../types'

export const rentalConfig = { dailyRate: 450, consoleLimit: 3 }

export const offers: Offer[] = [
  { id: 'daily-single', name: 'Solo Day Pass', days: 1, price: 500, controllers: 1, description: 'A full day of PS5 gaming with one controller.', rate: '₹500 / day', featured: true },
  { id: 'three-day-single', name: '3-Day Solo Pack', days: 3, price: 1200, controllers: 1, description: 'More time to play, with a better daily price.', rate: '₹400 / day', popular: true },
  { id: 'daily-duo', name: 'Duo Day Pass', days: 1, price: 600, controllers: 2, description: 'One epic day of couch co-op with two controllers.', rate: '₹600 / day', featured: true },
  { id: 'three-day-duo', name: '3-Day Duo Pack', days: 3, price: 1500, controllers: 2, description: 'The best choice for a long multiplayer weekend.', rate: '₹500 / day', featured: true },
  { id: 'monthly-duo-premium', name: 'Monthly Duo Pack', days: 30, price: 10500, controllers: 2, description: 'A full month of premium two-controller gaming.', rate: '₹350 / day' },
  { id: 'monthly-single-saver', name: 'Monthly Single Saver', days: 30, price: 9000, controllers: 1, description: 'Enjoy 30 days of PS5 gaming with one controller at our lowest monthly daily rate.', rate: '₹300 / day', popular: true },
].sort((a, b) => a.days - b.days)

export const specialOffer: Offer = { id: 'midweek-single', name: 'Midweek Special', days: 3, price: 1350, controllers: 1, description: 'Tuesday to Thursday only — three days of PS5 gaming at a special midweek price.', rate: '₹450 / day' }
export const bookingOffers = [...offers, specialOffer].sort((a, b) => a.days - b.days)

export const addOns: AddOn[] = [
  { id: 'special-games', name: 'Special Games Pack', price: 300, unit: 'per package', description: 'Choose games from our Special Catalogue. Select one game option for your rental.', perDay: false, gameOption: true },
  { id: 'aaa-games', name: 'Unlisted or New Games', price: 1000, unit: 'per package', description: 'Request games outside our catalogue or new titles. Add your game names in the booking notes.', perDay: false, gameOption: true },
  { id: 'extra-controller', name: 'Extra Controller', price: 100, unit: 'per day', description: 'Add another controller for more players.', perDay: true },
  { id: 'controller-only', name: 'Controller Only', price: 200, unit: 'per controller / day', description: 'Rent a controller without the console.', perDay: true },
  { id: 'gaming-headphones', name: 'Gaming Headphones', price: 50, unit: 'per package', description: 'Private, immersive sound for your session.', perDay: false },
]

export const deliveryNote = 'Free delivery up to 10 km · ₹200 delivery charge above 10 km'
export const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
