import { Navigate, Route, Routes } from 'react-router-dom'
import CustomerPanel from './customer/CustomerPanel'
import AdminLogin from './admin/AdminLogin'

const App = () => {
  return (
    <Routes>
      <Route path="/customer" element={<CustomerPanel />} />
      <Route path="/admin/*" element={<AdminLogin />} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  )
}

export default App
