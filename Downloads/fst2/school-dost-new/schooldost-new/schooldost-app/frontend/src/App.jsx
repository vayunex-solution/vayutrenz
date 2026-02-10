// SchoolDost App - Main Entry Point
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
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
import Search from './pages/Search';
import AdminDashboard from './pages/AdminDashboard';
import HashtagPage from './pages/HashtagPage';
import GroupDetail from './pages/GroupDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Marketplace from './pages/Marketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import Leaderboard from './pages/Leaderboard';

// Styles
import './index.css';

import ProfileWizard from './components/ProfileWizard';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [showWizard, setShowWizard] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user && !user.isProfileComplete) {
      // Check if essential fields are missing as backup check
      const isActuallyIncomplete = !user.college || !user.department;
      if (isActuallyIncomplete || user.isProfileComplete === false) {
        setShowWizard(true);
      }
    }
  }, [isAuthenticated, user]);

  if (loading) {
    // ... existing loading code ...
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <MobileFooter />
      <ProfileWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />
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
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'ADMIN' || user?.role === 'MODERATOR') {
      return <Navigate to="/admin" replace />;
    }
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
      <Route path="/search" element={
        <ProtectedRoute><Search /></ProtectedRoute>
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
      <Route path="/hashtag/:tag" element={
        <ProtectedRoute><HashtagPage /></ProtectedRoute>
      } />
      <Route path="/groups/:groupId" element={
        <ProtectedRoute><GroupDetail /></ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute><Events /></ProtectedRoute>
      } />
      <Route path="/events/:eventId" element={
        <ProtectedRoute><EventDetail /></ProtectedRoute>
      } />
      <Route path="/marketplace" element={
        <ProtectedRoute><Marketplace /></ProtectedRoute>
      } />
      <Route path="/marketplace/:listingId" element={
        <ProtectedRoute><MarketplaceDetail /></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><Leaderboard /></ProtectedRoute>
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
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
