const { supabase } = require('../_supabase.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: return products for a vendor
  if (req.method === 'GET') {
    const { vendor_id } = req.query;
    if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
    const { data, error } = await supabase
      .from('products')
      .select('sku, supplier_sku, brand, name, model_name, live_price, best_price, live_stock')
      .eq('vendor_id', vendor_id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  // POST: bulk upsert products for a vendor
  if (req.method === 'POST') {
    const { vendor_id, products } = req.body || {};
    if (!vendor_id || !Array.isArray(products) || products.length === 0)
      return res.status(400).json({ error: 'vendor_id and products array required' });

    const rows = products.map(p => ({
      sku: (p.sku || '').toString().trim(),
      supplier_sku: (p.supplier_sku || '').toString().trim(),
      brand: (p.brand || '').toString().trim(),
      name: (p.model_name || p.name || '').toString().trim(),
      model_name: (p.model_name || p.name || '').toString().trim(),
      category: (p.category || 'General').toString().trim(),
      best_price: parseFloat(p.price_before || p.best_price || 0) || 0,
      live_price: parseFloat(p.price_after || p.live_price || 0) || 0,
      live_stock: parseInt(p.live_stock || p.stock || 0) || 0,
      vendor_id,
      updated_at: new Date().toISOString()
    })).filter(r => r.sku);

    const { data, error } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'sku' })
      .select('sku');

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, count: data?.length || rows.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
