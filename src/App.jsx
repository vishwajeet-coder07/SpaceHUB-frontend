import './App.css'
import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, ProtectedRoute, PublicRoute, ResetPasswordRoute, ProfileSetupRoute } from './shared'
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './modules/auth'
import { ProfileSetupPage } from './modules/profile'
const LandingPage = lazy(() => import('./modules/landing').then(m => ({ default: m.LandingPage })));
import TopToast from './shared/components/TopToast'
import { Dashboard, CommunityPage, CommunitySettingsPage, LocalGroupPage, SettingPage } from './modules/dashboard'
import LocalGroupSettingsPage from './modules/dashboard/pages/LocalGroupSettingsPage'
import DirectMessagePage from './modules/dashboard/pages/DirectMessagePage'
import CreateJoinPage from './modules/dashboard/pages/CreateJoinPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <TopToast />
            <Routes>
              
              <Route path="/" element={
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-700">Loading...</div>}>
                  <LandingPage />
                </Suspense>
              } />
    
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
                path="/dashboard/settings" 
                element={
                  <ProtectedRoute>
                    <SettingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/direct-message" 
                element={
                  <ProtectedRoute>
                    <DirectMessagePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/create-join" 
                element={
                  <ProtectedRoute>
                    <CreateJoinPage />
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
                path="/dashboard/local-group/:id/settings" 
                element={
                  <ProtectedRoute>
                    <LocalGroupSettingsPage />
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
              <Route path="*" element={
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-700">Loading...</div>}>
                  <LandingPage />
                </Suspense>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
