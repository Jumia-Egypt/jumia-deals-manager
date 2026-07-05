const { supabase } = require('../../../../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const { id, sku } = req.query;
  const { status } = req.body; // 'Approved' | 'Rejected' | 'Pending'

  if (!status) return res.status(400).json({ error: 'Status is required' });

  // Fetch existing submission
  const { data: existing, error: fetchErr } = await supabase
    .from('submissions_v2')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !existing) return res.status(404).json({ error: 'Submission not found' });

  const products = existing.products || [];
  const productIndex = products.findIndex(p => p.sku === sku);
  if (productIndex === -1) return res.status(404).json({ error: 'SKU not found in submission' });

  // Update the specific product's status
  products[productIndex] = { ...products[productIndex], status };

  // Recalculate overall submission status
  const total = products.length;
  const approved = products.filter(p => p.status === 'Approved').length;
  const rejected = products.filter(p => p.status === 'Rejected').length;
  const pending = products.filter(p => p.status === 'Pending').length;

  let newStatus;
  if (pending > 0) {
    newStatus = 'Pending';
  } else if (approved === total) {
    newStatus = 'Approved';
  } else if (rejected === total) {
    newStatus = 'Rejected';
  } else {
    newStatus = 'Partially Approved'; // Mix of approved + rejected
  }

  const { data, error } = await supabase
    .from('submissions_v2')
    .update({ status: newStatus, products })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    success: true,
    submission: {
      id: data.id,
      campaignId: data.campaign_id,
      campaignName: data.campaign_name,
      vendorId: data.vendor_id,
      vendorName: data.vendor_name,
      timestamp: data.submitted_at,
      status: data.status,
      products: data.products || []
    }
  });
};
