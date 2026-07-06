require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Database
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'db', 'chickenandy.db'));
db.pragma('journal_mode = WAL');

// Startup Requirements
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

// Safe schema migrations — add new columns without wiping existing data
const migrations = [
  "ALTER TABLE streamers ADD COLUMN stream_title TEXT",
  "ALTER TABLE streamers ADD COLUMN category_name TEXT",
  "ALTER TABLE streamers ADD COLUMN subscribers INTEGER DEFAULT 0",
];
for (const sql of migrations) {
  try { db.prepare(sql).run(); } catch (_) { /* column already exists — safe to ignore */ }
}

// Background Worker
const { startBackgroundWorker } = require('./services/worker');

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:",
        "https://images.unsplash.com", "https://*.unsplash.com",
        "https://files.kick.com", "https://*.kick.com",
        "https://images.kick.com"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
    }
  }
}));
// Allow any origin for now so Vercel Preview URLs work
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rate-limit login: max 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' }
});

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.post('/api/track', (req, res) => {
  try {
    const ua = req.headers['user-agent'] || 'unknown';
    const event = req.body.event || 'pageview';
    db.prepare('INSERT INTO analytics_events (event, ua) VALUES (?, ?)').run(event, ua);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use('/api/streamers', require('./routes/streamers')(db));
app.use('/api/appearance', require('./routes/appearance')(db));
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', require('./routes/auth')(db));
app.use('/api/admin', require('./routes/admin')(db));

// Auto-seed any missing streamers on every startup (safe - uses INSERT OR IGNORE)
function seedMissingStreamers() {
  // Clean up any historical duplicates first
  try {
    // Remove duplicate slugs, keeping the oldest row
    db.prepare('DELETE FROM streamers WHERE id NOT IN (SELECT MIN(id) FROM streamers GROUP BY slug)').run();
    // Wipe all fake mock Unsplash images AND empty strings so only live Kick thumbnails show
    db.prepare("UPDATE streamers SET thumbnail = NULL WHERE thumbnail LIKE '%unsplash.com%' OR thumbnail = '' OR thumbnail IS NULL AND slug IN ('roadcrew','nightsignal','cliprunner','greenroom','streetpulse','pixeldrifter','vaultbreaker','sonicwave','neoncitytv','zerogravity')").run();
    // Create unique index on slug to prevent future duplicates (safe - ignores if already exists)
    try { db.prepare('CREATE UNIQUE INDEX idx_streamers_slug_unique ON streamers(slug)').run(); } catch(_) {}
  } catch (e) {
    console.error('Dedup error:', e.message);
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO streamers (name, slug, platform, blurb, live, viewers, featured, thumbnail, badge, approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  const streamers = [
    { name: 'ChickenAndy', slug: 'chickenandy', platform: 'kick', blurb: 'Main channel signal with homepage priority and event visibility.', live: 0, viewers: 0, featured: 1, thumbnail: null, badge: 'event' },
    { name: 'RoadCrew', slug: 'roadcrew', platform: 'kick', blurb: 'IRL stream with high movement, chat momentum, and active discovery.', live: 0, viewers: 0, featured: 1, thumbnail: null, badge: 'friend' },
    { name: 'NightSignal', slug: 'nightsignal', platform: 'kick', blurb: 'Late-night coverage with steady community watch time.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'ClipRunner', slug: 'cliprunner', platform: 'youtube', blurb: 'Video channel profile with platform identity and viewer discovery.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'GreenRoom', slug: 'greenroom', platform: 'twitch', blurb: 'Twitch roster entry with platform label and offline profile access.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'StreetPulse', slug: 'streetpulse', platform: 'tiktok', blurb: 'Short-form channel slot with clean platform identity and profile access.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'xQc', slug: 'xqc', platform: 'kick', blurb: 'One of the biggest streamers on Kick with massive viewership.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Adin Ross', slug: 'adinross', platform: 'kick', blurb: 'Entertainment and lifestyle streamer with huge community.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'HasanAbi', slug: 'hasanabi', platform: 'kick', blurb: 'Political commentary and gaming streams with engaged audience.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Trainwreckstv', slug: 'trainwreckstv', platform: 'kick', blurb: 'High-energy variety streamer known for big moments.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Sketch', slug: 'sketch', platform: 'kick', blurb: 'Comedy and gaming content with rapid growth.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'N3on', slug: 'n3on', platform: 'kick', blurb: 'Viral moments and IRL content creator.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'IShowSpeed', slug: 'ishowspeed', platform: 'kick', blurb: 'High energy sports and gaming streamer.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Lacy', slug: 'lacy', platform: 'kick', blurb: 'One of the top female streamers on Kick.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'BruceDropEmOff', slug: 'brucedropemoff', platform: 'kick', blurb: 'Personality streamer known for community engagement.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Cuffem', slug: 'cuffem', platform: 'kick', blurb: 'IRL and variety content across Kick.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Penta', slug: 'penta', platform: 'kick', blurb: 'FPS gaming and esports content on Kick.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Stableronaldo', slug: 'stableronaldo', platform: 'kick', blurb: 'FIFA and sports gaming specialist.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'KaiCenat', slug: 'kaicenat', platform: 'kick', blurb: 'Multi-platform streaming star with record-breaking subs.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'GamingWithKev', slug: 'gamingwithkev', platform: 'kick', blurb: 'Minecraft and family friendly gaming content.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'OddCast', slug: 'oddcast', platform: 'kick', blurb: 'Podcast-style streaming with guests and debate.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Vivid', slug: 'vivid', platform: 'kick', blurb: 'Art and creative streaming on Kick.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'CowboyTV', slug: 'cowboytv', platform: 'kick', blurb: 'IRL and travel streams from across the US.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'BlastTV', slug: 'blasttv', platform: 'kick', blurb: 'Esports coverage and tournament streams.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'Nickmercs', slug: 'nickmercs', platform: 'kick', blurb: 'Warzone and Call of Duty top competitive player.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'DramaAlert', slug: 'dramaalert', platform: 'kick', blurb: 'Creator drama and gaming news broadcasts.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'PixelDrifter', slug: 'pixeldrifter', platform: 'twitch', blurb: 'Retro gaming and pixel art streams.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'VaultBreaker', slug: 'vaultbreaker', platform: 'twitch', blurb: 'Escape rooms and puzzle game speedrunner.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'SonicWave', slug: 'sonicwave', platform: 'youtube', blurb: 'Music production and live DJ sets.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'NeonCityTV', slug: 'neoncitytv', platform: 'youtube', blurb: 'Urban IRL streams from city nightlife scenes.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
    { name: 'ZeroGravity', slug: 'zerogravity', platform: 'tiktok', blurb: 'Short-form highlights and viral gaming clips.', live: 0, viewers: 0, featured: 0, thumbnail: null, badge: null },
  ];
  const seedAll = db.transaction((list) => {
    for (const s of list) {
      insert.run(s.name, s.slug, s.platform, s.blurb, s.live, s.viewers, s.featured, s.thumbnail, s.badge);
    }
  });
  seedAll(streamers);
  console.log('Auto-seed: missing streamers inserted.');
}

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  seedMissingStreamers();
  startBackgroundWorker(db);
});

