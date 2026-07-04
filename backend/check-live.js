require('dotenv').config();

async function checkLive() {
  try {
    const tokenRes = await fetch('https://id.kick.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.KICK_CLIENT_ID,
        client_secret: process.env.KICK_CLIENT_SECRET
      })
    });
    
    if (!tokenRes.ok) {
      console.log('Failed to get token:', await tokenRes.text());
      return;
    }
    
    const { access_token } = await tokenRes.json();
    const slugs = ['xqc', 'adinross', 'n3on', 'lacy', 'hasanabi', 'trainwreckstv', 'ac7ionman', 'fousey', 'iceposeidon', 'stableronaldo'];
    
    let liveFound = false;
    for (const slug of slugs) {
      const res = await fetch(`https://api.kick.com/public/v1/channels/${slug}`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.is_live) {
          console.log(`LIVE: ${slug} (${data.livestream.viewer_count} viewers)`);
          liveFound = true;
        }
      }
    }
    if (!liveFound) console.log("None of those top streamers are live right now!");
  } catch (err) {
    console.error('Error:', err.message);
  }
}
checkLive();
