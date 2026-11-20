import { useTheme } from '@/hooks/useTheme'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppRoutes } from '@/routes/AppRoutes'
import { ToastNotifications } from '@/components/shared/notifications/ToastNotifications'

export default function App() {
  useTheme()
  return <AuthProvider><BrowserRouter><AppRoutes /><ToastNotifications /></BrowserRouter></AuthProvider>
}
