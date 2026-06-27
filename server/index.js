require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Setup Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("FATAL ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer setup - using memory storage because we will upload to Supabase Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===========================================================================
//  PUBLIC  ENDPOINTS
// ===========================================================================

// ---- Proofs ---------------------------------------------------------------
app.get('/api/proofs', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('proofs').select('*').order('id', { ascending: false });
    if (error) throw error;
    
    // Construct full public URL for the images
    const proofsWithUrl = data.map(proof => ({
      ...proof,
      filename: proof.filename ? `${supabaseUrl}/storage/v1/object/public/proofs/${proof.filename}` : null
    }));
    
    res.json({ proofs: proofsWithUrl });
  } catch (err) {
    next(err);
  }
});

// ---- FAQs -----------------------------------------------------------------
app.get('/api/faqs', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('faqs').select('*').order('id', { ascending: true });
    if (error) throw error;
    res.json({ faqs: data });
  } catch (err) {
    next(err);
  }
});

// ---- Settings -------------------------------------------------------------
app.get('/api/settings', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    res.json({ settings: data });
  } catch (err) {
    next(err);
  }
});

// ---- Reviews --------------------------------------------------------------
app.get('/api/reviews', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reviews').select('*').eq('status', 'approved').order('id', { ascending: false });
    if (error) throw error;
    res.json({ reviews: data });
  } catch (err) {
    next(err);
  }
});

app.post('/api/reviews', async (req, res, next) => {
  try {
    const { type, name, text, stars } = req.body;
    if (!name || !text || !stars || !type) {
      return res.status(400).json({ error: 'Missing required fields: type, name, text, stars' });
    }
    const { data, error } = await supabase.from('reviews').insert([{ type, name, text, stars, status: 'pending' }]).select();
    if (error) throw error;
    res.json({ id: data[0].id, message: 'Review submitted successfully and is pending approval.' });
  } catch (err) {
    next(err);
  }
});

// ---- Suggestions ----------------------------------------------------------
app.post('/api/suggestions', async (req, res, next) => {
  try {
    const { name, text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Suggestion text is required' });
    }
    const { data, error } = await supabase.from('suggestions').insert([{ name: name || 'Anonymous', text }]).select();
    if (error) throw error;
    res.json({ id: data[0].id, message: 'Suggestion submitted successfully' });
  } catch (err) {
    next(err);
  }
});

// ---- Emails / Waitlist ----------------------------------------------------
app.post('/api/emails', async (req, res, next) => {
  try {
    const { email, name, source } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });

    const { data, error } = await supabase.from('emails').insert([{ email: email.trim().toLowerCase(), name: name || null, source: source || 'waitlist' }]).select();
    
    if (error) {
      if (error.code === '23505') { // Postgres unique constraint violation
        return res.status(409).json({ error: 'This email is already on the waitlist' });
      }
      throw error;
    }
    res.json({ id: data[0].id, message: 'Email submitted successfully' });
  } catch (err) {
    next(err);
  }
});

// ---- Analytics / Click Tracking -------------------------------------------
app.post('/api/analytics/track', async (req, res, next) => {
  try {
    const { event_type, event_target } = req.body;
    if (!event_type || !event_target) return res.status(400).json({ error: 'event_type and event_target are required' });

    const referrer = req.body.referrer || req.get('referer') || null;
    const user_agent = req.body.user_agent || req.get('user-agent') || null;

    const { data, error } = await supabase.from('analytics').insert([{ event_type, event_target, referrer, user_agent }]).select();
    if (error) throw error;
    res.json({ id: data[0].id, message: 'Event tracked' });
  } catch (err) {
    next(err);
  }
});

// ===========================================================================
//  ADMIN  ENDPOINTS
// ===========================================================================

app.get('/api/admin/reviews', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reviews').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json({ reviews: data });
  } catch (err) {
    next(err);
  }
});

app.put('/api/admin/reviews/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const { error } = await supabase.from('reviews').update({ status }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    next(err);
  }
});

app.put('/api/admin/reviews/:id/respond', async (req, res, next) => {
  try {
    const { response } = req.body;
    const { error } = await supabase.from('reviews').update({ admin_response: response }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Response added successfully' });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/admin/reviews/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/suggestions', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('suggestions').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json({ suggestions: data });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/admin/suggestions/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('suggestions').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Suggestion deleted successfully' });
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/emails', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('emails').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json({ emails: data });
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/emails/count', async (req, res, next) => {
  try {
    const { count, error } = await supabase.from('emails').select('*', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/analytics', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('analytics').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json({ events: data });
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/analytics/summary', async (req, res, next) => {
  try {
    // Note: Supabase JS doesn't have a direct GROUP BY method for raw queries like this easily without RPC.
    // For simplicity, we fetch all and group in memory, or we can use an RPC. Grouping in memory for now.
    const { data, error } = await supabase.from('analytics').select('event_target');
    if (error) throw error;
    
    const summaryMap = {};
    data.forEach(item => {
      summaryMap[item.event_target] = (summaryMap[item.event_target] || 0) + 1;
    });
    
    const summary = Object.keys(summaryMap).map(key => ({ event_target: key, count: summaryMap[key] }));
    summary.sort((a, b) => b.count - a.count);
    
    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/stats', async (req, res, next) => {
  try {
    const pReviews = supabase.from('reviews').select('*', { count: 'exact', head: true });
    const pPending = supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const pEmails = supabase.from('emails').select('*', { count: 'exact', head: true });
    const pSuggestions = supabase.from('suggestions').select('*', { count: 'exact', head: true });
    const pAnalytics = supabase.from('analytics').select('*', { count: 'exact', head: true });

    const [reviewsRes, pendingRes, emailsRes, suggRes, analyticsRes] = await Promise.all([pReviews, pPending, pEmails, pSuggestions, pAnalytics]);

    res.json({
      totalReviews: reviewsRes.count || 0,
      pendingReviews: pendingRes.count || 0,
      totalEmails: emailsRes.count || 0,
      totalSuggestions: suggRes.count || 0,
      totalClicks: analyticsRes.count || 0,
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Proofs - Upload image to Supabase Storage and save to DB
app.post('/api/admin/proofs', upload.single('image'), async (req, res, next) => {
  try {
    const { title, subtitle, badge, is_red, details } = req.body;
    const isRedBool = is_red === 'true' || is_red === true || is_red === '1' || is_red === 1;
    let filename = null;
    
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      filename = `${Date.now()}${fileExt}`;
      
      const { data, error } = await supabase.storage.from('proofs').upload(filename, req.file.buffer, {
        contentType: req.file.mimetype
      });
      
      if (error) {
        console.error("Supabase Storage Error:", error);
        return res.status(500).json({ error: 'Failed to upload image to Supabase' });
      }
    }
    
    const { data: dbData, error: dbError } = await supabase.from('proofs').insert([{
      filename, title, subtitle, badge, is_red: isRedBool, details
    }]).select();
    
    if (dbError) throw dbError;
    res.json(dbData[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/admin/proofs/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('proofs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Proof deleted successfully' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/admin/faqs', async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    const { data, error } = await supabase.from('faqs').insert([{ question, answer }]).select();
    if (error) throw error;
    res.json({ id: data[0].id, message: 'FAQ created successfully' });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/admin/faqs/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('faqs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/admin/settings', async (req, res, next) => {
  try {
    const { key, value } = req.body;
    // Check if exists first for upsert
    const { data: existing } = await supabase.from('settings').select('*').eq('key', key);
    if (existing && existing.length > 0) {
      const { error } = await supabase.from('settings').update({ value }).eq('key', key);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('settings').insert([{ key, value }]);
      if (error) throw error;
    }
    res.json({ message: 'Setting updated successfully' });
  } catch (err) {
    next(err);
  }
});

// ===========================================================================
//  Error-handling middleware (must be registered LAST)
// ===========================================================================
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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
