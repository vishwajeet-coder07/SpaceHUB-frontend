import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './component/LoginPage'
import SignupPage from './component/SignupPage'
import ForgotPasswordPage from './component/ForgotPasswordPage'
import ResetPasswordPage from './component/reset'
import LandingPage from './component/LandingPage/landing'
import Dashboard from './component/Dashboard'

function App() {
  return (
    <Router>
      <div>
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
