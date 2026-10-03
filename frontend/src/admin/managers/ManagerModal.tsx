import { useEffect, useRef, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { fetchManager, managerError } from '../../api/managers'
import type { Manager } from '../../api/managers'
import ManagerForm from './ManagerForm'
import { ManagerAvatar, ManagerStatus } from './managerUI'
import { managerDate } from './managerUtils'
import { useAppSelector } from '../../store/hooks'

interface Props { initialManager?: Manager; onClose: () => void; onSaved: (manager: Manager) => void }

export default function ManagerModal({ initialManager, onClose, onSaved }: Props) {
  const canManage = useAppSelector(state => state.auth.loginDetails?.user.role.trim().toUpperCase() === 'ADMIN')
  const mobile = initialManager?.mobile
  const refresh = useRef<AbortController | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>(mobile ? 'view' : 'add')
  const [manager, setManager] = useState<Manager | null>(initialManager ?? null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    element?.showModal()
    document.body.style.overflow = 'hidden'
    const controller = new AbortController()
    refresh.current = controller
    if (mobile) fetchManager(mobile, controller.signal).then(data => {
      if (!controller.signal.aborted) setManager(data)
    }).catch(error => {
      if (!controller.signal.aborted) setError(managerError(error))
    })
    return () => { controller.abort(); element?.close(); document.body.style.overflow = previousOverflow }
  }, [mobile])
  useEffect(() => { title.current?.focus() }, [mode])
  const saved = (record: Manager) => {
    refresh.current?.abort()
    setManager(record)
    setMessage(mode === 'add' ? 'Manager added successfully.' : 'Manager updated successfully.')
    setMode('view')
    onSaved(record)
  }
  const close = () => { if (!saving) onClose() }
  return <dialog ref={dialog} className="manager-modal" aria-labelledby="manager-modal-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="manager-modal-content">
      <header className="manager-page-header"><h2 id="manager-modal-title" ref={title} tabIndex={-1}>{mode === 'add' ? 'Add manager' : mode === 'edit' ? 'Update manager' : 'Manager details'}</h2><button className="dash-icon-button manager-modal-close" type="button" onClick={close} disabled={saving} aria-label="Close manager dialog"><X size={20} /></button></header>
      <div className="manager-page-scroll">
        {message && mode === 'view' && <p className="manager-success" role="status">{message}</p>}
        {error && mode === 'view' && <p className="manager-error" role="status">Could not refresh details. Showing the last loaded data. {error}</p>}
        {mode !== 'view' && !canManage ? <p className="manager-error" role="status">Only administrators can create or update manager accounts.</p> : mode === 'add' || (mode === 'edit' && canManage && manager) ? <ManagerForm manager={mode === 'edit' ? manager! : undefined} onSaved={saved} onCancel={() => mode === 'edit' ? setMode('view') : close()} onSavingChange={setSaving} /> : !manager ? <p className="dash-empty" role="status">Loading manager...</p> : <>
          <div className="manager-profile"><ManagerAvatar name={manager.name} /><div className="manager-profile-identity"><h3>{manager.name}</h3><p>{manager.role}</p></div><ManagerStatus manager={manager} /></div>
          <dl className="manager-details">{[['Full name', manager.name], ['Mobile number', manager.mobile], ['Role', manager.role], ['Status', manager.isActive ? 'Active' : 'Inactive'], ['Created on', managerDate(manager.createdAt)], ['Last updated', managerDate(manager.updatedAt)], ['Password expires', managerDate(manager.passwordExpiresAt)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <div className="manager-form-actions">{canManage && <button className="manager-primary" type="button" onClick={() => { refresh.current?.abort(); setMode('edit') }}><Pencil size={16} />Update</button>}<button className="manager-secondary" type="button" onClick={close}>Close</button></div>
        </>}
      </div>
    </div>
  </dialog>
}
