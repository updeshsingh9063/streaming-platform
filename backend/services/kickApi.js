const NodeCache = require('node-cache');
// We use native fetch in Node 22

// Cache data for 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

async function getKickLiveStatus(slug) {
  const cacheKey = `kick_${slug}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // For MVP, we use the public V2 API. 
    // Kick API may require auth or block non-browser user agents, we might need a fallback.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Kick API returned ${res.status} for ${slug}`);
      return null;
    }

    const data = await res.json();
    
    const result = {
      live: data.livestream !== null,
      viewers: data.livestream ? data.livestream.viewer_count : 0
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Failed to fetch Kick data for ${slug}`, err);
    return null;
  }
}

module.exports = {
  getKickLiveStatus
};
