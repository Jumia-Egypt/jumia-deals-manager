const { supabase } = require('../_supabase.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/products?vendor_id=xxx
  if (req.method === 'GET') {
    const { vendor_id } = req.query;
    if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
    const { data, error } = await supabase
      .from('products')
      .select('sku, supplier_sku, brand, name, category, live_stock, live_price, best_price, vendor_id')
      .eq('vendor_id', vendor_id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    // Return name as model_name so the frontend works without changes
    return res.json((data || []).map(r => ({ ...r, model_name: r.name })));
  }

  // POST /api/products  { products: [...] }
  if (req.method === 'POST') {
    const { products } = req.body || {};
    if (!products || !Array.isArray(products) || products.length === 0)
      return res.status(400).json({ error: 'products array required' });

    const rows = products.map(p => ({
      sku:          String(p.sku).trim(),
      supplier_sku: p.supplier_sku || null,
      brand:        p.brand        || null,
      name:         p.model_name   || p.name || null,
      category:     p.category     || null,
      live_price:   parseFloat(p.price_after)  || null,
      best_price:   parseFloat(p.price_before) || null,
      live_stock:   parseInt(p.live_stock)     || 0,
      vendor_id:    p.vendor_id,
    })).filter(r => r.sku);

    const { error } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'sku' });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, count: rows.length });
  }

  // DELETE /api/products?vendor_id=xxx
  if (req.method === 'DELETE') {
    const { vendor_id } = req.query;
    if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('vendor_id', vendor_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
