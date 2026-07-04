import React, { useState, useEffect } from 'react';
import StreamerCard from '../components/StreamerCard';

export default function DirectoryPage() {
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [bannerUrl, setBannerUrl] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    fetch(`${apiUrl}/streamers`)
      .then(res => res.json())
      .then(data => {
        setStreamers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch streamers', err);
        setLoading(false);
      });
      
    fetch(`${apiUrl}/appearance`)
      .then(res => res.json())
      .then(data => {
        if (data.banner) setBannerUrl(data.banner);
      })
      .catch(err => console.error(err));
  }, []);

  const filteredStreamers = streamers.filter(s => {
    if (filter !== 'all' && s.platform !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main id="top">
      <section className="hero section-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span></span> Live now · owner curated · Kick first</div>
          <h1>Who’s live right now.</h1>
          <p>
            Open the board, see the active streamers, sort by viewers, and jump straight into the channel.
            No accounts, no clutter — just the ChickenAndy roster in real time.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#live">Enter live board</a>
            <a className="secondary-action" href="#featured">Featured channels</a>
          </div>
          <div className="hero-stats" aria-label="Project highlights">
            <article><strong>{streamers.reduce((acc, s) => acc + (s.live ? s.viewers : 0), 0).toLocaleString()}</strong><span>watching now</span></article>
            <article><strong>{streamers.length.toString().padStart(2, '0')}</strong><span>tracked channels</span></article>
            <article><strong>LIVE</strong><span>viewer-ranked board</span></article>
          </div>
        </div>

        <div className="hero-media" aria-label="Landing video preview area">
          <div className="video-frame" style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '360px', borderRadius: '32px' } : {}}>
            {!bannerUrl && (
              <video className="hero-video" autoPlay muted loop playsInline preload="metadata">
                <source src="/assets/hero-video.mp4" type="video/mp4" />
              </video>
            )}
            <div className="video-overlay" style={{ marginTop: 'auto' }}>
              <span className="live-chip">Top live channel</span>
              <strong>{streamers.find(s => s.live)?.name || 'ChickenAndy'} is streaming.</strong>
            </div>
          </div>
          <div className="floating-card live-signal">
            <span className="pulse-dot"></span>
            <strong>Live signal</strong>
            <small>Kick API freshness + cached ranking</small>
          </div>
          <div className="floating-card rank-card">
            <strong>#01</strong>
            <small>Viewer-count sorted</small>
          </div>
        </div>
      </section>

      <section id="live" className="live-board section-shell">
        <div className="section-heading">
          <div>
            <span className="kicker">Live channels</span>
            <h2>Active streams first. Offline channels last.</h2>
          </div>
          <p>Information-dense channel cards make the page feel like a real streaming directory, not a marketing site.</p>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <span>Search</span>
            <input 
              type="search" 
              placeholder="Find a streamer…" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div className="filter-pills" aria-label="Platform filters">
            {['all', 'kick', 'twitch', 'youtube', 'tiktok'].map(p => (
              <button 
                key={p} 
                className={`pill ${filter === p ? 'is-active' : ''}`}
                onClick={() => setFilter(p)}
              >
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div id="streamerGrid" className="streamer-grid" aria-live="polite">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading streamers...</p>
          ) : (
            filteredStreamers.map((streamer, i) => (
              <StreamerCard key={streamer.id} streamer={streamer} index={i} />
            ))
          )}
        </div>
      </section>
      
      <section id="overview" className="platform-map section-shell">
        <div className="section-heading">
          <div>
            <span className="kicker">Channel system</span>
            <h2>Live channels, profiles, and roster control in one place.</h2>
          </div>
          <p>Dense channel cards, live badges, viewer counts, offline rows, and admin-controlled roster management.</p>
        </div>
        <div className="scope-grid">
          <article style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="scope-card-overlay">
              <span>Directory</span>
              <strong>Public live board</strong>
              <p>Live/offline status, viewer-count sorting, offline grey state, search, featured placements, platform icons.</p>
            </div>
          </article>
          <article style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&q=80&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="scope-card-overlay">
              <span>Profiles</span>
              <strong>Streamer profiles</strong>
              <p>Advanced profile pages with platform identity, live state, viewer count, badges, roles, and watch action.</p>
            </div>
          </article>
          <article style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=500&q=80&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="scope-card-overlay">
              <span>Admin</span>
              <strong>Owner dashboard</strong>
              <p>Roster CRUD, applications, featured control, platform dropdown, analytics, banner/logo/favicon controls.</p>
            </div>
          </article>
          <article className="scope-dark" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="scope-card-overlay">
              <span>Launch</span>
              <strong>Live deployment</strong>
              <p>Fast responsive experience with cached live data, custom-domain support, and a production interface.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="featured" className="featured section-shell">
        <div className="feature-panel" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="feature-panel-overlay">
            <div>
              <span className="kicker">Featured row</span>
              <h2>Promote the channels that matter today.</h2>
              <p>
                The admin can promote important streamers, event partners, or active collaborations
                without changing code.
              </p>
            </div>
            <div className="spotlight-stack">
              <article>
                <span>Featured</span>
                <strong>Event stream</strong>
                <small>Homepage priority placement</small>
              </article>
              <article>
                <span>Badge</span>
                <strong>Friend group</strong>
                <small>Curated roster identity</small>
              </article>
              <article>
                <span>Seasonal</span>
                <strong>Banner swap</strong>
                <small>Holiday, event, and collaboration updates</small>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="launch" className="video-brief section-shell">
        <span className="kicker">Product details</span>
        <h2>Everything a viewer and owner need for the live directory.</h2>
        <div className="brief-grid">
          <article><strong>Real Kick state</strong><span>Live/offline status, viewer counts, and refresh cadence presented clearly.</span></article>
          <article><strong>Admin self-service</strong><span>Owner controls roster, featured placement, banner, logo, and favicon without developer work.</span></article>
          <article><strong>Platform health</strong><span>DAU, growth, traffic, engagement, retention, and revenue visibility in the dashboard.</span></article>
          <article><strong>Mobile-first QA</strong><span>Layouts prioritize phone scanning, thumb-friendly controls, and fast directory discovery.</span></article>
          <article><strong>Performance</strong><span>Lean interface, cached responses, fast browsing, and Core Web Vitals-focused structure.</span></article>
          <article><strong>Deployment</strong><span>Custom-domain launch flow with production hosting configuration.</span></article>
        </div>
      </section>
    </main>
  );
}
