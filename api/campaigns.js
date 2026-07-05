const { supabase } = require('./_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/campaigns — list all campaigns
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('campaigns_v2')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  }

  // POST /api/campaigns — create new campaign
  if (req.method === 'POST') {
    const { name, startDate, endDate, rules, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Campaign name is required' });

    const { data, error } = await supabase
      .from('campaigns_v2')
      .insert({
        name,
        start_date: startDate || null,
        end_date: endDate || null,
        rules: rules || { minDiscount: 5, maxDiscount: 80, eligibleCategories: ['Electronics', 'Fashion', 'Home', 'Appliances'] },
        status: status || 'Active'
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
