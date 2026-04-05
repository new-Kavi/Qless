import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import ServiceDetails from './pages/ServiceDetails';
import QueueStatus from './pages/QueueStatus';
import BookingConfirmation from './pages/BookingConfirmation';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user role matches
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access something they shouldn't
    if (user.role === 'seller') return <Navigate to="/seller" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* User Routes (User & Guest) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['user', 'guest']}>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/service/:id" 
          element={
            <ProtectedRoute allowedRoles={['user', 'guest']}>
              <ServiceDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/queue/:id" 
          element={
            <ProtectedRoute allowedRoles={['user', 'guest']}>
              <QueueStatus />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout/:serviceId/:slotId" 
          element={
            <ProtectedRoute allowedRoles={['user', 'guest']}>
              <BookingConfirmation />
            </ProtectedRoute>
          } 
        />

        {/* Seller Routes */}
        <Route 
          path="/seller/*" 
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
