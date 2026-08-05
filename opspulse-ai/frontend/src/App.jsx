import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AgentRunner from './pages/AgentRunner';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('opspulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('opspulse_token');
    localStorage.removeItem('opspulse_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <main className="flex-1">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/agent-runner"
              element={user ? <AgentRunner /> : <Navigate to="/login" replace />}
            />
            <Route
              path="*"
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
