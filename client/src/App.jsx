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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotResetPage />} />

        <Route path="/faculty/dashboard" element={<FacultyDashboardPage />} />
        <Route path="/faculty/reviews" element={<FacultyReviewsPage />} />
        <Route path="/faculty/mentorship" element={<FacultyMentorshipPage />} />
        <Route path="/faculty/interns" element={<FacultyInternsPage />} />

        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/incubatees" element={<AdminIncubateesPage />} />
        <Route path="/admin/faculty" element={<AdminFacultyPage />} />
        <Route path="/admin/finance" element={<AdminFinancePage />} />
        <Route path="/admin/system" element={<AdminSystemPage />} />

        <Route path="/incubatee/dashboard" element={<IncubateeDashboardPage />} />
        <Route path="/incubatee/projects" element={<IncubateeProjectsPage />} />
        <Route path="/incubatee/submissions" element={<IncubateeSubmissionsPage />} />
        <Route path="/incubatee/faculty" element={<IncubateeFacultyPage />} />
        <Route path="/incubatee/finance" element={<IncubateeFinancePage />} />
        <Route path="/incubatee/support" element={<IncubateeSupportPage />} />
        <Route path="/incubatee/interns" element={<IncubateeInternsPage />} />
        <Route path="/incubatee/progress" element={<IncubateeProgressPage />} />
        <Route path="/incubatee/presentations" element={<IncubateePresentationsPage />} />
        <Route path="/incubatee/profile" element={<IncubateeProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
