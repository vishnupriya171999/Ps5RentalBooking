const phoneNumber = '919789830356'

export const whatsappMessages = {
  booking: "Hi PS5 Rental Chennai! I'd like to rent a PS5. Could you share the available dates, rental packages, and delivery details?",
  enquiry: "Hi PS5 Rental Chennai! I'm interested in renting a PS5. Could you help me with pricing, available games, and current offers?",
}

export const getWhatsAppLink = (message = whatsappMessages.enquiry) => {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}
