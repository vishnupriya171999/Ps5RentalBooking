export type BookingStatus = 'Out for delivery' | 'Active rental' | 'Return due' | 'Confirmed'
export interface DemoBooking {
  id: string
  customer: string
  initials: string
  area: string
  plan: string
  console: string
  time: string
  amount: number
  status: BookingStatus
}

export const demoBookings: DemoBooking[] = [
  { id: 'PS-1048', customer: 'Arjun Kumar', initials: 'AK', area: 'Velachery', plan: '3-Day Duo Pack', console: 'PS5-01', time: '10:30 AM', amount: 1500, status: 'Out for delivery' },
  { id: 'PS-1047', customer: 'Priya Raj', initials: 'PR', area: 'Adyar', plan: 'Solo Day Pass', console: 'PS5-02', time: '11:00 AM', amount: 500, status: 'Return due' },
  { id: 'PS-1046', customer: 'Karthik S', initials: 'KS', area: 'Anna Nagar', plan: 'Monthly Duo Pack', console: 'PS5-03', time: '12:00 PM', amount: 10500, status: 'Active rental' },
  { id: 'PS-1045', customer: 'Nisha Anand', initials: 'NA', area: 'Porur', plan: 'Duo Day Pass', console: 'PS5-04', time: '02:00 PM', amount: 600, status: 'Confirmed' },
]

export const demoInventory = [
  { id: 'PS5-01', name: 'PlayStation 5', edition: 'Disc edition', status: 'Reserved', detail: 'Delivery at 10:30 AM' },
  { id: 'PS5-02', name: 'PlayStation 5', edition: 'Disc edition', status: 'Rented', detail: 'Return at 11:00 AM' },
  { id: 'PS5-03', name: 'PlayStation 5', edition: 'Slim edition', status: 'Rented', detail: 'Monthly rental' },
  { id: 'PS5-04', name: 'PlayStation 5', edition: 'Slim edition', status: 'Reserved', detail: 'Delivery at 02:00 PM' },
  { id: 'PS5-05', name: 'PlayStation 5', edition: 'Disc edition', status: 'Available', detail: 'Tested and ready' },
  { id: 'PS5-06', name: 'PlayStation 5', edition: 'Slim edition', status: 'Available', detail: 'Tested and ready' },
]

export const revenueSeries = {
  week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [1500, 2200, 1800, 3600, 2900, 4800, 4100] },
  month: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [12400, 16200, 14800, 20900] },
}
