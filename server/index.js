const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'C:\\Users\\Administrator\\.gemini\\antigravity\\scratch\\midas-markets-app\\public\\proofs');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Database Setup
// ---------------------------------------------------------------------------
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');

  db.serialize(() => {
    // Reviews Table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      stars INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_response TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Suggestions Table
    db.run(`CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Emails / Waitlist Table
    db.run(`CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      source TEXT DEFAULT 'waitlist',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Analytics / Click-tracking Table
    db.run(`CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      event_target TEXT NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Proofs Table
    db.run(`CREATE TABLE IF NOT EXISTS proofs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      title TEXT,
      subtitle TEXT,
      badge TEXT,
      is_red BOOLEAN,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // FAQs Table
    db.run(`CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      answer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT
    )`);

    // Seed FAQs if empty
    db.get('SELECT count(*) as count FROM faqs', (err, row) => {
      if (!err && row.count === 0) {
        console.log('Seeding FAQs...');
        db.run(`INSERT INTO faqs (question, answer) VALUES 
          ('What is Midas Markets?', 'Midas Markets is an elite trading group.'),
          ('How do I join?', 'Join via our waitlist or secure a VIP spot.')`);
      }
    });

    // Seed Settings if empty
    db.get('SELECT count(*) as count FROM settings', (err, row) => {
      if (!err && row.count === 0) {
        console.log('Seeding settings...');
        db.run(`INSERT INTO settings (key, value) VALUES 
          ('scarcity_banner_active', 'false'),
          ('scarcity_banner_text', 'Only 3 VIP spots remaining this week!')`);
      }
    });

    // Seed initial reviews if the table is empty
    db.get('SELECT count(*) as count FROM reviews', (err, row) => {
      if (!err && row.count === 0) {
        console.log('Seeding database with initial reviews...');

        const seedData = [
          { type: 'POSITIVE', name: 'Alex M.', text: 'Absolutely printing. Best group I have ever joined.', stars: 5, status: 'approved' },
          { type: 'POSITIVE', name: 'Sarah L.', text: 'Passed my funded challenge using only these setups.', stars: 5, status: 'approved' },
          { type: 'NEGATIVE', name: 'Chris T.', text: 'Great signals, but you really need to understand SMC to be able to follow them properly.', stars: 4, status: 'approved' },
        ];

        const stmt = db.prepare('INSERT INTO reviews (type, name, text, stars, status) VALUES (?, ?, ?, ?, ?)');
        for (const review of seedData) {
          stmt.run(review.type, review.name, review.text, review.stars, review.status);
        }
        stmt.finalize();
      }
    });
  });
});

// ---------------------------------------------------------------------------
// Helper: promisified db methods (keeps route handlers clean)
// ---------------------------------------------------------------------------
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
function isValidEmail(email) {
  // Simple but solid email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===========================================================================
//  PUBLIC  ENDPOINTS
// ===========================================================================

// ---- Proofs ---------------------------------------------------------------
app.get('/api/proofs', async (req, res, next) => {
  try {
    const rows = await dbAll('SELECT * FROM proofs ORDER BY id DESC');
    res.json({ proofs: rows });
  } catch (err) {
    next(err);
  }
});

// ---- FAQs -----------------------------------------------------------------
app.get('/api/faqs', async (req, res, next) => {
  try {
    const rows = await dbAll('SELECT * FROM faqs ORDER BY id ASC');
    res.json({ faqs: rows });
  } catch (err) {
    next(err);
  }
});

// ---- Settings -------------------------------------------------------------
app.get('/api/settings', async (req, res, next) => {
  try {
    const rows = await dbAll('SELECT * FROM settings');
    res.json({ settings: rows });
  } catch (err) {
    next(err);
  }
});

// ---- Reviews --------------------------------------------------------------

// Get all approved reviews (public)
app.get('/api/reviews', async (req, res, next) => {
  try {
    const rows = await dbAll("SELECT * FROM reviews WHERE status = 'approved' ORDER BY id DESC");
    res.json({ reviews: rows });
  } catch (err) {
    next(err);
  }
});

// Submit a new review (public)
app.post('/api/reviews', async (req, res, next) => {
  try {
    const { type, name, text, stars } = req.body;
    if (!name || !text || !stars || !type) {
      return res.status(400).json({ error: 'Missing required fields: type, name, text, stars' });
    }

    const result = await dbRun(
      "INSERT INTO reviews (type, name, text, stars, status) VALUES (?, ?, ?, ?, 'pending')",
      [type, name, text, stars]
    );
    res.json({ id: result.lastID, message: 'Review submitted successfully and is pending approval.' });
  } catch (err) {
    next(err);
  }
});

// ---- Suggestions ----------------------------------------------------------

// Submit a suggestion (public)
app.post('/api/suggestions', async (req, res, next) => {
  try {
    const { name, text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Suggestion text is required' });
    }

    const result = await dbRun(
      'INSERT INTO suggestions (name, text) VALUES (?, ?)',
      [name || 'Anonymous', text]
    );
    res.json({ id: result.lastID, message: 'Suggestion submitted successfully' });
  } catch (err) {
    next(err);
  }
});

// ---- Emails / Waitlist ----------------------------------------------------

// Submit an email to the waitlist (public)
app.post('/api/emails', async (req, res, next) => {
  try {
    const { email, name, source } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const result = await dbRun(
      'INSERT INTO emails (email, name, source) VALUES (?, ?, ?)',
      [email.trim().toLowerCase(), name || null, source || 'waitlist']
    );
    res.json({ id: result.lastID, message: 'Email submitted successfully' });
  } catch (err) {
    // SQLite UNIQUE constraint error code
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This email is already on the waitlist' });
    }
    next(err);
  }
});

// ---- Analytics / Click Tracking -------------------------------------------

// Log a click / analytics event (public)
app.post('/api/analytics/track', async (req, res, next) => {
  try {
    const { event_type, event_target } = req.body;

    if (!event_type || !event_target) {
      return res.status(400).json({ error: 'event_type and event_target are required' });
    }

    const referrer = req.body.referrer || req.get('referer') || null;
    const user_agent = req.body.user_agent || req.get('user-agent') || null;

    const result = await dbRun(
      'INSERT INTO analytics (event_type, event_target, referrer, user_agent) VALUES (?, ?, ?, ?)',
      [event_type, event_target, referrer, user_agent]
    );
    res.json({ id: result.lastID, message: 'Event tracked' });
  } catch (err) {
    next(err);
  }
});

// ===========================================================================
//  ADMIN  ENDPOINTS
// ===========================================================================

// ---- Admin: Reviews -------------------------------------------------------

// Get ALL reviews (pending, approved, rejected)
app.get('/api/admin/reviews', async (req, res, next) => {
  try {
    const rows = await dbAll('SELECT * FROM reviews ORDER BY id DESC');
    res.json({ reviews: rows });
  } catch (err) {
    next(err);
  }
});

// Update review status (approve / reject)
app.put('/api/admin/reviews/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    await dbRun('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    next(err);
  }
});

// Add admin response to a review
app.put('/api/admin/reviews/:id/respond', async (req, res, next) => {
  try {
    const { response } = req.body;
    await dbRun('UPDATE reviews SET admin_response = ? WHERE id = ?', [response, req.params.id]);
    res.json({ message: 'Response added successfully' });
  } catch (err) {
    next(err);
  }
});

// Delete a review
app.delete('/api/admin/reviews/:id', async (req, res, next) => {
  try {
    const result = await dbRun('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ---- Admin: Suggestions ---------------------------------------------------

// Get all suggestions
app.get('/api/admin/suggestions', async (req, res, next) => {
  try {
    const rows = await dbAll('SELECT * FROM suggestions ORDER BY id DESC');
    res.json({ suggestions: rows });
  } catch (err) {
    next(err);
  }
});

// Delete a suggestion
app.delete('/api/admin/suggestions/:id', async (req, res, next) => {
  try {
    const result = await dbRun('DELETE FROM suggestions WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json({ message: 'Suggestion deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ---- Admin: Emails --------------------------------------------------------

// Get all emails
app.get('/api/admin/emails', async (req, res, next) => {
  try {
    const rows = await dbAll('SELECT * FROM emails ORDER BY id DESC');
    res.json({ emails: rows });
  } catch (err) {
    next(err);
  }
});

// Get email count
app.get('/api/admin/emails/count', async (req, res, next) => {
  try {
    const row = await dbGet('SELECT count(*) as count FROM emails');
    res.json({ count: row.count });
  } catch (err) {
    next(err);
  }
});

// ---- Admin: Analytics -----------------------------------------------------

// Get all analytics events
app.get('/api/admin/analytics', async (req, res, next) => {
  try {
    const rows = await dbAll('SELECT * FROM analytics ORDER BY id DESC');
    res.json({ events: rows });
  } catch (err) {
    next(err);
  }
});

// Get aggregated summary grouped by event_target
app.get('/api/admin/analytics/summary', async (req, res, next) => {
  try {
    const rows = await dbAll(
      'SELECT event_target, count(*) as count FROM analytics GROUP BY event_target ORDER BY count DESC'
    );
    res.json({ summary: rows });
  } catch (err) {
    next(err);
  }
});

// ---- Admin: Dashboard Stats -----------------------------------------------

app.get('/api/admin/stats', async (req, res, next) => {
  try {
    const [totalReviews, pendingReviews, totalEmails, totalSuggestions, totalClicks] =
      await Promise.all([
        dbGet('SELECT count(*) as count FROM reviews'),
        dbGet("SELECT count(*) as count FROM reviews WHERE status = 'pending'"),
        dbGet('SELECT count(*) as count FROM emails'),
        dbGet('SELECT count(*) as count FROM suggestions'),
        dbGet('SELECT count(*) as count FROM analytics'),
      ]);

    res.json({
      totalReviews: totalReviews.count,
      pendingReviews: pendingReviews.count,
      totalEmails: totalEmails.count,
      totalSuggestions: totalSuggestions.count,
      totalClicks: totalClicks.count,
    });
  } catch (err) {
    next(err);
  }
});

// ---- Admin: Proofs --------------------------------------------------------
app.post('/api/admin/proofs', upload.single('image'), async (req, res, next) => {
  try {
    const { title, subtitle, badge, is_red, details } = req.body;
    const filename = req.file ? req.file.filename : null;
    
    const isRedBool = is_red === 'true' || is_red === true || is_red === '1' || is_red === 1;
    
    const result = await dbRun(
      'INSERT INTO proofs (filename, title, subtitle, badge, is_red, details) VALUES (?, ?, ?, ?, ?, ?)',
      [filename, title, subtitle, badge, isRedBool, details]
    );
    
    const newProof = await dbGet('SELECT * FROM proofs WHERE id = ?', [result.lastID]);
    res.json(newProof);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/admin/proofs/:id', async (req, res, next) => {
  try {
    await dbRun('DELETE FROM proofs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Proof deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ---- Admin: FAQs ----------------------------------------------------------
app.post('/api/admin/faqs', async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    const result = await dbRun('INSERT INTO faqs (question, answer) VALUES (?, ?)', [question, answer]);
    res.json({ id: result.lastID, message: 'FAQ created successfully' });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/admin/faqs/:id', async (req, res, next) => {
  try {
    await dbRun('DELETE FROM faqs WHERE id = ?', [req.params.id]);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ---- Admin: Settings ------------------------------------------------------
app.post('/api/admin/settings', async (req, res, next) => {
  try {
    const { key, value } = req.body;
    await dbRun(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [key, value]
    );
    res.json({ message: 'Setting updated successfully' });
  } catch (err) {
    next(err);
  }
});

// ---- Admin: Seed endpoint (import reviews from frontend) ------------------

app.post('/api/admin/seed', (req, res, next) => {
  const { reviews } = req.body;
  if (!reviews || !Array.isArray(reviews)) {
    return res.status(400).json({ error: 'Invalid payload – expected { reviews: [...] }' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare(
      "INSERT INTO reviews (type, name, text, stars, status) VALUES (?, ?, ?, ?, 'approved')"
    );
    reviews.forEach((r) => {
      stmt.run(r.type, r.name, r.text, r.stars);
    });
    stmt.finalize();
    db.run('COMMIT', (err) => {
      if (err) return next(err);
      res.json({ message: `Successfully imported ${reviews.length} reviews` });
    });
  });
});

// ===========================================================================
//  Error-handling middleware (must be registered LAST)
// ===========================================================================
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ===========================================================================
//  Start server
// ===========================================================================
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Keep the process alive
setInterval(() => {}, 1 << 30);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
