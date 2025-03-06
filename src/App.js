import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';

// Pages
import AuthPage from './pages/AuthPage';
import HotelsPage from './pages/HotelsPage';
import BookingPage from './pages/BookingPage';
import CheckInPage from './pages/CheckInPage';
import ConfirmationPage from './pages/ConfirmationPage';
import BookingsPage from './pages/BookingsPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Navigate to="/hotels" />} />
              <Route path="/auth" element={<AuthPage />} />

              <Route
                path="/hotels"
                element={
                  <ProtectedRoute>
                    <HotelsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/book/:hotelId"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/checkin/:bookingId"
                element={
                  <ProtectedRoute>
                    <CheckInPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/confirmation"
                element={
                  <ProtectedRoute>
                    <ConfirmationPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/hotels" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;