export const isGoogleMapsLocation = (value: string) => {
  const input = value.trim()
  if (/\s/.test(input)) return false
  try {
    const url = new URL(input)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return false
    const host = url.hostname
    if (host === 'maps.app.goo.gl') return url.pathname.length > 1
    if (host === 'goo.gl') return /^\/maps\/[^/]+/.test(url.pathname)
    if (['maps.google.com', 'maps.google.co.in'].includes(host)) {
      return url.pathname.length > 1 || Boolean(url.searchParams.get('q')?.trim() || url.searchParams.get('query')?.trim())
    }
    if (['google.com', 'www.google.com', 'google.co.in', 'www.google.co.in'].includes(host)) {
      return /^\/maps(?:\/|$)/.test(url.pathname) && (
        url.pathname.replace(/^\/maps\/?/, '').length > 0 ||
        Boolean(url.searchParams.get('q')?.trim() || url.searchParams.get('query')?.trim() || url.searchParams.get('destination')?.trim())
      )
    }
    return false
  } catch {
    return false
  }
}
