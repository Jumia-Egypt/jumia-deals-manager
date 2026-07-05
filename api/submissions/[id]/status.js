const { supabase } = require('../../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  // Fetch existing submission
  const { data: existing, error: fetchErr } = await supabase
    .from('submissions_v2')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !existing) return res.status(404).json({ error: 'Submission not found' });

  // Cascade status to all products
  const updatedProducts = (existing.products || []).map(p => ({ ...p, status }));

  const { data, error } = await supabase
    .from('submissions_v2')
    .update({ status, products: updatedProducts })
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
