import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function formatViewers(num) {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export default function StreamerProfilePage() {
  const { id } = useParams();
  const [streamer, setStreamer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    fetch(`${apiUrl}/streamers/${id}`)
      .then(res => res.json())
      .then(data => {
        setStreamer(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ padding: '100px', color: 'white' }}>Loading profile...</div>;
  }

  if (!streamer) {
    return (
      <div style={{ padding: '100px', color: 'white' }}>
        <h2>Streamer not found</h2>
        <Link to="/" style={{ color: 'var(--green)' }}>Return to directory</Link>
      </div>
    );
  }

  const isLive = streamer.live === 1;

  return (
    <main id="top">
      <section id="profiles" className="profiles section-shell">
        <Link to="/" style={{ color: 'var(--muted)', display: 'inline-block', marginBottom: '20px', textDecoration: 'none' }}>
          &larr; Back to directory
        </Link>
        <div className="profile-preview">
          <div className="profile-card large">
            <div 
              className="profile-cover" 
              style={{ backgroundImage: `url('${streamer.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80&fit=crop'}')`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
            >
              <div className="profile-cover-overlay"></div>
            </div>
            <div className="profile-meta">
              <span className={`platform-tag ${streamer.platform}`}>{streamer.platform.toUpperCase()}</span>
              {streamer.featured === 1 && <span className="featured-pill" style={{marginLeft: '10px'}}>FEATURED</span>}
              {streamer.badge && streamer.badge.split(',').map(b => (
                <span key={b.trim()} className="featured-pill" style={{marginLeft: '10px', background: 'rgba(255,255,255,0.1)', color: 'white'}}>{b.trim().toUpperCase()}</span>
              ))}
              <h3>{streamer.name}</h3>
              {streamer.stream_title && <div style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--green)' }}>{streamer.stream_title}</div>}
              {streamer.category_name && <div style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--muted)' }}>Playing: {streamer.category_name}</div>}
              <p>{streamer.blurb}</p>
              
              {!isLive && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '15px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  <span><strong>{formatViewers(streamer.viewers || 0)}</strong> Last Viewers</span>
                  <span><strong>{formatViewers(streamer.subscribers || 0)}</strong> Followers</span>
                </div>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                {isLive ? (
                  <>
                    <span className="live-pill"><span className="pulse"></span> LIVE</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{formatViewers(streamer.viewers)} viewers</span>
                    <a href={`https://${streamer.platform}.com/${streamer.slug}`} target="_blank" rel="noopener noreferrer" className="watch-btn" style={{ marginLeft: 'auto' }}>
                      WATCH NOW
                    </a>
                  </>
                ) : (
                  <>
                    <span className="offline-pill"><span className="pulse"></span> OFFLINE</span>
                    <a href={`https://${streamer.platform}.com/${streamer.slug}`} target="_blank" rel="noopener noreferrer" className="profile-btn" style={{ marginLeft: 'auto' }}>
                      VIEW CHANNEL
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="profile-copy">
            <span className="kicker">Channel profiles</span>
            <h2>{streamer.name} on {streamer.platform}</h2>
            <p>
              Profiles should feel fast, direct, and useful: one clear status, one clear platform,
              one clear path to watch.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
