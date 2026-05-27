const { getEmails } = require('./_db');

module.exports = async (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const rows = await getEmails();
    const header = 'id,email,created_at';
    const csvRows = rows.map(r => `${r.id},${r.email},${r.created_at}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
    res.send(`${header}\n${csvRows}\n`);
  } catch (err) {
    res.status(500).send('Database error');
  }
};
