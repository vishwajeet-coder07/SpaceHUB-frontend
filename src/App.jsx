import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './component/LoginPage'
import SignupPage from './component/SignupPage'
import ForgotPasswordPage from './component/ForgotPasswordPage'

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
        </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
