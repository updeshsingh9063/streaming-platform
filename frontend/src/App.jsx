import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DirectoryPage from './pages/DirectoryPage';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StreamerProfilePage from './pages/StreamerProfilePage';

export default function App() {
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
          <a href="/#profiles">Profiles</a>
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
