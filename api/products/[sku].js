const { supabase } = require('../_supabase.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { sku } = req.query;
  if (!sku) return res.status(400).json({ error: 'SKU is required' });

  const { data, error } = await supabase
    .from('products')
    .select('sku, name, model_name, brand, category, live_price, best_price, image_url, live_stock, supplier_sku')
    .eq('sku', sku.trim().toUpperCase())
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'SKU not found in catalog' });

  return res.json({
    sku: data.sku,
    name: data.model_name || data.name || data.sku,
    brand: data.brand || '',
    category: data.category || 'General',
    livePrice: parseFloat(data.live_price) || 0,
    bestPrice: parseFloat(data.best_price) || 0,
    image: data.image_url || '',
    liveStock: parseInt(data.live_stock) || 0,
    supplierSku: data.supplier_sku || ''
  });
};
