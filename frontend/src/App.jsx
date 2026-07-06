import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import DirectoryPage from './pages/DirectoryPage';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StreamerProfilePage from './pages/StreamerProfilePage';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    fetch(`${apiUrl}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'pageview' })
    }).catch(console.error);
  }, [location.pathname]);

  return (
    <>
      <div className="ambient ambient-a"></div>
      <div className="ambient ambient-b"></div>

      <header className="site-header">
        <a className="brand" href="/" aria-label="ChickenAndy home">
          <span className="brand-mark">CA</span>
          <span className="brand-copy">
            <strong>ChickenAndy</strong>
            <small>Live Directory</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="/#live">Live</a>
          <a href="/#featured">Featured</a>
          <a href="/#overview">Overview</a>
          <a href="/admin">Admin</a>
        </nav>
        <button className="header-cta" type="button" onClick={() => window.location.href = '/'}>Open Directory</button>
      </header>

      <Routes>
        <Route path="/" element={<DirectoryPage />} />
        <Route path="/streamer/:id" element={<StreamerProfilePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>

      <footer className="site-footer">
        <strong>ChickenAndy</strong>
        <span>Premium live directory · public board, streamer profiles, and owner admin system</span>
      </footer>
    </>
  );
}
