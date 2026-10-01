import { useState } from 'react'
import type { FormEvent } from 'react'

import { saveManager, managerError } from '../../api/managers'
import type { Manager } from '../../api/managers'


interface Props { manager?: Manager; onSaved: (manager: Manager) => void; onCancel: () => void; onSavingChange: (saving: boolean) => void }

export default function ManagerForm({ manager, onSaved, onCancel, onSavingChange }: Props) {
  const [name, setName] = useState(manager?.name || '')
  const [mobile, setMobile] = useState(manager?.mobile || '')
  const [role, setRole] = useState(manager?.role.trim().toUpperCase() || 'MANAGER')
  const [isActive, setIsActive] = useState(manager?.isActive ?? true)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    if (!name.trim() || !role.trim()) { setError('Name and role cannot be blank.'); return }
    if (new TextEncoder().encode(password).length > 72 || (password && !password.trim())) { setError('Enter a password of up to 72 bytes.'); return }
    setSaving(true); onSavingChange(true); setError('')
    try {
      const saved = await saveManager({ name: name.trim(), mobile: mobile.trim(), role: role.trim(), isActive, ...(password ? { password } : {}) }, manager?.id)
      onSaved(saved)
    } catch (error) { setError(managerError(error)) } finally { setSaving(false); onSavingChange(false) }
  }
  return <form className="manager-form" onSubmit={submit}>
    <p className="dash-muted">{manager ? 'Update account details. Leave the password blank to keep it unchanged.' : 'Enter the manager’s account details. New accounts are active by default.'}</p>
    {error && <p className="manager-error" role="alert">{error}</p>}
    <fieldset disabled={saving}><legend className="dash-sr-only">Manager account details</legend><div className="manager-form-grid">
      <label>Full name<input required maxLength={100} autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label>
      <label>Mobile number<input required type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} title="Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9" autoComplete="tel-national" value={mobile} onChange={event => setMobile(event.target.value)} /></label>
      <label>Role<select required aria-label="Role" value={role} onChange={event => setRole(event.target.value)}>{!['ADMIN', 'MANAGER', 'SUPPORT'].includes(role) && <option value={role}>{role}</option>}<option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="SUPPORT">Support</option></select></label>
      <label>Status<select value={isActive ? 'active' : 'inactive'} onChange={event => setIsActive(event.target.value === 'active')}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
      <label className="manager-password">{manager ? 'New password (optional)' : 'Password'}<input type="password" required={!manager} maxLength={72} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /><small>{manager ? 'Setting a new password renews its expiry for one month.' : 'Maximum 72 bytes. Passwords expire after one month.'}</small></label>
    </div></fieldset>
    <div className="manager-form-actions"><button className="manager-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : manager ? 'Save changes' : 'Add manager'}</button>{!saving && <button className="manager-secondary" type="button" onClick={onCancel}>Cancel</button>}</div>
  </form>
}
