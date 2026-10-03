import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { fetchManagers, managerError } from '../../api/managers'
import type { Manager } from '../../api/managers'
import { ManagerAvatar, ManagerStatus } from './managerUI'
import ManagerModal from './ManagerModal'
import ManagerTableSkeleton from './ManagerTableSkeleton'
import { useAppSelector } from '../../store/hooks'

export default function ManagerList() {
  const canManage = useAppSelector(state => state.auth.loginDetails?.user.role.trim().toUpperCase() === 'ADMIN')
  const [modal, setModal] = useState<{ manager?: Manager } | null>(null)
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const status = params.get('status') || 'all'
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetchManagers(controller.signal).then(data => {
      if (!controller.signal.aborted) { setManagers(data); setError(''); setLoading(false) }
    }).catch(error => {
      if (!controller.signal.aborted) { setError(managerError(error)); setLoading(false) }
    })
    return () => controller.abort()
  }, [attempt])
  const filter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }
  const filtered = managers.filter(manager => `${manager.name} ${manager.mobile} ${manager.role}`.toLowerCase().includes(query.trim().toLowerCase()) && (status === 'all' || manager.isActive === (status === 'active')))

  return <section className="dash-panel managers-module" aria-labelledby="managers-title">
    <header className="manager-page-header"><h1 id="managers-title">Managers</h1>{canManage && <button className="manager-primary" onClick={() => setModal({})}><Plus size={17} />Add manager</button>}</header>
    <div className="dash-table-tools"><label className="dash-search"><Search size={17} /><input aria-label="Search managers" placeholder="Search name, mobile or role..." value={query} onChange={event => filter('q', event.target.value)} /></label><select aria-label="Filter manager status" value={status} onChange={event => filter('status', event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
    <div className="manager-table-wrap" tabIndex={0} role="region" aria-label="Managers table" aria-busy={loading}>
      <table className="manager-table"><caption className="dash-sr-only">Managers. Select a name to view details.</caption><thead><tr><th scope="col">Manager</th><th scope="col">Mobile number</th><th scope="col">Role</th><th scope="col">Status</th></tr></thead><tbody>{loading && <ManagerTableSkeleton />}{!loading && !error && filtered.map(manager => <tr key={manager.id}>
        <td><div className="manager-person"><ManagerAvatar name={manager.name} /><button className="manager-name" onClick={() => setModal({ manager })} aria-haspopup="dialog"><strong>{manager.name}</strong></button></div></td>
        <td className="manager-mobile-number">{manager.mobile}</td><td className="manager-role">{manager.role}</td><td><ManagerStatus manager={manager} /></td>
      </tr>)}</tbody></table>
      {loading ? <span className="dash-sr-only" role="status">Loading managers...</span> : error ? <div className="manager-empty"><p role="alert">{error}</p><button className="manager-secondary" onClick={() => { setLoading(true); setError(''); setAttempt(value => value + 1) }}>Try again</button></div> : !filtered.length && <div className="manager-empty"><h2>{managers.length ? 'No matching managers' : 'No managers yet'}</h2><p>{managers.length ? 'Try another search or status.' : canManage ? 'Add a manager to get started.' : 'Ask an administrator to add manager accounts.'}</p>{managers.length > 0 && <button className="manager-secondary" onClick={() => setParams({})}>Clear filters</button>}</div>}
    </div>
    <footer className="manager-list-footer" role="status">{!loading && !error ? `${filtered.length} of ${managers.length} managers` : 'Managers directory'}</footer>
    {modal && <ManagerModal initialManager={modal.manager} onClose={() => setModal(null)} onSaved={saved => setManagers(current => [saved, ...current.filter(manager => manager.id !== saved.id)])} />}
  </section>
}
