const express = require('express');
const { getKickLiveStatus } = require('../services/kickApi');

module.exports = (db) => {
  const router = express.Router();

  // GET all approved streamers
  router.get('/', (req, res) => {
    try {
      // The DB is updated asynchronously by the background worker
      // We can use the index we created to query efficiently
      const stmt = db.prepare('SELECT * FROM streamers WHERE approved = 1 ORDER BY live DESC, viewers DESC');
      const streamers = stmt.all();

      res.json(streamers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET single streamer
  router.get('/:id', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM streamers WHERE id = ? AND approved = 1');
      const streamer = stmt.get(req.params.id);
      
      if (!streamer) {
        return res.status(404).json({ error: 'Streamer not found' });
      }

      res.json(streamer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
