import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './component/LoginPage'
import SignupPage from './component/SignupPage'
import ForgotPasswordPage from './component/ForgotPasswordPage'
import ResetPasswordPage from './component/reset'

function App() {
  return (
    <Router>
      <div>
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
        </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
