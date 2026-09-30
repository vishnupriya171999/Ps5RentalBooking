import { createContext, useContext } from 'react'

export interface CustomerNavigation {
  pathname: string
  search: string
  hash: string
  state: { bookingId?: string } | null
  open: (target: string) => void
}

export const CustomerNavigationContext = createContext<CustomerNavigation | null>(null)

export const useCustomerNavigation = () => {
  const navigation = useContext(CustomerNavigationContext)
  if (!navigation) throw new Error('Customer navigation must be used inside CustomerPanel')
  return navigation
}
