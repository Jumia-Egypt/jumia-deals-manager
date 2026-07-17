'use strict';
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rredzebycviyqakevzdl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZWR6ZWJ5Y3ZpeXFha2V2emRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjk2MzAsImV4cCI6MjA5ODg0NTYzMH0.b7quMoIeurfY_B5Rl3o85RrbFbLUBGsaNZLhJMdiREQ'
);

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = req.query || {};
  const body = req.body || {};

  if (req.method === 'GET') {
    const { vendor_id } = q;
    if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
    const { data, error } = await supabase
      .from('vendor_models_gis')
      .select('*')
      .eq('vendor_id', vendor_id)
      .order('date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  if (req.method === 'POST') {
    const { vendor_id, rows } = body;
    if (!vendor_id || !rows || !rows.length)
      return res.status(400).json({ error: 'vendor_id and rows required' });
    const records = rows.map(r => ({
      vendor_id,
      date: r.date,
      model_name: r.model_name,
      gmv: r.gmv || 0,
      gross_orders: r.gross_orders || 0,
      gross_items: r.gross_items || 0,
    })).filter(r => r.date && r.model_name);
    if (!records.length) return res.status(400).json({ error: 'No valid rows' });
    const { error } = await supabase
      .from('vendor_models_gis')
      .upsert(records, { onConflict: 'vendor_id,date,model_name' });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, count: records.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
