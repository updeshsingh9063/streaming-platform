import React from 'react';
import { Link } from 'react-router-dom';

function formatViewers(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export default function StreamerCard({ streamer, index }) {
  const { name, slug, platform, blurb, live, viewers, featured, thumbnail, badge, id } = streamer;
  const isLive = live === 1;

  return (
    <article className={`streamer-card ${!isLive ? 'is-offline' : ''}`}>
      <div 
        className="stream-thumb" 
        style={thumbnail ? { backgroundImage: `url('${thumbnail}')` } : {}}
      >
        <div className="thumb-overlay"></div>
        <div className="thumb-status">
          {isLive ? (
            <span className="live-pill"><span className="pulse"></span> LIVE</span>
          ) : (
            <span className="offline-pill"><span className="pulse"></span> OFFLINE</span>
          )}
          {featured === 1 && <span className="featured-pill">FEATURED</span>}
        </div>
        <span className="rank-badge">#{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="stream-info">
        <div className="streamer-identity">
          <div className="avatar">
            <span>{name.substring(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <h3>{name}</h3>
            <p>{blurb}</p>
          </div>
        </div>
        
        <div className="stream-meta">
          <span className={`platform-tag ${platform}`}>{platform.toUpperCase()}</span>
          {isLive ? (
            <span className="viewer-count">{formatViewers(viewers)}</span>
          ) : (
            <span className="viewer-count" style={{opacity: 0.5}}>Offline</span>
          )}
        </div>
        
        {isLive ? (
          <Link to={`/streamer/${id}`} className="watch-btn">
            WATCH STREAM
          </Link>
        ) : (
          <Link to={`/streamer/${id}`} className="profile-btn">
            VIEW PROFILE
          </Link>
        )}
      </div>
    </article>
  );
}
