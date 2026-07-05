import { supabase } from './_supabase.js';

const CATALOG = {
  "123456EG": { livePrice: 45000, bestPrice: 41500, priceBeforeDiscount: 48000, stock: 120, minMargin: 40000, category: "Phones" },
  "789012EG": { livePrice: 12000, bestPrice: 10900, priceBeforeDiscount: 14000, stock: 45, minMargin: 10500, category: "Phones accessories" },
  "456789EG": { livePrice: 5500, bestPrice: 4800, priceBeforeDiscount: 7000, stock: 200, minMargin: 4500, category: "Fashion" }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sku, newPrice, newStock, campaignId } = req.body;
  if (!sku || !newPrice || !newStock || !campaignId) return res.status(400).json({ valid: false, error: 'Missing required fields' });

  const { data: campaign } = await supabase.from('campaigns_v2').select('rules').eq('id', campaignId).single();
  const rules = campaign?.rules || { minDiscount: 5, maxDiscount: 80, eligibleCategories: ['Electronics', 'Fashion', 'Home', 'Appliances'] };
  const product = CATALOG[sku] || { livePrice: 10000, bestPrice: 8900, priceBeforeDiscount: 12000, stock: 100, minMargin: 5000, category: rules.eligibleCategories[0] || 'Electronics' };

  const price = parseFloat(newPrice);
  const stock = parseInt(newStock);
  const errors = [];

  if (isNaN(price)) { errors.push('Invalid price format'); }
  else if (price >= product.livePrice) { errors.push('Promo price must be lower than current live price'); }
  else {
    const livePriceDiscount = ((product.livePrice - price) / product.livePrice) * 100;
    if (livePriceDiscount <= 2) errors.push(`Must be at least 3% lower than live price (currently ${livePriceDiscount.toFixed(1)}%)`);
    const discountPct = ((product.priceBeforeDiscount - price) / product.priceBeforeDiscount) * 100;
    if (discountPct < rules.minDiscount) errors.push(`Discount ${discountPct.toFixed(1)}% is below minimum ${rules.minDiscount}%`);
    if (discountPct > rules.maxDiscount) errors.push(`Discount ${discountPct.toFixed(1)}% exceeds maximum ${rules.maxDiscount}%`);
    if (price < product.minMargin) errors.push('Price is below minimum allowed margin');
  }

  if (isNaN(stock) || stock < 5) errors.push('Promo stock must be at least 5 units');
  if (!isNaN(stock) && stock > product.stock) errors.push(`Stock cannot exceed warehouse stock (${product.stock})`);
  if (!rules.eligibleCategories.includes(product.category)) errors.push(`Category '${product.category}' is not eligible for this campaign`);

  if (errors.length > 0) return res.json({ valid: false, error: errors.join(' AND '), errors });
  const finalDiscount = ((product.priceBeforeDiscount - price) / product.priceBeforeDiscount) * 100;
  return res.json({ valid: true, discountPercent: finalDiscount.toFixed(2), savings: (product.priceBeforeDiscount - price).toFixed(2), message: 'Valid campaign price. Ready for submission.' });
