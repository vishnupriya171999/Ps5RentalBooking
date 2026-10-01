import { useAppSelector } from '../store/hooks'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

const AdminPanel = () => {
  const session = useAppSelector(state => state.auth.loginDetails)
  const signedIn = Boolean(session)

  return <Routes>
    <Route index element={<AdminLogin />} />
    <Route path="dashboard/*" element={signedIn ? <AdminDashboard /> : <Navigate to="/admin" replace />} />
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </Routes>
}

export default AdminPanel
