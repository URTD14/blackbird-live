const { insertEmail } = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = '';
  await new Promise((resolve, reject) => {
    req.on('data', chunk => body += chunk);
    req.on('end', resolve);
    req.on('error', reject);
  });

  const { email } = JSON.parse(body || '{}');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    const result = await insertEmail(email);
    res.json(result);
  } catch (err) {
    console.error('Insert error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
