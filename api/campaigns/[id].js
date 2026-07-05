const { supabase } = require('../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  // GET /api/campaigns/:id
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('campaigns_v2')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: 'Campaign not found' });
    return res.json(data);
  }

  // PUT /api/campaigns/:id — update campaign
  if (req.method === 'PUT') {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.startDate !== undefined) updates.start_date = req.body.startDate;
    if (req.body.endDate !== undefined) updates.end_date = req.body.endDate;
    if (req.body.rules !== undefined) updates.rules = req.body.rules;
    if (req.body.status !== undefined) updates.status = req.body.status;

    const { data, error } = await supabase
      .from('campaigns_v2')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // DELETE /api/campaigns/:id
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('campaigns_v2')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
