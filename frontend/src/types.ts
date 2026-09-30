export interface Offer {
  id: string
  name: string
  days: number
  price: number
  controllers: number
  description: string
  rate: string
  featured?: boolean
  popular?: boolean
}

export interface AddOn {
  id: string
  name: string
  price: number
  unit: string
  description: string
  perDay: boolean
  gameOption?: boolean
  quantity?: number
}

export interface CustomerDetails {
  name: string
  mobile: string
  door: string
  address: string
  city: string
  pincode: string
  mapsLink: string
  need: string
  addressConfirmed: boolean
  location: { latitude: number; longitude: number } | null
}

export type CustomerErrors = Partial<Record<keyof CustomerDetails, string>>
export type CustomerTextField = Exclude<keyof CustomerDetails, 'location' | 'addressConfirmed'>
