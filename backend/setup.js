const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'db', 'chickenandy.db');
const schemaPath = path.join(__dirname, 'db', 'schema.sql');

if (fs.existsSync(dbPath)) {
  console.log('Database already exists. Removing to reset...');
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);
const schema = fs.readFileSync(schemaPath, 'utf-8');

db.exec(schema);
console.log('Database schema created.');

// Seed Admin User
const passwordHash = bcrypt.hashSync('admin123', 10);
db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);
console.log('Default admin user created (username: admin, password: admin123).');

// Seed Streamers
const seedStreamers = [
  { name: 'ChickenAndy', slug: 'chickenandy', platform: 'kick', blurb: 'Main channel signal with homepage priority and event visibility.', live: 1, viewers: 18420, featured: 1, thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80&fit=crop', badge: 'event' },
  { name: 'RoadCrew', slug: 'roadcrew', platform: 'kick', blurb: 'IRL stream with high movement, chat momentum, and active discovery.', live: 1, viewers: 7210, featured: 1, thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80&fit=crop', badge: 'friend' },
  { name: 'NightSignal', slug: 'nightsignal', platform: 'kick', blurb: 'Late-night coverage with steady community watch time.', live: 1, viewers: 3094, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80&fit=crop', badge: null },
  { name: 'ClipRunner', slug: 'cliprunner', platform: 'youtube', blurb: 'Video channel profile with platform identity and viewer discovery.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80&fit=crop', badge: null },
  { name: 'GreenRoom', slug: 'greenroom', platform: 'twitch', blurb: 'Twitch roster entry with platform label and offline profile access.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80&fit=crop', badge: null },
  { name: 'StreetPulse', slug: 'streetpulse', platform: 'tiktok', blurb: 'Short-form channel slot with clean platform identity and profile access.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&q=80&fit=crop', badge: null },
  { name: 'xQc', slug: 'xqc', platform: 'kick', blurb: 'One of the biggest streamers on Kick with massive viewership.', live: 1, viewers: 52000, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80&fit=crop', badge: null },
  { name: 'Adin Ross', slug: 'adinross', platform: 'kick', blurb: 'Entertainment and lifestyle streamer with huge community.', live: 1, viewers: 41200, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80&fit=crop', badge: null },
  { name: 'HasanAbi', slug: 'hasanabi', platform: 'kick', blurb: 'Political commentary and gaming streams with engaged audience.', live: 1, viewers: 28700, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80&fit=crop', badge: null },
  { name: 'Trainwreckstv', slug: 'trainwreckstv', platform: 'kick', blurb: 'High-energy variety streamer known for big moments.', live: 1, viewers: 19800, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80&fit=crop', badge: null },
  { name: 'Sketch', slug: 'sketch', platform: 'kick', blurb: 'Comedy and gaming content with rapid growth.', live: 1, viewers: 15600, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80&fit=crop', badge: null },
  { name: 'N3on', slug: 'n3on', platform: 'kick', blurb: 'Viral moments and IRL content creator.', live: 1, viewers: 12400, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80&fit=crop', badge: null },
  { name: 'IShowSpeed', slug: 'ishowspeed', platform: 'kick', blurb: 'High energy sports and gaming streamer.', live: 1, viewers: 9800, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1542751110-98a7a9e24949?w=600&q=80&fit=crop', badge: null },
  { name: 'Lacy', slug: 'lacy', platform: 'kick', blurb: 'One of the top female streamers on Kick.', live: 1, viewers: 7300, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80&fit=crop', badge: null },
  { name: 'BruceDropEmOff', slug: 'brucedropemoff', platform: 'kick', blurb: 'Personality streamer known for community engagement.', live: 1, viewers: 6100, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80&fit=crop', badge: null },
  { name: 'Cuffem', slug: 'cuffem', platform: 'kick', blurb: 'IRL and variety content across Kick.', live: 1, viewers: 5400, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80&fit=crop', badge: null },
  { name: 'Penta', slug: 'penta', platform: 'kick', blurb: 'FPS gaming and esports content on Kick.', live: 1, viewers: 4800, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1548686304-89d188a80029?w=600&q=80&fit=crop', badge: null },
  { name: 'Stableronaldo', slug: 'stableronaldo', platform: 'kick', blurb: 'FIFA and sports gaming specialist.', live: 1, viewers: 4200, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80&fit=crop', badge: null },
  { name: 'KaiCenat', slug: 'kaicenat', platform: 'kick', blurb: 'Multi-platform streaming star with record-breaking subs.', live: 1, viewers: 3700, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80&fit=crop', badge: null },
  { name: 'GamingWithKev', slug: 'gamingwithkev', platform: 'kick', blurb: 'Minecraft and family friendly gaming content.', live: 1, viewers: 3200, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80&fit=crop', badge: null },
  { name: 'OddCast', slug: 'oddcast', platform: 'kick', blurb: 'Podcast-style streaming with guests and debate.', live: 1, viewers: 2900, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80&fit=crop', badge: null },
  { name: 'Vivid', slug: 'vivid', platform: 'kick', blurb: 'Art and creative streaming on Kick.', live: 1, viewers: 2400, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80&fit=crop', badge: null },
  { name: 'CowboyTV', slug: 'cowboytv', platform: 'kick', blurb: 'IRL and travel streams from across the US.', live: 1, viewers: 1900, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=600&q=80&fit=crop', badge: null },
  { name: 'BlastTV', slug: 'blasttv', platform: 'kick', blurb: 'Esports coverage and tournament streams.', live: 1, viewers: 1600, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80&fit=crop', badge: null },
  { name: 'Nickmercs', slug: 'nickmercs', platform: 'kick', blurb: 'Warzone and Call of Duty top competitive player.', live: 1, viewers: 1300, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1542751110-98a7a9e24949?w=600&q=80&fit=crop', badge: null },
  { name: 'DramaAlert', slug: 'dramaalert', platform: 'kick', blurb: 'Creator drama and gaming news broadcasts.', live: 1, viewers: 1100, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80&fit=crop', badge: null },
  { name: 'PixelDrifter', slug: 'pixeldrifter', platform: 'twitch', blurb: 'Retro gaming and pixel art streams.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80&fit=crop', badge: null },
  { name: 'VaultBreaker', slug: 'vaultbreaker', platform: 'twitch', blurb: 'Escape rooms and puzzle game speedrunner.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1548686304-89d188a80029?w=600&q=80&fit=crop', badge: null },
  { name: 'SonicWave', slug: 'sonicwave', platform: 'youtube', blurb: 'Music production and live DJ sets.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80&fit=crop', badge: null },
  { name: 'NeonCityTV', slug: 'neoncitytv', platform: 'youtube', blurb: 'Urban IRL streams from city nightlife scenes.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80&fit=crop', badge: null },
  { name: 'ZeroGravity', slug: 'zerogravity', platform: 'tiktok', blurb: 'Short-form highlights and viral gaming clips.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80&fit=crop', badge: null },
];

const insertStreamer = db.prepare(`
  INSERT INTO streamers (name, slug, platform, blurb, live, viewers, featured, thumbnail, badge, approved)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAppearance = db.prepare(`INSERT INTO appearance (key, value) VALUES (?, ?)`);
insertAppearance.run('banner', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80&fit=crop');
insertAppearance.run('logo', '');
insertAppearance.run('favicon', '');

for (const s of seedStreamers) {
  insertStreamer.run(s.name, s.slug, s.platform, s.blurb, s.live, s.viewers, s.featured, s.thumbnail, s.badge);
}

console.log('Seed data inserted.');
db.close();
