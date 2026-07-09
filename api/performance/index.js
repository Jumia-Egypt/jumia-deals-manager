const { supabase } = require('../_supabase.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { vendor_id } = req.query;
    if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
    const { data, error } = await supabase
      .from('vendor_performance')
      .select('date, gmv, gross_orders, gross_items')
      .eq('vendor_id', vendor_id)
      .order('date', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  if (req.method === 'POST') {
    const { vendor_id, rows } = req.body || {};
    if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
    if (!rows || !Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ error: 'rows array required' });
    const records = rows.map(r => ({
      vendor_id,
      date:         r.date,
      gmv:          parseFloat(r.gmv)          || 0,
      gross_orders: parseInt(r.gross_orders)   || 0,
      gross_items:  parseInt(r.gross_items)    || 0,
    })).filter(r => r.date);
    if (records.length === 0)
      return res.status(400).json({ error: 'No valid rows after filtering' });
    const { error } = await supabase
      .from('vendor_performance')
      .upsert(records, { onConflict: 'vendor_id,date' });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, count: records.length });
  }

  if (req.method === 'DELETE') {
    const { vendor_id } = req.query;
    if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
    const { error } = await supabase
      .from('vendor_performance').delete().eq('vendor_id', vendor_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};