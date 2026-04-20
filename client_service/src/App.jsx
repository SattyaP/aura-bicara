import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth()

  if (isLoadingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <section className="surface-card w-full max-w-md p-7">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Checking session...</h1>
              <p className="mt-1 text-sm text-slate-500">Please wait while we validate your access token.</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
