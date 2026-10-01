import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/authSlice'
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronRight, ClipboardList, Clock3, Gamepad2, IndianRupee, LayoutDashboard, LogOut, Package, Search, ShieldCheck, Truck, Users, X } from 'lucide-react'
import ManagersModule from './ManagersModule'
import type { DemoBooking } from './dashboardData'
import { demoBookings, demoInventory, revenueSeries } from './dashboardData'
import { formatPrice } from '../data/offers'
import '../brand-style.css'
import './admin-dashboard.css'

type View = 'overview' | 'bookings' | 'availability' | 'inventory' | 'managers'
const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Customer orders', icon: ClipboardList },
  { id: 'availability', label: 'Availability', icon: CalendarDays },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'managers', label: 'Managers', icon: Users },
] as const

const BookingDetails = ({ booking, onClose }: { booking: DemoBooking; onClose: () => void }) => {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return <dialog ref={dialog} className="dash-dialog" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="dash-dialog-content">
      <button className="dash-icon-button dash-dialog-close" onClick={onClose} aria-label="Close order details"><X size={20} /></button>
      <p className="dash-eyebrow">SAMPLE ORDER / {booking.id}</p>
      <h2>{booking.customer}</h2><p className="dash-muted">{booking.area}, Chennai</p>
      <dl className="dash-order-details"><div><dt>Rental package</dt><dd>{booking.plan}</dd></div><div><dt>Console</dt><dd>{booking.console}</dd></div><div><dt>Scheduled time</dt><dd>{booking.time}</dd></div><div><dt>Status</dt><dd>{booking.status}</dd></div><div><dt>Order amount</dt><dd>{formatPrice(booking.amount)}</dd></div></dl>
      <p className="dash-demo-note">This is a sample order for the dashboard preview.</p>
    </div>
  </dialog>
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const admin = useAppSelector(state => state.auth.loginDetails?.user)
  const location = useLocation()
  const [localView, setView] = useState<View>('overview')
  const view: View = location.pathname.startsWith('/admin/dashboard/managers') ? 'managers' : localView
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [selectedBooking, setSelectedBooking] = useState<DemoBooking | null>(null)
  const [status, setStatus] = useState('All orders')
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const previous = document.title
    document.title = 'Admin Dashboard | PS5 Rental Chennai'
    return () => { document.title = previous }
  }, [])
  const openView = (next: View) => {
    if (next === 'managers') navigate('/admin/dashboard/managers')
    else { setView(next); navigate('/admin/dashboard') }
    setQuery('')
    setStatus('All orders')
    window.scrollTo({ top: 0, behavior: 'instant' })
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }))
  }
  const series = revenueSeries[period]
  const total = series.values.reduce((sum, value) => sum + value, 0)
  const max = Math.max(...series.values)
  const points = series.values.map((value, index) => `${20 + index * 560 / (series.values.length - 1)},${155 - value / max * 125}`).join(' ')
  const bookings = demoBookings.filter(booking => `${booking.id} ${booking.customer} ${booking.area}`.toLowerCase().includes(query.toLowerCase()) && (status === 'All orders' || booking.status === status))
  const inventory = demoInventory.filter(item => (view !== 'availability' || item.status === 'Available') && `${item.id} ${item.name} ${item.status} ${item.edition}`.toLowerCase().includes(query.toLowerCase()))
  const pageTitle = { overview: 'Your rental business, at a glance.', bookings: 'Every order. All in one place.', availability: 'Ready for the next player.', inventory: 'A home for every console.', managers: 'The people behind every rental.' }[view]

  return <div className={`admin-dashboard ${view === 'managers' ? 'manager-workspace' : ''}`}>
    <aside className="dash-sidebar">
      <div className="brand dash-brand"><img className="brand-mark" src="/images/brand/ps-rental-symbol.png" alt="" width="48" height="48" />PS5<span>RentalChennai</span></div>
      <div className="dash-workspace"><span className="dash-workspace-icon"><Gamepad2 size={21} /></span><div><strong>Admin workspace</strong><span>Chennai operations</span></div><span className="dash-online-dot" /></div>
      <p className="dash-nav-label">WORKSPACE</p>
      <nav className="dash-nav" aria-label="Admin navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'active' : ''} aria-current={view === id ? 'page' : undefined} onClick={() => openView(id)}><Icon size={19} /><span>{label}</span>{id === 'bookings' && <small>{demoBookings.length}</small>}</button>)}</nav>
      <div className="dash-sidebar-bottom"><div className="dash-preview-card"><ShieldCheck size={21} /><strong>Your admin space.<br />Built around your day.</strong><p>Live manager directory<br />Rental data preview</p></div><button className="dash-signout" onClick={() => { dispatch(logout()); navigate('/admin', { replace: true }) }}><LogOut size={18} />Sign out<ArrowRight size={16} /></button></div>
    </aside>

    <main className="dash-main">
      <header className="dash-topbar"><div className="dash-breadcrumb">Workspace<ChevronRight size={14} /><strong>{navigation.find(item => item.id === view)?.label}</strong></div><div className="dash-topbar-right">{view !== 'managers' && <span className="dash-preview-badge"><span />Design preview</span>}<span className="dash-avatar" aria-label="Administrator">AD</span></div></header>
      <div className="dash-content">
        {view !== 'managers' && <div className="dash-page-heading"><div><p className="dash-eyebrow">PS5 RENTAL / ADMINISTRATION</p><h1 ref={heading} tabIndex={-1}>{pageTitle}</h1><p>Welcome back, {admin?.name || 'admin'}. Here is what is happening with your rentals.</p></div><span className="dash-date"><CalendarDays size={16} />{new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}</span></div>}

        {view === 'overview' ? <>
          <section className="dash-stats" aria-label="Sample business statistics">
            {[{ label: 'Rental revenue', value: formatPrice(total), note: period === 'week' ? 'Sample week' : 'Sample month', icon: IndianRupee, color: 'blue' }, { label: 'Customer orders', value: '04', note: 'Across all rental stages', icon: ClipboardList, color: 'violet' }, { label: 'Consoles available', value: '02 / 06', note: 'Tested and ready to rent', icon: Gamepad2, color: 'mint' }, { label: 'Returns due', value: '01', note: 'Next pickup at 11:00 AM', icon: ArrowDownLeft, color: 'amber' }].map(({ label, value, note, icon: Icon, color }) => <article className={`dash-stat ${color}`} key={label}><div><span>{label}</span><Icon size={19} /></div><strong>{value}</strong><p><span className="dash-stat-dot" />{note}</p></article>)}
          </section>

          <div className="dash-middle-grid">
            <section className="dash-panel dash-revenue"><div className="dash-panel-heading"><div><h2>Rental performance</h2><p>A little perspective on the bigger picture.</p></div><div className="dash-period" aria-label="Revenue period"><button aria-pressed={period === 'week'} onClick={() => setPeriod('week')}>Week</button><button aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>Month</button></div></div><div className="dash-revenue-total"><strong>{formatPrice(total)}</strong><span><span />Sample revenue</span></div><div className="dash-chart"><svg viewBox="0 0 600 180" role="img" aria-label={`${period === 'week' ? 'Weekly' : 'Monthly'} sample revenue: ${series.labels.map((label, index) => `${label} ${formatPrice(series.values[index])}`).join(', ')}`}><defs><linearGradient id="dash-revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a9aff" stopOpacity=".25" /><stop offset="100%" stopColor="#3a9aff" stopOpacity="0" /></linearGradient></defs>{[30, 75, 120, 165].map(y => <line key={y} x1="20" x2="580" y1={y} y2={y} stroke="#203047" strokeDasharray="3 6" />)}<polygon points={`20,175 ${points} 580,175`} fill="url(#dash-revenue-fill)" /><polyline points={points} fill="none" stroke="#64b5ff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{series.values.map((value, index) => <circle key={index} cx={20 + index * 560 / (series.values.length - 1)} cy={155 - value / max * 125} r="4" fill="#0c1422" stroke="#90ceff" strokeWidth="2"><title>{series.labels[index]}: {formatPrice(value)}</title></circle>)}</svg><div className="dash-chart-labels">{series.labels.map(label => <span key={label}>{label}</span>)}</div></div></section>
            <section className="dash-fleet"><div><span className="dash-fleet-tag"><span />READY TO PLAY</span><h2>Next booking?{' '}<br />You are ready.</h2><p>2 consoles are available<br />for their next adventure.</p><button onClick={() => openView('availability')}>Check availability<ArrowUpRight size={17} /></button></div><div className="dash-fleet-foot"><Gamepad2 size={16} /><span>PlayStation 5 fleet</span><strong>06 units</strong></div></section>
          </div>
        </> : null}

        {(view === 'overview' || view === 'bookings') && <div className={view === 'overview' ? 'dash-bottom-grid' : ''}>
          <section className="dash-panel dash-orders"><div className="dash-panel-heading"><div><h2>{view === 'overview' ? 'Recent orders' : 'Customer orders'} <span className="dash-count">{demoBookings.length}</span></h2><p>The latest from your rental desk.</p></div>{view === 'overview' && <button className="dash-text-button" onClick={() => openView('bookings')}>View all<ArrowRight size={15} /></button>}</div>
            <div className="dash-table-tools"><label className="dash-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search customer or order..." aria-label="Search orders" /></label>{view === 'bookings' && <select aria-label="Filter order status" value={status} onChange={event => setStatus(event.target.value)}>{['All orders', 'Out for delivery', 'Active rental', 'Return due', 'Confirmed'].map(item => <option key={item}>{item}</option>)}</select>}</div>
            <div className="dash-table-scroll" tabIndex={0} role="region" aria-label="Customer orders"><table><thead><tr><th>Customer</th><th>Package</th><th>Amount</th><th>Status</th><th><span className="dash-sr-only">Order details</span></th></tr></thead><tbody>{bookings.map(booking => <tr key={booking.id}><td><div className="dash-customer"><span className="dash-customer-avatar">{booking.initials}</span><div><strong>{booking.customer}</strong><small>{booking.id} / {booking.area}</small></div></div></td><td>{booking.plan}</td><td className="dash-amount">{formatPrice(booking.amount)}</td><td><span className={`dash-status ${booking.status === 'Return due' ? 'amber' : booking.status === 'Active rental' ? 'mint' : 'blue'}`}><span />{booking.status}</span></td><td><button className="dash-icon-button" aria-label={`View order ${booking.id}`} onClick={() => setSelectedBooking(booking)}><ArrowUpRight size={17} /></button></td></tr>)}</tbody></table>{!bookings.length && <p className="dash-empty">No sample orders match your search.</p>}</div>
          </section>
          {view === 'overview' && <section className="dash-panel dash-schedule"><div className="dash-panel-heading"><div><h2>On the schedule</h2><p>Your next moves, sorted.</p></div><Clock3 size={18} /></div><div className="dash-timeline">{[demoBookings[0], demoBookings[1], demoBookings[3]].map((booking, index) => <button key={booking.id} onClick={() => setSelectedBooking(booking)}><span className={`dash-timeline-icon ${index === 1 ? 'amber' : 'blue'}`}>{index === 1 ? <ArrowDownLeft size={17} /> : <Truck size={17} />}</span><span><small>{booking.time}</small><strong>{index === 1 ? 'Console pickup' : 'Console delivery'}</strong><span>{booking.customer} / {booking.area}</span></span><ChevronRight size={14} /></button>)}</div><div className="dash-schedule-note"><Check size={15} />A clear plan for a smoother day.</div></section>}
        </div>}

        {(view === 'inventory' || view === 'availability') && <section className="dash-panel dash-inventory"><div className="dash-panel-heading"><div><h2>{view === 'inventory' ? 'Your console fleet' : 'Available consoles'}</h2><p>{view === 'inventory' ? 'Sample inventory, with every console accounted for.' : 'These sample consoles are ready for a new rental.'}</p></div><span className="dash-count">{inventory.length} units</span></div><label className="dash-search"><Search size={16} /><input aria-label="Search consoles" placeholder="Search console or status..." value={query} onChange={event => setQuery(event.target.value)} /></label><div className="dash-inventory-grid">{inventory.map(item => <article key={item.id}><Gamepad2 size={38} strokeWidth={1.2} /><span className={`dash-status ${item.status === 'Available' ? 'mint' : item.status === 'Reserved' ? 'blue' : 'amber'}`}>{item.status}</span><small>{item.id}</small><h3>{item.name}</h3><p>{item.edition}</p><div><span />{item.detail}</div></article>)}</div>{!inventory.length && <p className="dash-empty">No sample consoles match your search.</p>}</section>}
        {view === 'managers' && <ManagersModule />}
        {view !== 'managers' && <footer className="dash-footer"><span>PS5 Rental Chennai <span>/</span> Admin workspace</span><span>Sample data / Design preview</span></footer>}
      </div>
    </main>
    {selectedBooking && <BookingDetails booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
  </div>
}

export default AdminDashboard

