const { supabase } = require('../_supabase.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, password, target_gmv, created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  if (req.method === 'POST') {
    const { name, email, password, role, target_gmv } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    const normalizedEmail = email.toLowerCase().trim();
    const { data: existing } = await supabase.from('users').select('id').ilike('email', normalizedEmail).maybeSingle();
    if (existing) return res.status(409).json({ error: 'A user with this email already exists' });
    const { data, error } = await supabase
      .from('users')
      .insert([{ name: name.trim(), email: normalizedEmail, password, role: (role || 'VENDOR').toUpperCase(), target_gmv: target_gmv || 200000 }])
      .select('id, name, email, role, password, target_gmv, created_at')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
