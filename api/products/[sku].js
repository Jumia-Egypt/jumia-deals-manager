module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { sku } = req.query;
  if (!sku) return res.status(400).json({ error: 'SKU is required' });

  try {
    const url = `https://www.jumia.com.eg/catalog/?q=${encodeURIComponent(sku)}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      }
    });

    if (!resp.ok) {
      return res.status(502).json({ error: `Jumia catalog returned ${resp.status}` });
    }

    const html = await resp.text();

    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!ldMatch) return res.status(404).json({ error: 'Product not found' });

    let imageUrl = '', livePrice = 0;
    try {
      const ld = JSON.parse(ldMatch[1]);
      const collection = (ld['@graph'] || []).find(n => n['@type'] === 'CollectionPage');
      const items = collection?.mainEntity?.itemListElement || [];
      if (items.length === 0) return res.status(404).json({ error: 'SKU not found on Jumia Egypt' });
      const item = items[0].item;
      imageUrl = (item.image || '').replace('/300x300/', '/500x500/');
      livePrice = parseFloat(item.offers?.price || '0');
    } catch (e) {
      return res.status(404).json({ error: 'Could not parse product data from Jumia' });
    }

    const nameMatch = html.match(/class="name">([^<]+)</);
    const name = nameMatch ? nameMatch[1].trim() : sku;
    const brand = name.split(' ')[0] || 'Unknown';
    const breadcrumbMatch = html.match(/"BreadcrumbList"[\s\S]*?"name":"([^"]+)","position":2/);
    const category = breadcrumbMatch ? breadcrumbMatch[1] : 'General';

    return res.json({ sku, name, brand, category, image: imageUrl, livePrice, bestPrice: livePrice });

  } catch (err) {
    console.error('[products] error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch product details from Jumia Egypt' });
  }
};