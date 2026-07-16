'use strict';
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabase = createClient(
  'https://rredzebycviyqakevzdl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZWR6ZWJ5Y3ZpeXFha2V2emRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjk2MzAsImV4cCI6MjA5ODg0NTYzMH0.b7quMoIeurfy_B5Rl3o85RrbFbLUBGsaNZLhJMdiREQ'
);

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Parse URL path into parts array, stripping /api/ prefix
function parsePath(url) {
  const path = (url || '').split('?')[0];
  const stripped = path.replace(/^\/api\/?/, '');
  return stripped.split('/').filter(Boolean);
}

const mapCampaign = (c) => ({
  id: c.id, name: c.name, type: c.type || '',
  startDate: c.start_date, endDate: c.end_date,
  status: c.status, rules: c.rules || {}, createdAt: c.created_at,
});

const mapSubmission = (s) => ({
  id: s.id, campaignId: s.campaign_id, campaignName: s.campaign_name,
  vendorId: s.vendor_id, vendorName: s.vendor_name,
  timestamp: s.submitted_at, status: s.status, products: s.products || [],
});

const CATALOG = {
  "123456EG": { name: "Samsung Galaxy S24 Ultra 256GB - Titanium Black", brand: "Samsung", category: "Phones", livePrice: 45000, bestPrice: 41500 },
  "789012EG": { name: "Apple AirPods Pro (2nd generation)", brand: "Apple", category: "Phones accessories", livePrice: 12000, bestPrice: 10900 },
  "456789EG": { name: "Nike Air Max 270 - Men's Sneaker", brand: "Nike", category: "Fashion", livePrice: 5500, bestPrice: 4800 },
};

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = parsePath(req.url);
  const q = req.query || {};
  const body = req.body || {};

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  if (parts[0] === 'auth' && parts[1] === 'login') {
    const { email, password } = body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const { data, error } = await supabase.from('users')
      .select('id,name,email,role,password')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (error || !data) return res.status(401).json({ error: 'Invalid email or password' });
    if (data.password !== password) return res.status(401).json({ error: 'Invalid email or password' });
    return res.json({ id: data.id, name: data.name, email: data.email, role: data.role.toLowerCase(), vendorId: data.id });
  }

  // ── /api/campaigns ────────────────────────────────────────────────────────
  if (parts[0] === 'campaigns' && !parts[1]) {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('campaigns_v2').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json((data || []).map(mapCampaign));
    }
    if (req.method === 'POST') {
      const { name, startDate, endDate, rules, status } = body;
      if (!name) return res.status(400).json({ error: 'Campaign name is required' });
      const { data, error } = await supabase.from('campaigns_v2').insert({
        name, start_date: startDate || null, end_date: endDate || null,
        rules: rules || { minDiscount: 5, maxDiscount: 80, eligibleCategories: ['Electronics', 'Fashion', 'Home', 'Appliances'] },
        status: status || 'Active',
      }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(mapCampaign(data));
    }
  }

  // ── /api/campaigns/:id ────────────────────────────────────────────────────
  if (parts[0] === 'campaigns' && parts[1] && !parts[2]) {
    const id = parts[1];
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('campaigns_v2').select('*').eq('id', id).single();
      if (error) return res.status(404).json({ error: 'Campaign not found' });
      return res.json(mapCampaign(data));
    }
    if (req.method === 'PUT') {
      const updates = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.startDate !== undefined) updates.start_date = body.startDate;
      if (body.endDate !== undefined) updates.end_date = body.endDate;
      if (body.rules !== undefined) updates.rules = body.rules;
      if (body.status !== undefined) updates.status = body.status;
      const { data, error } = await supabase.from('campaigns_v2').update(updates).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(mapCampaign(data));
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('campaigns_v2').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
  }

  // ── /api/performance ──────────────────────────────────────────────────────
  if (parts[0] === 'performance' && !parts[1]) {
    if (req.method === 'GET') {
      const { vendor_id } = q;
      if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
      const { data, error } = await supabase.from('vendor_performance')
        .select('date,gmv,gross_orders,gross_items,models_data')
        .eq('vendor_id', vendor_id).order('date', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data || []);
    }
    if (req.method === 'POST') {
      const { vendor_id, rows } = body;
      if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
      if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'rows array required' });
      const records = rows.map(r => ({
        vendor_id, date: r.date,
        gmv: parseFloat(r.gmv) || 0,
        gross_orders: parseInt(r.gross_orders) || 0,
        gross_items: parseInt(r.gross_items) || 0,
        models_data: Array.isArray(r.models_data) ? r.models_data : [],
      })).filter(r => r.date);
      if (records.length === 0) return res.status(400).json({ error: 'No valid rows after filtering' });
      const { error } = await supabase.from('vendor_performance').upsert(records, { onConflict: 'vendor_id,date' });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, count: records.length });
    }
    if (req.method === 'DELETE') {
      const { vendor_id } = q;
      if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
      const { error } = await supabase.from('vendor_performance').delete().eq('vendor_id', vendor_id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
  }

  // ── /api/products (no SKU) — list / save / delete by vendor_id ───────────
  if (parts[0] === 'products' && !parts[1]) {
    if (req.method === 'GET') {
      const { vendor_id } = q;
      let query = supabase.from('products')
        .select('sku, name, supplier_sku, brand, live_price, best_price, live_stock');
      if (vendor_id) query = query.eq('vendor_id', vendor_id);
      query = query.order('sku', { ascending: true });
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.json((data || []).map(p => ({
        sku:          p.sku,
        supplier_sku: p.supplier_sku || '',
        brand:        p.brand || '',
        model_name:   p.name || '',
        price_before: parseFloat(p.best_price)  || 0,
        price_after:  parseFloat(p.live_price)  || 0,
        live_stock:   parseInt(p.live_stock)    || 0,
      })));
    }
    if (req.method === 'POST') {
      const { products: items } = body;
      if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: 'products array required' });
      const records = items.map(r => ({
        sku:          r.sku,
        vendor_id:    r.vendor_id,
        name:         r.model_name || '',
        supplier_sku: r.supplier_sku || '',
        brand:        r.brand || '',
        best_price:   parseFloat(r.price_before) || 0,
        live_price:   parseFloat(r.price_after)  || 0,
        live_stock:   parseInt(r.live_stock)     || 0,
      })).filter(r => r.sku && r.vendor_id);
      if (records.length === 0)
        return res.status(400).json({ error: 'No valid product rows (sku + vendor_id required)' });
      const { error } = await supabase.from('products')
        .upsert(records, { onConflict: 'sku' });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, count: records.length });
    }
    if (req.method === 'DELETE') {
      const { vendor_id } = q;
      if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
      const { error } = await supabase.from('products').delete().eq('vendor_id', vendor_id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
  }

  // ── GET /api/products/:sku ────────────────────────────────────────────────
  if (parts[0] === 'products' && parts[1] && !parts[2]) {
    const sku = decodeURIComponent(parts[1]);
    const { data, error } = await supabase.from('products')
      .select('sku,name,brand,category,image_url,live_price,best_price')
      .eq('sku', sku).single();
    if (error || !data)
      return res.status(404).json({ error: 'SKU not found. Please contact your admin to add this product to the catalog.' });
    return res.json({
      sku: data.sku, name: data.name, brand: data.brand, category: data.category,
      image: data.image_url, livePrice: parseFloat(data.live_price), bestPrice: parseFloat(data.best_price),
    });
  }

  // ── PUT /api/submissions/:id/products/:sku/status ─────────────────────────
  if (parts[0] === 'submissions' && parts[1] && parts[2] === 'products' && parts[3] && parts[4] === 'status') {
    const id = parts[1], sku = decodeURIComponent(parts[3]);
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
    const { status } = body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const { data: existing, error: fetchErr } = await supabase.from('submissions_v2').select('*').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ error: 'Submission not found' });
    const products = existing.products || [];
    const idx = products.findIndex(p => p.sku === sku);
    if (idx === -1) return res.status(404).json({ error: 'SKU not found in submission' });
    products[idx] = { ...products[idx], status };
    const total = products.length;
    const approved = products.filter(p => p.status === 'Approved').length;
    const rejected = products.filter(p => p.status === 'Rejected').length;
    const pending  = products.filter(p => p.status === 'Pending').length;
    const newStatus = pending > 0 ? 'Pending' : approved === total ? 'Approved' : rejected === total ? 'Rejected' : 'Partially Approved';
    const { data, error } = await supabase.from('submissions_v2').update({ status: newStatus, products }).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, submission: mapSubmission(data) });
  }

  // ── PUT /api/submissions/:id/status ───────────────────────────────────────
  if (parts[0] === 'submissions' && parts[1] && parts[2] === 'status' && !parts[3]) {
    const id = parts[1];
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
    const { status } = body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const { data: existing, error: fetchErr } = await supabase.from('submissions_v2').select('*').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ error: 'Submission not found' });
    const updatedProducts = (existing.products || []).map(p => ({ ...p, status }));
    const { data, error } = await supabase.from('submissions_v2').update({ status, products: updatedProducts }).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, submission: mapSubmission(data) });
  }

  // ── GET/DELETE /api/submissions/:id ───────────────────────────────────────
  if (parts[0] === 'submissions' && parts[1] && !parts[2]) {
    const id = parts[1];
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('submissions_v2').select('*').eq('id', id).single();
      if (error) return res.status(404).json({ error: 'Submission not found' });
      return res.json(mapSubmission(data));
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('submissions_v2').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
  }

  // ── /api/submissions ──────────────────────────────────────────────────────
  if (parts[0] === 'submissions' && !parts[1]) {
    if (req.method === 'GET') {
      let query = supabase.from('submissions_v2').select('*').order('submitted_at', { ascending: false });
      if (q.vendorId) query = query.eq('vendor_id', q.vendorId);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.json((data || []).map(mapSubmission));
    }
    if (req.method === 'POST') {
      const { campaignId, products: submittedProducts, vendorId, vendorName } = body;
      if (!campaignId || !submittedProducts || submittedProducts.length === 0)
        return res.status(400).json({ success: false, error: 'Invalid submission data' });
      const { data: camp } = await supabase.from('campaigns_v2').select('name').eq('id', campaignId).single();
      const campaignName = camp?.name || 'Active Campaign';
      const submissionId = `SUB-${randomUUID().slice(0, 8).toUpperCase()}`;
      const enrichedProducts = submittedProducts.map(p => {
        const cat = CATALOG[p.sku] || { name: 'Mobile Phone', brand: 'Generic', category: 'Phones', livePrice: 10000, bestPrice: 8900 };
        return { sku: p.sku, name: cat.name, category: cat.category, brand: cat.brand, livePrice: cat.livePrice, bestPrice: cat.bestPrice, promoPrice: parseFloat(p.price), promoStock: parseInt(p.stock), status: 'Pending' };
      });
      const { error } = await supabase.from('submissions_v2').insert({
        id: submissionId, campaign_id: campaignId, campaign_name: campaignName,
        vendor_id: vendorId || '884920', vendor_name: vendorName || 'Vendor',
        status: 'Pending', products: enrichedProducts,
      });
      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.json({ success: true, submissionId, timestamp: new Date().toISOString(), message: 'Prices submitted successfully!' });
    }
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('submissions_v2').delete().neq('id', 'no-match');
      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.json({ success: true, message: 'All submissions deleted' });
    }
  }

  // ── POST /api/validate-price ──────────────────────────────────────────────
  if (parts[0] === 'validate-price') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { sku, newPrice, newStock, campaignId } = body;
    if (!sku || !newPrice || !newStock || !campaignId)
      return res.status(400).json({ valid: false, error: 'Missing required fields' });
    const { data: campaign } = await supabase.from('campaigns_v2').select('rules').eq('id', campaignId).single();
    const rules = campaign?.rules || { minDiscount: 5, maxDiscount: 80, eligibleCategories: ['Electronics', 'Fashion', 'Home', 'Appliances'] };
    const VALIDATE_CATALOG = {
      "123456EG": { livePrice: 45000, bestPrice: 41500, priceBeforeDiscount: 48000, stock: 120, minMargin: 40000, category: "Phones" },
      "789012EG": { livePrice: 12000, bestPrice: 10900, priceBeforeDiscount: 14000, stock: 45, minMargin: 10500, category: "Phones accessories" },
      "456789EG": { livePrice: 5500, bestPrice: 4800, priceBeforeDiscount: 7000, stock: 200, minMargin: 4500, category: "Fashion" },
    };
    const product = VALIDATE_CATALOG[sku] || { livePrice: 10000, bestPrice: 8900, priceBeforeDiscount: 12000, stock: 100, minMargin: 5000, category: rules.eligibleCategories[0] || 'Phones' };
    const price = parseFloat(newPrice), stock = parseInt(newStock), errors = [];
    if (isNaN(price)) { errors.push('Invalid price format'); }
    else if (price >= product.livePrice) { errors.push('Promo price must be lower than current live price'); }
    else {
      const livePriceDiscount = ((product.livePrice - price) / product.livePrice) * 100;
      if (livePriceDiscount <= 2) errors.push(`Must be at least 3% lower than live price (${livePriceDiscount.toFixed(1)}%)`);
      const discountPct = ((product.priceBeforeDiscount - price) / product.priceBeforeDiscount) * 100;
      if (discountPct < rules.minDiscount) errors.push(`Discount ${discountPct.toFixed(1)}% below minimum ${rules.minDiscount}%`);
      if (discountPct > rules.maxDiscount) errors.push(`Discount ${discountPct.toFixed(1)}% exceeds maximum ${rules.maxDiscount}%`);
      if (price < product.minMargin) errors.push('Price is below minimum allowed margin');
    }
    if (isNaN(stock) || stock < 5) errors.push('Promo stock must be at least 5 units');
    if (!isNaN(stock) && stock > product.stock) errors.push(`Stock cannot exceed warehouse stock (${product.stock})`);
    if (!rules.eligibleCategories.includes(product.category)) errors.push(`Category '${product.category}' is not eligible`);
    if (errors.length > 0) return res.json({ valid: false, error: errors.join(' AND '), errors });
    const finalDiscount = ((product.priceBeforeDiscount - price) / product.priceBeforeDiscount) * 100;
    return res.json({ valid: true, discountPercent: finalDiscount.toFixed(2), savings: (product.priceBeforeDiscount - price).toFixed(2), message: 'Valid campaign price. Ready for submission.' });
  }

  // ── /api/vendors ──────────────────────────────────────────────────────────
  if (parts[0] === 'vendors') {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('users')
        .select('id,name,email,role,created_at').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data || []);
    }
    if (req.method === 'POST') {
      const { name, email, password, role } = body;
      if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
      const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase().trim()).maybeSingle();
      if (existing) return res.status(409).json({ error: 'A user with this email already exists' });
      const { data, error } = await supabase.from('users').insert([{
        name: name.trim(), email: email.toLowerCase().trim(), password,
        role: (role || 'VENDOR').toUpperCase(),
      }]).select('id,name,email,role,created_at').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id } = q;
      if (!id) return res.status(400).json({ error: 'ID required' });
      const updates = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.email !== undefined) updates.email = body.email.toLowerCase().trim();
      if (body.password !== undefined) updates.password = body.password;
      const { data, error } = await supabase.from('users').update(updates).eq('id', id).select('id,name,email,role,created_at').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = q;
      if (!id) return res.status(400).json({ error: 'ID required' });
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
