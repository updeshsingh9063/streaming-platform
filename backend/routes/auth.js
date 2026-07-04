const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  const router = express.Router();

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    try {
      const stmt = db.prepare('SELECT * FROM admin_users WHERE username = ?');
      const user = stmt.get(username);
      
      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { id: user.id, username: user.username }, 
        process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production',
        { expiresIn: '1d' }
      );
      
      res.json({ token, message: 'Login successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
