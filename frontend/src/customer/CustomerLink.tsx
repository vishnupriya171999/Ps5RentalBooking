import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { useCustomerNavigation } from './customerNavigation'

const CustomerLink = ({ to, onClick = undefined, children, ...props }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }) => {
  const { open } = useCustomerNavigation()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    open(to)
  }

  return <a {...props} href="/customer" onClick={handleClick}>{children}</a>
}

export default CustomerLink
