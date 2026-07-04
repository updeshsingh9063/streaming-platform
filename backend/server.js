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

// Background Worker
const { startBackgroundWorker } = require('./services/worker');

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
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
app.use('/api/streamers', require('./routes/streamers')(db));
app.use('/api/appearance', require('./routes/appearance')(db));
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', require('./routes/auth')(db));
app.use('/api/admin', require('./routes/admin')(db));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  // Start the background worker after server starts
  startBackgroundWorker(db);
});
