const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      ...options.headers,
    },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

async function insertEmail(email) {
  const { status, data } = await supabaseFetch('/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (status === 201) return { success: true, message: "You're on the list. We'll be in touch." };
  if (status === 409) return { success: true, message: 'You are already on the waitlist!' };
  throw new Error(typeof data === 'string' ? data : (data?.message || 'Insert failed'));
}

async function getEmails() {
  const { status, data } = await supabaseFetch('/waitlist?order=created_at.desc');
  if (!Array.isArray(data)) throw new Error('Failed to fetch emails');
  return data;
}

module.exports = { insertEmail, getEmails };
