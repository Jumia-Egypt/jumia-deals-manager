import { supabase } from '../../_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('submissions_v2').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Submission not found' });
    return res.json({ id: data.id, campaignId: data.campaign_id, campaignName: data.campaign_name, vendorId: data.vendor_id, vendorName: data.vendor_name, timestamp: data.submitted_at, status: data.status, products: data.products || [] });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('submissions_v2').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
