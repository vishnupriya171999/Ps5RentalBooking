import type { Manager } from '../../api/managers'

export function ManagerAvatar({ name }: { name: string }) {
  return <span className="manager-avatar" aria-hidden="true">{Array.from(name.trim())[0]?.toLocaleUpperCase() || '?'}</span>
}
export function ManagerStatus({ manager }: { manager: Manager }) {
  return <span className={`dash-status ${manager.isActive ? 'mint' : 'amber'}`}><span />{manager.isActive ? 'Active' : 'Inactive'}</span>
}
