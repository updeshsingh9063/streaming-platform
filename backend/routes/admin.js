const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';

// ── JWT middleware ─────────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ── Multer storage ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.key || 'file'}_${Date.now()}${ext}`);
  }
});
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB max

module.exports = (db) => {
  const router = express.Router();
  router.use(authenticateToken);

  // ── STREAMERS ──────────────────────────────────────────────────────────────

  // GET all (including unapproved) — roster view
  router.get('/streamers', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM streamers ORDER BY approved DESC, id DESC').all());
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST — add new streamer
  router.post('/streamers', (req, res) => {
    try {
      const { name, slug, platform, blurb, thumbnail, badge, featured, approved } = req.body;
      if (!name || !slug || !platform) return res.status(400).json({ error: 'name, slug and platform are required' });
      const info = db.prepare(
        'INSERT INTO streamers (name, slug, platform, blurb, thumbnail, badge, featured, approved, live, viewers) VALUES (?,?,?,?,?,?,?,?,0,0)'
      ).run(name, slug, platform, blurb || '', thumbnail || '', badge || null, featured ? 1 : 0, approved ? 1 : 0);
      res.status(201).json({ id: info.lastInsertRowid, message: 'Streamer added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // PUT — edit streamer
  router.put('/streamers/:id', (req, res) => {
    try {
      const { name, slug, platform, blurb, thumbnail, badge, featured, approved } = req.body;
      db.prepare(
        'UPDATE streamers SET name=?, slug=?, platform=?, blurb=?, thumbnail=?, badge=?, featured=?, approved=? WHERE id=?'
      ).run(name, slug, platform, blurb, thumbnail, badge || null, featured ? 1 : 0, approved ? 1 : 0, req.params.id);
      res.json({ message: 'Streamer updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // DELETE — remove streamer
  router.delete('/streamers/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM streamers WHERE id=?').run(req.params.id);
      res.json({ message: 'Streamer removed' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // PATCH — toggle featured
  router.patch('/streamers/:id/featured', (req, res) => {
    try {
      const s = db.prepare('SELECT featured FROM streamers WHERE id=?').get(req.params.id);
      if (!s) return res.status(404).json({ error: 'Not found' });
      db.prepare('UPDATE streamers SET featured=? WHERE id=?').run(s.featured ? 0 : 1, req.params.id);
      res.json({ featured: !s.featured });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // PATCH — approve/unapprove streamer
  router.patch('/streamers/:id/approve', (req, res) => {
    try {
      const { approved } = req.body;
      db.prepare('UPDATE streamers SET approved=? WHERE id=?').run(approved ? 1 : 0, req.params.id);
      res.json({ message: `Streamer ${approved ? 'approved' : 'unapproved'}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ── APPLICATIONS ───────────────────────────────────────────────────────────

  router.get('/applications', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all());
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.patch('/applications/:id', (req, res) => {
    try {
      const { status } = req.body; // 'approved' | 'rejected'
      if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
      db.prepare('UPDATE applications SET status=? WHERE id=?').run(status, req.params.id);
      res.json({ message: `Application ${status}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ── APPEARANCE ─────────────────────────────────────────────────────────────

  // GET all appearance settings
  router.get('/appearance', (req, res) => {
    try {
      const rows = db.prepare('SELECT key, value FROM appearance').all();
      const obj = {};
      rows.forEach(r => { obj[r.key] = r.value; });
      res.json(obj);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // PUT — update appearance text value (e.g., external URL)
  router.put('/appearance/:key', (req, res) => {
    try {
      const { value } = req.body;
      db.prepare('INSERT INTO appearance(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
        .run(req.params.key, value);
      res.json({ message: 'Appearance updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST — upload appearance file (banner / logo / favicon)
  router.post('/appearance/:key/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const url = `/uploads/${req.file.filename}`;
      db.prepare('INSERT INTO appearance(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
        .run(req.params.key, url);
      res.json({ url, message: 'File uploaded and appearance updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // ── ANALYTICS ──────────────────────────────────────────────────────────────

  router.get('/analytics', (req, res) => {
    try {
      const totalStreamers = db.prepare('SELECT COUNT(*) as count FROM streamers WHERE approved=1').get().count;
      const liveCount = db.prepare('SELECT COUNT(*) as count FROM streamers WHERE live=1 AND approved=1').get().count;
      const totalViewers = db.prepare('SELECT SUM(viewers) as total FROM streamers WHERE live=1 AND approved=1').get().total || 0;
      const featuredCount = db.prepare('SELECT COUNT(*) as count FROM streamers WHERE featured=1 AND approved=1').get().count;
      const pendingApps = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status='pending'").get().count;
      const platforms = db.prepare("SELECT platform, COUNT(*) as count FROM streamers WHERE approved=1 GROUP BY platform").all();

      // Real 7-day DAU and traffic trend from analytics_events table
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const isoDate = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const visitorsQuery = db.prepare(`SELECT COUNT(*) as cnt FROM analytics_events WHERE date(created_at) = ?`).get(isoDate).cnt;
        const dauQuery = db.prepare(`SELECT COUNT(DISTINCT ua) as cnt FROM analytics_events WHERE date(created_at) = ?`).get(isoDate).cnt;
        
        days.push({
          day: label,
          visitors: visitorsQuery,
          viewers: 0,
          dau: dauQuery,
        });
      }

      // Compute engagement and growth
      const today = days[days.length - 1];
      const yesterday = days[days.length - 2];
      const dau = today.dau;
      let dauGrowth = '0%';
      if (yesterday.dau > 0 || dau > 0) {
        if (yesterday.dau === 0) {
          dauGrowth = '+100%';
        } else {
          const diff = ((dau - yesterday.dau) / yesterday.dau) * 100;
          dauGrowth = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
        }
      }
      
      const engagement = today.visitors > 0 ? `${(today.visitors / (dau || 1)).toFixed(1)} views/user` : 'N/A';
      const retention = 'N/A (No Accounts)';
      const revenue = '$0.00 (Pending integration)';

      res.json({
        summary: { totalStreamers, liveCount, totalViewers, featuredCount, pendingApps, dau, dauGrowth, engagement, retention, revenue },
        platforms,
        traffic: days,
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  return router;
};
