import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Access Denied</div>
  }

  return children
}