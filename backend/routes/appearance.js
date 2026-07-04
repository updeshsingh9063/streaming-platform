const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET appearance settings
  router.get('/', (req, res) => {
    try {
      const stmt = db.prepare('SELECT key, value FROM appearance');
      const rows = stmt.all();
      const appearance = {};
      rows.forEach(r => {
        appearance[r.key] = r.value;
      });
      res.json(appearance);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
