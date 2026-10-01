import { store } from '../store/store'
import { logout, setLoginDetails } from '../store/authSlice'
import { LOGIN_STORAGE_KEY, loadLoginDetails } from './session'

export const initializeSession = () => {
  const saved = loadLoginDetails()
  if (saved) store.dispatch(setLoginDetails(saved))
  // Keep browser storage in sync with Redux after login and logout.
  let expiryTimer: ReturnType<typeof setTimeout> | undefined
  const scheduleLogout = () => {
    clearTimeout(expiryTimer)
    const session = store.getState().auth.loginDetails
    if (session) expiryTimer = setTimeout(() => store.dispatch(logout()), Math.max(0, session.expiresAt - Date.now()))
  }
  scheduleLogout()
  let previousSession = store.getState().auth.loginDetails
  const unsubscribe = store.subscribe(() => {
    const session = store.getState().auth.loginDetails
    if (session === previousSession) return
    previousSession = session
    scheduleLogout()
    try {
      if (session) localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(session))
      else localStorage.removeItem(LOGIN_STORAGE_KEY)
    } catch {
      // Login still works in memory when browser storage is unavailable.
    }
  })

  const onStorage = (event: StorageEvent) => {
    if ((event.key === LOGIN_STORAGE_KEY && event.newValue === null) || event.key === null) store.dispatch(logout())
  }
  window.addEventListener('storage', onStorage)


  // Recheck after a sleeping or background tab becomes active.
  const checkExpiry = () => {
    const session = store.getState().auth.loginDetails
    if (session && session.expiresAt <= Date.now()) store.dispatch(logout())
  }
  window.addEventListener('focus', checkExpiry)
  document.addEventListener('visibilitychange', checkExpiry)

  return () => {
    clearTimeout(expiryTimer)
    unsubscribe()
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', checkExpiry)
    document.removeEventListener('visibilitychange', checkExpiry)
  }
}
