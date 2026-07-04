import React, { useState } from 'react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Simple token save (for MVP, localStorage is fine, httpOnly cookie is better for prod)
        localStorage.setItem('adminToken', data.token);
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  return (
    <main id="top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <section className="section-shell" style={{ maxWidth: '400px', width: '100%', padding: '40px', background: 'var(--paper)', borderRadius: '24px', border: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span className="brand-mark" style={{ margin: '0 auto 15px' }}>CA</span>
          <h2>Admin Access</h2>
        </div>
        
        {error && <div style={{ background: 'rgba(255, 57, 57, 0.1)', color: '#ff3939', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Username
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              required 
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Password
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              required 
            />
          </label>
          <button type="submit" className="primary-action" style={{ width: '100%', marginTop: '10px' }}>
            Log in to Dashboard
          </button>
        </form>
      </section>
    </main>
  );
}
