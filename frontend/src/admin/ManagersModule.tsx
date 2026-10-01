import { Navigate, Route, Routes } from 'react-router-dom'
import ManagerList from './managers/ManagerList'
import './managers.css'

export default function ManagersModule() {
  return <Routes>
    <Route path="managers" element={<ManagerList />} />
    <Route path="*" element={<Navigate to="/admin/dashboard/managers" replace />} />
  </Routes>
}
