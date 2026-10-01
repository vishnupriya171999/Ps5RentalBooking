import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Gamepad2, LockKeyhole, ShieldCheck, Smartphone } from 'lucide-react'
import '../brand-style.css'
import './admin-login.css'
import type { FormEvent } from 'react'
import { loginAdmin } from '../api/auth'
import { setLoginDetails, logout } from '../store/authSlice'
import { decodeLoginToken } from '../auth/session'
import { useAppDispatch } from '../store/hooks'

// Separate lanes and evenly staggered phases keep the rain spaced on every loop.
const fallingControllers = Array.from({ length: 10 }, (_, index) => ({
  left: `${2 + index * 10}%`,
  animationDuration: '20s',
  animationDelay: `${-((index * 3) % 10) * 2}s`,
  width: `${24 + index % 3 * 3}px`,
  height: `${(24 + index % 3 * 3) * 44 / 64}px`,
}))

const AdminLogin = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [submitting, setSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ mobile: '', password: '' })

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Admin Sign In | PS5 Rental Chennai'
    return () => { document.title = previousTitle }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget
    const data = new FormData(form)
    const mobile = String(data.get('mobile') || '').trim()
    const password = String(data.get('password') || '')
    const nextErrors = {
      mobile: !mobile ? 'Enter your mobile number.' : !/^[6-9][0-9]{9}$/.test(mobile) ? 'Enter a valid 10-digit mobile number.' : '',
      password: !password.trim() ? 'Enter your password.' : new TextEncoder().encode(password).length > 72 ? 'Password must be at most 72 bytes.' : '',
    }
    setErrors(nextErrors)
    setLoginError('')
    const firstInvalid = nextErrors.mobile ? 'mobile' : nextErrors.password ? 'password' : null
    const input = firstInvalid ? form.elements.namedItem(firstInvalid) : null
    if (input instanceof HTMLInputElement) input.focus({ preventScroll: true })
    if (firstInvalid) return
    dispatch(logout())
    setSubmitting(true)
    try {
      const token = await loginAdmin(mobile, password)

      if (!token) {
        throw new Error('Login failed')
      }

      const loginDetails = decodeLoginToken(token)

      dispatch(setLoginDetails(loginDetails))
      form.reset()
      navigate('/admin/dashboard', { replace: true })
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="admin-login">
      <div className="admin-background" aria-hidden="true" />
      <div className="admin-ambient admin-ambient-blue" aria-hidden="true" />
      <div className="admin-ambient admin-ambient-cyan" aria-hidden="true" />
      <div className="admin-controller-rain" aria-hidden="true">
        {fallingControllers.map((style, index) => (
          <span className="admin-falling-controller" style={style} key={index}>
            <svg viewBox="0 0 64 44" fill="none" shapeRendering="geometricPrecision">
              <path d="M17 7C10 7 7 13 5 22L2 34C1 41 8 43 12 38L20 30H44L52 38C56 43 63 41 62 34L59 22C57 13 54 7 47 7Z" fill="#e5f1ff" stroke="#ffffff" strokeWidth="1.5" />
              <path d="M22 10H42L40 22H24Z" fill="#172b49" stroke="#75caff" strokeWidth="1.5" />
              <path d="M20 29L12 38C8 42 3 39 4 34L7 24L15 27ZM44 29L52 38C56 42 61 39 60 34L57 24L49 27Z" fill="#214c83" />
              <path d="M13 15V23M9 19H17" stroke="#18304f" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="25" cy="28" r="4" fill="#0c1b30" stroke="#72bbff" />
              <circle cx="39" cy="28" r="4" fill="#0c1b30" stroke="#72bbff" />
              <circle cx="51" cy="14" r="1.8" fill="#49bdf1" /><circle cx="56" cy="19" r="1.8" fill="#f496c5" />
              <circle cx="46" cy="19" r="1.8" fill="#a59aff" /><circle cx="51" cy="24" r="1.8" fill="#60d5c7" />
            </svg>
          </span>
        ))}
      </div>
      <header className="admin-header container">
        <div className="brand">
          <img className="brand-mark" src="/images/brand/ps-rental-symbol.png" alt="" width="48" height="48" />PS5<span>RentalChennai</span>
        </div>
        <span className="admin-private"><ShieldCheck size={14} /> ADMINISTRATORS ONLY</span>
      </header>

      <div className="admin-layout container">
        <section className="admin-welcome" aria-labelledby="admin-welcome-title">
          <p className="admin-welcome-tag"><Gamepad2 size={18} /> ADMIN CONTROL CENTER</p>
          <h1 id="admin-welcome-title">Your business.<br />Your control.<br /><span>One admin space.</span></h1>
          <p className="admin-welcome-copy">Welcome to your administration workspace.<br />Sign in to manage your PS5 rental business.</p>
          <div className="admin-welcome-line"><span /><span>BUILT FOR YOUR DAILY OPERATIONS.</span></div>
        </section>
        <section className="admin-access" aria-labelledby="admin-login-title">
          <div className="admin-card">
            <div className="admin-card-head"><span className="admin-fingerprint"><Gamepad2 size={30} strokeWidth={1.35} /></span><span className="admin-card-badge"><span /> ADMIN ACCESS</span></div>
            <h2 id="admin-login-title">Admin login<span>.</span></h2>
            <p className="admin-login-description">Enter your admin credentials to continue.</p>

            <form className="admin-login-form" noValidate onSubmit={handleSubmit} onChange={event => {
              setLoginError('')
              const target = event.target
              if (!(target instanceof HTMLInputElement)) return
              const { name } = target
              if (name === 'mobile' || name === 'password') setErrors(previous => ({ ...previous, [name]: '' }))
            }}>
              <div className="admin-field">
                <label htmlFor="admin-mobile">Mobile number <span className="admin-required" aria-hidden="true">*</span></label>
                <div className={`admin-input-wrap${errors.mobile ? ' admin-input-error' : ''}`}><Smartphone size={18} aria-hidden="true" /><span className="admin-country-code" aria-hidden="true">+91</span><input id="admin-mobile" name="mobile" type="tel" inputMode="numeric" placeholder="Enter mobile number" disabled={submitting} autoComplete="username" pattern="[6-9][0-9]{9}" maxLength={10} title="Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9" aria-describedby="admin-mobile-help admin-mobile-error" aria-invalid={Boolean(errors.mobile)} required /></div>
                <span className="admin-sr-only" id="admin-mobile-help">Indian mobile number, country code +91. Enter 10 digits.</span>
                <p className="admin-field-error" id="admin-mobile-error" aria-live="polite">{errors.mobile}</p>
              </div>
              <div className="admin-field">
                <label htmlFor="admin-password">Password <span className="admin-required" aria-hidden="true">*</span></label>
                <div className={`admin-input-wrap${errors.password ? ' admin-input-error' : ''}`}>
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" disabled={submitting} autoComplete="current-password" aria-describedby="admin-password-error" aria-invalid={Boolean(errors.password)} required />
                  <button className="admin-password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} aria-controls="admin-password">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                <p className="admin-field-error" id="admin-password-error" aria-live="polite">{errors.password}</p>
              </div>
              <p className={`admin-auth-message${loginError ? ' has-error' : ''}`} role="status" aria-live="polite">{loginError || 'Access is limited to authorized administrators.'}</p>
              <button className="admin-submit" type="submit" disabled={submitting} aria-busy={submitting}><span>{submitting ? 'Signing in...' : 'Sign in to admin'}</span><ArrowRight size={19} /></button>
            </form>
          </div>
        </section>
      </div>

      <footer className="admin-footer container">
        <span>&copy; {new Date().getFullYear()} PS5 Rental Chennai <span className="admin-footer-separator">/</span> Administration</span>
      </footer>
    </main>
  )
}

export default AdminLogin
