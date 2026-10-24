import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Unauthorized } from './pages/auth/Unauthorized';

// Student Pages
import { Dashboard } from './pages/student/Dashboard';
import { CleanlinessList } from './pages/student/CleanlinessList';
import { CleanlinessNew } from './pages/student/CleanlinessNew';
import { CleanlinessDetail } from './pages/student/CleanlinessDetail';
import { MessMenuPage } from './pages/student/MessMenuPage';
import { MealReviewsPage } from './pages/student/MealReviewsPage';
import { CanteenPage } from './pages/student/CanteenPage';
import { HostelInfoPage } from './pages/student/HostelInfoPage';
import { RectorPage } from './pages/student/RectorPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminComplaints } from './pages/admin/AdminComplaints';
import { AdminMenus } from './pages/admin/AdminMenus';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminContacts } from './pages/admin/AdminContacts';
import { AdminNotices } from './pages/admin/AdminNotices';
import { AdminUsers } from './pages/admin/AdminUsers';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Authenticated Application Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Student Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cleanliness" element={<CleanlinessList />} />
              <Route path="/cleanliness/new" element={<CleanlinessNew />} />
              <Route path="/cleanliness/:id" element={<CleanlinessDetail />} />
              <Route path="/mess" element={<MessMenuPage />} />
              <Route path="/reviews" element={<MealReviewsPage />} />
              <Route path="/canteen" element={<CanteenPage />} />
              <Route path="/hostel-info" element={<HostelInfoPage />} />
              <Route path="/rector" element={<RectorPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Administrative Routes (Restricted to Staff / Rector / Admin) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'rector', 'housekeeping', 'mess_staff', 'canteen_staff']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'rector', 'housekeeping']}>
                    <AdminComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menus"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'mess_staff', 'canteen_staff']}>
                    <AdminMenus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'rector']}>
                    <AdminReviews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/contacts"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'rector']}>
                    <AdminContacts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notices"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'rector']}>
                    <AdminNotices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
