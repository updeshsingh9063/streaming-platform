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
  { name: 'StreetPulse', slug: 'streetpulse', platform: 'tiktok', blurb: 'Short-form channel slot with clean platform identity and profile access.', live: 0, viewers: 0, featured: 0, thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&q=80&fit=crop', badge: null }
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
