export const isBookingTimeAllowed = (time: string) => {
  return typeof time === 'string' && /^\d{2}:[0-5]\d$/.test(time) && time >= '09:00' && time <= '22:00'
}
