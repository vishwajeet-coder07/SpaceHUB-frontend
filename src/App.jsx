import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import LoginPage from './component/LoginPage'
import SignupPage from './component/SignupPage'
import ForgotPasswordPage from './component/ForgotPasswordPage'
import ResetPasswordPage from './component/reset'
import LandingPage from './component/LandingPage/landing'
import Dashboard from './component/Dashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <Routes>
              {/* Public routes - accessible to everyone */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth routes - only accessible when not logged in */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <SignupPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/reset" 
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                } 
              />
              
              {/* Protected routes - only accessible when logged in */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route - redirect to dashboard if authenticated, otherwise to landing */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
