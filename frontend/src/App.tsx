import { Navigate, Route, Routes } from 'react-router-dom'
import CustomerPanel from './customer/CustomerPanel'
import AdminPanel from './admin/AdminPanel'

const App = () => {
  return (
    <Routes>
      <Route path="/customer" element={<CustomerPanel />} />
      <Route path="/admin/*" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  )
}

export default App
