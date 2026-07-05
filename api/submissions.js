const { supabase } = require('./_supabase');
const { randomUUID } = require('crypto');

const CATALOG = {
  "123456EG": { name: "Samsung Galaxy S24 Ultra 256GB - Titanium Black", brand: "Samsung", category: "Electronics", livePrice: 45000, bestPrice: 41500 },
  "789012EG": { name: "Apple AirPods Pro (2nd generation)", brand: "Apple", category: "Electronics", livePrice: 12000, bestPrice: 10900 },
  "456789EG": { name: "Nike Air Max 270 - Men's Sneaker", brand: "Nike", category: "Fashion", livePrice: 5500, bestPrice: 4800 }
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/submissions — list all (or filter by vendorId)
  if (req.method === 'GET') {
    let query = supabase.from('submissions_v2').select('*').order('submitted_at', { ascending: false });
    if (req.query.vendorId) query = query.eq('vendor_id', req.query.vendorId);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Map DB columns to frontend shape
    const result = (data || []).map(s => ({
      id: s.id,
      campaignId: s.campaign_id,
      campaignName: s.campaign_name,
      vendorId: s.vendor_id,
      vendorName: s.vendor_name,
      timestamp: s.submitted_at,
      status: s.status,
      products: s.products || []
    }));
    return res.json(result);
  }

  // POST /api/submissions — create new submission
  if (req.method === 'POST') {
    const { campaignId, products: submittedProducts, vendorId, vendorName } = req.body;
    if (!campaignId || !submittedProducts || submittedProducts.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid submission data' });
    }

    // Get campaign name
    const { data: camp } = await supabase.from('campaigns_v2').select('name').eq('id', campaignId).single();
    const campaignName = camp?.name || 'Active Campaign';

    const submissionId = `SUB-${randomUUID().slice(0, 8).toUpperCase()}`;

    // Enrich products with catalog data
    const enrichedProducts = submittedProducts.map(p => {
      const catalog = CATALOG[p.sku] || {
        name: 'Mobile Phone', brand: 'Generic', category: 'Phones',
        livePrice: 10000, bestPrice: 8900
      };
      return {
        sku: p.sku,
        name: catalog.name,
        category: catalog.category,
        brand: catalog.brand,
        livePrice: catalog.livePrice,
        bestPrice: catalog.bestPrice,
        promoPrice: parseFloat(p.price),
        promoStock: parseInt(p.stock),
        status: 'Pending'
      };
    });

    const { error } = await supabase.from('submissions_v2').insert({
      id: submissionId,
      campaign_id: campaignId,
      campaign_name: campaignName,
      vendor_id: vendorId || '884920',
      vendor_name: vendorName || 'Vendor',
      status: 'Pending',
      products: enrichedProducts
    });

    if (error) return res.status(500).json({ success: false, error: error.message });

    return res.json({
      success: true,
      submissionId,
      timestamp: new Date().toISOString(),
      message: 'Prices submitted successfully!'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
