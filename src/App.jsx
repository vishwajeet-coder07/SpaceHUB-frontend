import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, ProtectedRoute, PublicRoute, ResetPasswordRoute, ProfileSetupRoute } from './shared'
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './modules/auth'
import { ProfileSetupPage } from './modules/profile'
import { LandingPage } from './modules/landing'
import { Dashboard, CommunityPage, CommunitySettingsPage, LocalGroupPage } from './modules/dashboard'

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
                path="/dashboard/community/:id" 
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/community/:id/settings" 
                element={
                  <ProtectedRoute>
                    <CommunitySettingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/local-group/:id" 
                element={
                  <ProtectedRoute>
                    <LocalGroupPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/setup" 
                element={
                  <ProfileSetupRoute>
                    <ProfileSetupPage />
                    </ProfileSetupRoute>
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
