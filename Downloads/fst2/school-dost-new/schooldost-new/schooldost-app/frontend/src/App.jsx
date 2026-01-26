// SchoolDost App - Main Entry Point
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MobileFooter from './components/MobileFooter';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOtp from './pages/VerifyOtp';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import Communities from './pages/Communities';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Discover from './pages/Discover';
import AdminDashboard from './pages/AdminDashboard';

// Styles
import './index.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <MobileFooter />
    </>
  );
}

// Admin Route - requires admin role
function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin or moderator
  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {children}
      <MobileFooter />
    </>
  );
}

// Public Route (redirect if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute><ForgotPassword /></PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute><ResetPassword /></PublicRoute>
      } />
      <Route path="/verify-otp" element={
        <PublicRoute><VerifyOtp /></PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      } />
      <Route path="/discover" element={
        <ProtectedRoute><Discover /></ProtectedRoute>
      } />
      <Route path="/profile/:userId?" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/matches" element={
        <ProtectedRoute><Matches /></ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute><Messages /></ProtectedRoute>
      } />
      <Route path="/messages/:userId" element={
        <ProtectedRoute><Messages /></ProtectedRoute>
      } />
      <Route path="/communities" element={
        <ProtectedRoute><Communities /></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><Notifications /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><Settings /></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
