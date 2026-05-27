const { getEmails } = require('./_db');

const LOGIN_PAGE = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Login</title><style>body{background:#F5ECD7;color:#2C2C2A;font-family:Georgia,"Times New Roman",serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}form{text-align:center}label{font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.45;display:block;margin-bottom:8px}input{padding:12px 16px;border:1px solid rgba(44,44,42,0.3);border-radius:8px;background:rgba(44,44,42,0.05);font-family:inherit;font-size:15px;color:#2C2C2A;outline:none;width:260px;margin-bottom:12px}input:focus{border-color:#B04A1C}button{padding:12px 24px;background:#2C2C2A;color:#F5ECD7;border:none;border-radius:8px;font-family:inherit;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}.error{color:#B04A1C;font-size:13px;margin-top:8px}</style></head><body><form method="get"><label>Admin Key</label><input type="password" name="key" placeholder="Enter admin key" autofocus/><button type="submit">Access</button></form></body></html>';

module.exports = async (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(401).send(LOGIN_PAGE);
  }

  try {
    const rows = await getEmails();
    const tableRows = rows.map(r =>
      `<tr><td>${r.id}</td><td>${r.email}</td><td>${r.created_at}</td></tr>`
    ).join('');

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Waitlist Admin</title><style>body{background:#F5ECD7;color:#2C2C2A;font-family:Georgia,'Times New Roman',serif;padding:40px 24px;max-width:700px;margin:0 auto}.header{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:24px}h1{font-size:28px;font-weight:700;margin:0}.count{font-size:13px;opacity:0.6}.btn-download{display:inline-block;padding:8px 16px;background:#2C2C2A;color:#F5ECD7;border-radius:6px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none}table{width:100%;border-collapse:collapse;background:rgba(44,44,42,0.06);border-radius:12px;overflow:hidden}th,td{padding:12px 16px;text-align:left;font-size:13px}th{font-size:10px;text-transform:uppercase;letter-spacing:2px;opacity:0.45;font-weight:400;border-bottom:1px solid rgba(44,44,42,0.15)}td{border-bottom:1px solid rgba(44,44,42,0.06)}tr:last-child td{border-bottom:none}.empty{font-size:15px;opacity:0.5;text-align:center;padding:40px}a{color:#B04A1C;font-size:13px;text-decoration:none;display:inline-block;margin-top:24px}a:hover{text-decoration:underline}</style></head><body><div class="header"><div><h1>Waitlist</h1><div class="count">${rows.length} email${rows.length !== 1 ? 's' : ''}</div></div><a class="btn-download" href="/admin/export?key=${process.env.ADMIN_KEY}">Download CSV</a></div><table><thead><tr><th>ID</th><th>Email</th><th>Date</th></tr></thead><tbody>${tableRows || '<tr><td colspan="3" class="empty">No emails yet</td></tr>'}</tbody></table><a href="/"> Back to site</a></body></html>`);
  } catch (err) {
    console.error('Admin error:', err.message);
    res.status(500).send('Database error');
  }
};
