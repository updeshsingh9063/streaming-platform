import React from 'react';

export default function PlatformIcon({ platform, className = '' }) {
  if (platform === 'kick') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2h4v4h4v4h4v4h-4v4H8v4H4V2zm12 8h4V6h-4v4zm0 4h4v4h-4v-4z"/>
      </svg>
    );
  }
  if (platform === 'twitch') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.806-6.806v-14.149h-21.851zm19.164 13.06l-4.298 4.298h-5.373l-3.045 3.045v-3.045h-4.836v-15.045h17.552v10.747zm-3.582-7.343v6.269h-2.149v-6.269h2.149zm-5.731 0v6.269h-2.149v-6.269h2.149z" />
      </svg>
    );
  }
  if (platform === 'youtube') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (platform === 'tiktok') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
      </svg>
    );
  }
  return null;
}
