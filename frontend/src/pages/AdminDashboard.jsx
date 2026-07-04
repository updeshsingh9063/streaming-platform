import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const PLATFORMS = ['kick', 'twitch', 'youtube', 'tiktok'];
const CHART_GREEN = '#53fc18';
const CHART_COLORS = ['#53fc18', '#9146ff', '#ff0000', '#ee1d52'];

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' };
}

// ── Roster Tab ─────────────────────────────────────────────────────────────────
function RosterTab({ streamers, onRefresh }) {
  const [editing, setEditing] = useState(null); // null = list, 'new' = add form, id = edit form
  const [form, setForm] = useState({ name: '', slug: '', platform: 'kick', blurb: '', thumbnail: '', badge: '', featured: false, approved: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const openNew = () => {
    setForm({ name: '', slug: '', platform: 'kick', blurb: '', thumbnail: '', badge: '', featured: false, approved: true });
    setEditing('new');
  };

  const openEdit = (s) => {
    setForm({ name: s.name, slug: s.slug, platform: s.platform, blurb: s.blurb || '', thumbnail: s.thumbnail || '', badge: s.badge || '', featured: !!s.featured, approved: !!s.approved });
    setEditing(s.id);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editing === 'new' ? `${API}/admin/streamers` : `${API}/admin/streamers/${editing}`;
      const method = editing === 'new' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg(editing === 'new' ? 'Streamer added!' : 'Streamer updated!');
      setEditing(null);
      onRefresh();
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  };

  const del = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the roster?`)) return;
    await fetch(`${API}/admin/streamers/${id}`, { method: 'DELETE', headers: authHeaders() });
    onRefresh();
  };

  const toggleFeatured = async (id) => {
    await fetch(`${API}/admin/streamers/${id}/featured`, { method: 'PATCH', headers: authHeaders() });
    onRefresh();
  };

  const toggleApprove = async (id, current) => {
    await fetch(`${API}/admin/streamers/${id}/approve`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ approved: !current }) });
    onRefresh();
  };

  if (editing !== null) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setEditing(null)} style={btnStyle('outline')}>← Back</button>
          <h3>{editing === 'new' ? 'Add streamer' : 'Edit streamer'}</h3>
        </div>
        {msg && <div style={{ color: CHART_GREEN, marginBottom: 12 }}>{msg}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {[['Name', 'name'], ['Kick/Platform Slug', 'slug'], ['Thumbnail URL', 'thumbnail'], ['Badge (e.g. event, friend)', 'badge']].map(([label, key]) => (
            <label key={key} style={labelStyle}>
              {label}
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
            </label>
          ))}
          <label style={labelStyle}>
            Platform
            <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} style={inputStyle}>
              {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            Blurb / Description
            <input value={form.blurb} onChange={e => setForm(f => ({ ...f, blurb: e.target.value }))} style={inputStyle} />
          </label>
          <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
            Featured on homepage
          </label>
          <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={form.approved} onChange={e => setForm(f => ({ ...f, approved: e.target.checked }))} />
            Approved (visible on site)
          </label>
        </div>
        <button onClick={save} disabled={saving} style={{ ...btnStyle('primary'), marginTop: 20 }}>
          {saving ? 'Saving…' : editing === 'new' ? 'Add streamer' : 'Save changes'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3>Roster Control <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>({streamers.length} streamers)</span></h3>
        <button onClick={openNew} style={btnStyle('primary')}>+ Add streamer</button>
      </div>
      {msg && <div style={{ color: CHART_GREEN, marginBottom: 12 }}>{msg}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {streamers.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
            {s.thumbnail && <img src={s.thumbnail} alt={s.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: '0.95rem' }}>{s.name}</strong>
                {s.live === 1 && <span className="live-pill" style={{ fontSize: '0.65rem' }}><span className="pulse"></span> LIVE</span>}
                {s.featured === 1 && <span className="featured-pill" style={{ fontSize: '0.65rem' }}>FEATURED</span>}
                {s.approved === 0 && <span style={{ fontSize: '0.65rem', background: '#ff3939', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>PENDING</span>}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 2 }}>{s.platform} · @{s.slug}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0, width: '100%', justifyContent: 'flex-end' }}>
              <button onClick={() => toggleFeatured(s.id)} style={{ ...btnStyle(s.featured ? 'green' : 'outline'), minWidth: 36 }} title="Toggle featured">★</button>
              <button onClick={() => toggleApprove(s.id, s.approved)} style={btnStyle(s.approved ? 'outline' : 'green')} title="Toggle approval">
                {s.approved ? 'Hide' : 'Approve'}
              </button>
              <button onClick={() => openEdit(s)} style={btnStyle('outline')}>Edit</button>
              <button onClick={() => del(s.id, s.name)} style={btnStyle('danger')}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Applications Tab ───────────────────────────────────────────────────────────
function ApplicationsTab() {
  const [apps, setApps] = useState([]);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`${API}/admin/applications`, { headers: authHeaders() });
    setApps(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (id, status) => {
    await fetch(`${API}/admin/applications/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    setMsg(`Application ${status}.`);
    load();
  };

  const pending = apps.filter(a => a.status === 'pending');
  const resolved = apps.filter(a => a.status !== 'pending');

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Applications <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>({pending.length} pending)</span></h3>
      {msg && <div style={{ color: CHART_GREEN, marginBottom: 12 }}>{msg}</div>}
      {pending.length === 0 && <p style={{ color: 'var(--muted)' }}>No pending applications.</p>}
      {pending.map(a => (
        <div key={a.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <strong>{a.name}</strong>
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{a.platform} · {a.channel_url}</div>
              {a.message && <div style={{ marginTop: 6, fontSize: '0.85rem' }}>{a.message}</div>}
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 4 }}>{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => decide(a.id, 'approved')} style={btnStyle('green')}>Approve</button>
              <button onClick={() => decide(a.id, 'rejected')} style={btnStyle('danger')}>Reject</button>
            </div>
          </div>
        </div>
      ))}
      {resolved.length > 0 && (
        <>
          <h4 style={{ marginTop: 24, marginBottom: 12, color: 'var(--muted)' }}>Resolved</h4>
          {resolved.map(a => (
            <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{a.name} · {a.platform}</span>
              <span style={{ color: a.status === 'approved' ? CHART_GREEN : '#ff3939', fontSize: '0.8rem', textTransform: 'uppercase' }}>{a.status}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── Featured Tab ───────────────────────────────────────────────────────────────
function FeaturedTab({ streamers, onRefresh }) {
  const featured = streamers.filter(s => s.featured === 1 && s.approved === 1);
  const rest = streamers.filter(s => s.featured === 0 && s.approved === 1);

  const toggle = async (id) => {
    await fetch(`${API}/admin/streamers/${id}/featured`, { method: 'PATCH', headers: authHeaders() });
    onRefresh();
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Featured channels</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 20 }}>Featured streamers appear first on the public directory homepage.</p>
      <div style={{ display: 'grid', gap: 2 }}>
        <h4 style={{ color: CHART_GREEN, marginBottom: 8 }}>Currently featured ({featured.length})</h4>
        {featured.length === 0 && <p style={{ color: 'var(--muted)' }}>No featured streamers.</p>}
        {featured.map(s => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <strong>{s.name}</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginLeft: 8 }}>{s.platform}</span>
            </div>
            <button onClick={() => toggle(s.id)} style={btnStyle('danger')}>Remove featured</button>
          </div>
        ))}
        <h4 style={{ marginTop: 24, marginBottom: 8 }}>Add to featured</h4>
        {rest.map(s => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <strong>{s.name}</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginLeft: 8 }}>{s.platform}</span>
            </div>
            <button onClick={() => toggle(s.id)} style={btnStyle('green')}>★ Feature</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Appearance Tab ─────────────────────────────────────────────────────────────
function AppearanceTab() {
  const [appearance, setAppearance] = useState({ banner: '', logo: '', favicon: '' });
  const [uploading, setUploading] = useState({});
  const [msg, setMsg] = useState('');

  const loadAppearance = useCallback(async () => {
    const res = await fetch(`${API}/admin/appearance`, { headers: authHeaders() });
    setAppearance(await res.json());
  }, []);

  useEffect(() => { loadAppearance(); }, [loadAppearance]);

  const uploadFile = async (key, file) => {
    setUploading(u => ({ ...u, [key]: true }));
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API}/admin/appearance/${key}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg(`${key} updated!`);
      loadAppearance();
    } catch (e) { setMsg(e.message); }
    setUploading(u => ({ ...u, [key]: false }));
  };

  const setUrl = async (key, value) => {
    await fetch(`${API}/admin/appearance/${key}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ value }) });
    setMsg(`${key} updated!`);
    loadAppearance();
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Appearance Manager</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>Change banner, logo and favicon without developer help.</p>
      {msg && <div style={{ color: CHART_GREEN, marginBottom: 16 }}>{msg}</div>}

      {[
        { key: 'banner', label: 'Hero Banner', desc: 'Wide image displayed behind the hero section.' },
        { key: 'logo', label: 'Site Logo', desc: 'Replaces the CA monogram in the header.' },
        { key: 'favicon', label: 'Favicon', desc: 'Browser tab icon (ICO, PNG or SVG).' }
      ].map(({ key, label, desc }) => (
        <div key={key} style={{ marginBottom: 28, padding: 20, background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--line)' }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>{label}</strong>
          <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 12 }}>{desc}</div>

          {appearance[key] && (
            <img
              src={appearance[key].startsWith('/') ? `${API.replace('/api', '')}${appearance[key]}` : appearance[key]}
              alt={label}
              style={{ width: '100%', maxHeight: key === 'banner' ? 180 : 80, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }}
            />
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ ...btnStyle('outline'), cursor: 'pointer', display: 'inline-block' }}>
              {uploading[key] ? 'Uploading…' : '↑ Upload file'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadFile(key, e.target.files[0])} />
            </label>
            <div style={{ display: 'flex', flex: 1, gap: 8, minWidth: 200 }}>
              <input
                defaultValue={appearance[key] || ''}
                placeholder={`Or paste ${label.toLowerCase()} URL…`}
                style={{ ...inputStyle, flex: 1 }}
                id={`appearance-${key}`}
              />
              <button onClick={() => setUrl(key, document.getElementById(`appearance-${key}`).value)} style={btnStyle('primary')}>Set URL</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Analytics Tab ──────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/admin/analytics`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <p style={{ color: 'var(--muted)', padding: 20 }}>Loading analytics…</p>;

  const { summary, platforms, traffic } = data;

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Platform Health</h3>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Live now', value: summary.liveCount },
          { label: 'Total viewers', value: summary.totalViewers?.toLocaleString() },
          { label: 'Streamers', value: summary.totalStreamers },
          { label: 'Featured', value: summary.featuredCount },
          { label: 'Pending apps', value: summary.pendingApps },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: CHART_GREEN, fontFamily: 'Barlow Condensed, sans-serif' }}>{value}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Traffic chart */}
      <h4 style={{ marginBottom: 12 }}>7-Day Traffic</h4>
      <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '16px 8px', marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={traffic}>
            <defs>
              <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_GREEN} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_GREEN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="var(--muted)" tick={{ fontSize: 11 }} />
            <YAxis stroke="var(--muted)" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }} />
            <Area type="monotone" dataKey="visitors" stroke={CHART_GREEN} fill="url(#colorV)" strokeWidth={2} name="Visitors" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Platform breakdown */}
      <h4 style={{ marginBottom: 12 }}>Platform Breakdown</h4>
      <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '16px 8px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie data={platforms} dataKey="count" nameKey="platform" cx="50%" cy="50%" outerRadius={70} labelLine={false}>
              {platforms.map((entry, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {platforms.map((p, i) => (
            <div key={p.platform} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], display: 'inline-block' }}></span>
                <span style={{ textTransform: 'capitalize' }}>{p.platform}</span>
              </div>
              <strong>{p.count}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const btnStyle = (variant) => ({
  padding: variant === 'primary' ? '8px 18px' : '6px 14px',
  borderRadius: 8,
  border: variant === 'outline' ? '1px solid var(--line)' : 'none',
  background: variant === 'primary' ? 'var(--green)' : variant === 'green' ? 'rgba(83,252,24,0.15)' : variant === 'danger' ? 'rgba(255,57,57,0.15)' : 'var(--bg)',
  color: variant === 'primary' ? '#000' : variant === 'danger' ? '#ff3939' : variant === 'green' ? 'var(--green)' : 'white',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 600,
  transition: 'opacity 0.15s',
});

const inputStyle = {
  padding: '9px 12px',
  borderRadius: 8,
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  color: 'var(--ink)',
  width: '100%',
  fontSize: '0.9rem',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  color: 'var(--muted)',
  fontSize: '0.82rem',
};

// ── Main AdminDashboard ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('roster');
  const [streamers, setStreamers] = useState([]);
  const navigate = useNavigate();

  const loadStreamers = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }
    const res = await fetch(`${API}/admin/streamers`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401 || res.status === 403) { localStorage.removeItem('adminToken'); navigate('/admin/login'); return; }
    setStreamers(await res.json());
  }, [navigate]);

  useEffect(() => { loadStreamers(); }, [loadStreamers]);

  const TABS = [
    { id: 'roster', label: 'Roster' },
    { id: 'applications', label: 'Applications' },
    { id: 'featured', label: 'Featured' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <main id="top">
      <section id="admin" className="admin section-shell">
        <div className="admin-copy">
          <span className="kicker">Admin dashboard</span>
          <h2>A command center, not a CMS template.</h2>
          <p>Roster CRUD, application approvals, featured control, appearance management, and platform-health analytics — all in one protected panel.</p>
        </div>

        <div className="admin-console" aria-label="Admin dashboard">
          <div className="console-top">
            <span></span><span></span><span></span>
            <strong>Admin / {TABS.find(t => t.id === activeTab)?.label}</strong>
            <button
              onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login'); }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </div>
          <div className="console-body">
            <aside>
              {TABS.map(tab => (
                <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </aside>
            <div id="adminPanel" className="console-main">
              {activeTab === 'roster' && <RosterTab streamers={streamers} onRefresh={loadStreamers} />}
              {activeTab === 'applications' && <ApplicationsTab />}
              {activeTab === 'featured' && <FeaturedTab streamers={streamers} onRefresh={loadStreamers} />}
              {activeTab === 'appearance' && <AppearanceTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
