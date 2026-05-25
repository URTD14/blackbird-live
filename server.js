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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
