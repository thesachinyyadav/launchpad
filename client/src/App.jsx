import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboardPage from './admin/dashboard/AdminDashboardPage'
import AdminFacultyPage from './admin/faculty/AdminFacultyPage'
import AdminFinancePage from './admin/finance/AdminFinancePage'
import AdminIncubateesPage from './admin/incubatees/AdminIncubateesPage'
import AdminSystemPage from './admin/system/AdminSystemPage'
import ForgotResetPage from './auth/ForgotResetPage'
import FacultyDashboardPage from './faculty/dashboard/FacultyDashboardPage'
import FacultyInternsPage from './faculty/interns/FacultyInternsPage'
import FacultyMentorshipPage from './faculty/mentorship/FacultyMentorshipPage'
import FacultyReviewsPage from './faculty/reviews/FacultyReviewsPage'
import LoginPage from './auth/LoginPage'
import IncubateeDashboardPage from './incubatee/dashboard/IncubateeDashboardPage'
import IncubateeFacultyPage from './incubatee/faculty/IncubateeFacultyPage'
import IncubateeFinancePage from './incubatee/finance/IncubateeFinancePage'
import IncubateeInternsPage from './incubatee/interns/IncubateeInternsPage'
import IncubateeProgressPage from './incubatee/progress/IncubateeProgressPage'
import IncubateePresentationsPage from './incubatee/presentations/IncubateePresentationsPage'
import IncubateeProjectsPage from './incubatee/projects/IncubateeProjectsPage'
import IncubateeProfilePage from './incubatee/profile/IncubateeProfilePage'
import IncubateeSubmissionsPage from './incubatee/submissions/IncubateeSubmissionsPage'
import IncubateeSupportPage from './incubatee/support/IncubateeSupportPage'
import NotificationsPage from './shared/NotificationsPage'
import SettingsPage from './shared/SettingsPage'
import { getActiveRole, getAuthSession } from './lib/api'

const roleHomeRoute = {
  admin: '/admin/dashboard',
  faculty: '/faculty/dashboard',
  incubatee: '/incubatee/dashboard',
}

function RootRedirect() {
  const session = getAuthSession()
  const role = session?.user?.role || getActiveRole()

  if (!session || !role) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={roleHomeRoute[role] || '/login'} replace />
}

function ProtectedRoute({ children, allowedRole = null }) {
  const session = getAuthSession()
  const role = session?.user?.role || getActiveRole()

  if (!session || !role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={roleHomeRoute[role] || '/login'} replace />
  }

  return children
}

function LoginRoute() {
  const session = getAuthSession()
  const role = session?.user?.role || getActiveRole()

  if (!session || !role) {
    return <LoginPage />
  }

  return <Navigate to={roleHomeRoute[role] || '/login'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/forgot-password" element={<ForgotResetPage />} />

        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/reviews"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/mentorship"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyMentorshipPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/interns"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyInternsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/incubatees"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminIncubateesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminFacultyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finance"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminFinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminSystemPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/incubatee/dashboard"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/projects"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/submissions"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeSubmissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/faculty"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeFacultyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/finance"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeFinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/support"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeSupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/interns"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeInternsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/progress"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/presentations"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateePresentationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incubatee/profile"
          element={
            <ProtectedRoute allowedRole="incubatee">
              <IncubateeProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
