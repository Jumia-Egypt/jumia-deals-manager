const { supabase } = require('../_supabase.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, password')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !data) return res.status(401).json({ error: 'Invalid email or password' });
  if (data.password !== password) return res.status(401).json({ error: 'Invalid email or password' });

  return res.json({
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role.toLowerCase(),
    vendorId: data.id
  });
};