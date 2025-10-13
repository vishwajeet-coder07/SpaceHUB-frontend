import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './component/LoginPage'
import SignupPage from './component/SignupPage'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
