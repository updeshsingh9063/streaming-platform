const NodeCache = require('node-cache');

// Cache API responses for 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

// Global variable to hold our OAuth token and expiration
let kickAccessToken = null;
let kickTokenExpiresAt = 0;

/**
 * Fetch a new OAuth token from Kick's identity server using Client Credentials.
 */
async function getAccessToken() {
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('KICK_CLIENT_ID or KICK_CLIENT_SECRET is not configured in .env');
  }

  // If token is still valid (with a 60-second buffer), reuse it
  if (kickAccessToken && Date.now() < kickTokenExpiresAt - 60000) {
    return kickAccessToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const res = await fetch('https://id.kick.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Kick OAuth failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    kickAccessToken = data.access_token;
    // data.expires_in is usually in seconds (e.g. 3600)
    kickTokenExpiresAt = Date.now() + (data.expires_in * 1000);
    
    return kickAccessToken;
  } catch (err) {
    console.error('Failed to get Kick access token:', err.message);
    return null;
  }
}

/**
 * Get the live status of a channel using the official Public API
 */
async function getKickLiveStatus(slug) {
  const cacheKey = `kick_${slug}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // 1. Get the OAuth token
    const token = await getAccessToken();
    if (!token) return null; // Abort if auth fails

    // 2. Fetch from the official public API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://api.kick.com/public/v1/channels?slug=${slug}`, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);

    if (res.status === 404) {
      // Channel doesn't exist
      return null;
    }

    if (!res.ok) {
      console.warn(`Kick API returned ${res.status} for ${slug}`);
      return null;
    }

    const data = await res.json();
    
    // Parse the official response schema
    // Assuming if livestream object exists in the response, they are live
    const isLive = data.livestream !== null && data.livestream !== undefined;
    
    const result = {
      live: isLive,
      viewers: isLive ? data.livestream.viewer_count : 0
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Failed to fetch Kick data for ${slug}`, err.message);
    return null;
  }
}

module.exports = {
  getKickLiveStatus
};
