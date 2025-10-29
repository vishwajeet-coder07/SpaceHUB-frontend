import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, ProtectedRoute, PublicRoute, ResetPasswordRoute, ProfileSetupRoute } from './shared'
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './modules/auth'
import { ProfileSetupPage } from './modules/profile'
import { LandingPage } from './modules/landing'
import { Dashboard } from './modules/dashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <Routes>
              
              <Route path="/" element={<LandingPage />} />
    
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
                  <ResetPasswordRoute>
                    <ResetPasswordPage />
                  </ResetPasswordRoute>
                } 
              />
        
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/setup" 
                element={
                    <ProfileSetupPage />
                }
              />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
