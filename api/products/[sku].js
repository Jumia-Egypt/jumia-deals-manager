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
    .select('sku, name, brand, category, image_url, live_price, best_price')
    .eq('sku', sku)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'SKU not found. Please contact your admin to add this product to the catalog.' });
  }

  return res.json({
    sku: data.sku,
    name: data.name,
    brand: data.brand,
    category: data.category,
    image: data.image_url,
    livePrice: parseFloat(data.live_price),
    bestPrice: parseFloat(data.best_price),
  });
};