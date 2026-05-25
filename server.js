const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());

app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

pool.query(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`).catch(err => console.error('DB init error:', err.message));

app.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    await pool.query('INSERT INTO waitlist (email) VALUES ($1)', [email]);
    res.json({ success: true, message: "You're on the list. We'll be in touch." });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(200).json({ success: true, message: 'You are already on the waitlist!' });
    }
    console.error('Insert error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.get('/admin/export', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM waitlist ORDER BY created_at DESC');
    const header = 'id,email,created_at';
    const rows = result.rows.map(r => `${r.id},${r.email},${r.created_at}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
    res.send(`${header}\n${rows}\n`);
  } catch (err) {
    res.status(500).send('Database error');
  }
});

app.get('/admin', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM waitlist ORDER BY created_at DESC');
    const rows = result.rows.map(r => `<tr><td>${r.id}</td><td>${r.email}</td><td>${r.created_at}</td></tr>`).join('');
    res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Waitlist Admin</title><style>body{background:#F5ECD7;color:#2C2C2A;font-family:Georgia,'Times New Roman',serif;padding:40px 24px;max-width:700px;margin:0 auto}.header{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:24px}h1{font-size:28px;font-weight:700;margin:0}.count{font-size:13px;opacity:0.6}.btn-download{display:inline-block;padding:8px 16px;background:#2C2C2A;color:#F5ECD7;border-radius:6px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none}table{width:100%;border-collapse:collapse;background:rgba(44,44,42,0.06);border-radius:12px;overflow:hidden}th,td{padding:12px 16px;text-align:left;font-size:13px}th{font-size:10px;text-transform:uppercase;letter-spacing:2px;opacity:0.45;font-weight:400;border-bottom:1px solid rgba(44,44,42,0.15)}td{border-bottom:1px solid rgba(44,44,42,0.06)}tr:last-child td{border-bottom:none}.empty{font-size:15px;opacity:0.5;text-align:center;padding:40px}a{color:#B04A1C;font-size:13px;text-decoration:none;display:inline-block;margin-top:24px}a:hover{text-decoration:underline}</style></head><body><div class="header"><div><h1>Waitlist</h1><div class="count">${result.rows.length} email${result.rows.length !== 1 ? 's' : ''}</div></div><a class="btn-download" href="/admin/export">Download CSV</a></div><table><thead><tr><th>ID</th><th>Email</th><th>Date</th></tr></thead><tbody>${rows || '<tr><td colspan="3" class="empty">No emails yet</td></tr>'}</tbody></table><a href="/">← Back to site</a></body></html>`);
  } catch (err) {
    res.status(500).send('Database error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
