const { supabase } = require('../_supabase.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });

  const { name, email, password, target_gmv } = req.body || {};
  const updates = {};
  if (name) updates.name = name.trim();
  if (email) updates.email = email.toLowerCase().trim();
  if (password) updates.password = password;
  if (target_gmv !== undefined) updates.target_gmv = target_gmv;

  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Nothing to update' });

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, name, email, role, password, target_gmv')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};
