const { supabase } = require('../_supabase.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { sku } = req.query;
  if (!sku) return res.status(400).json({ error: 'SKU required' });

  try {
    // 1. Try Supabase products table first (instant, no rate limiting)
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .maybeSingle();

    if (product) {
      return res.json({
        sku: product.sku,
        name: product.name || sku,
        brand: product.brand || '',
        category: product.category || '',
        livePrice: product.livePrice || product.live_price || 0,
        bestPrice: product.bestPrice || product.best_price || 0,
        image: product.imageUrl || product.image_url || ''
      });
    }

    // 2. Fetch from Jumia server-side with full browser headers
    const jumiaUrl = 'https://www.jumia.com.eg/catalog/?q=' + encodeURIComponent(sku);
    const jumiaRes = await fetch(jumiaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!jumiaRes.ok) {
      return res.status(jumiaRes.status).json({ error: 'Jumia returned ' + jumiaRes.status });
    }

    const html = await jumiaRes.text();

    // Parse product from Jumia catalog HTML
    const skuRe = new RegExp('data-sku="' + sku + '"[\\s\\S]{0,3000}?</article>', 'i');
    const skuMatch = html.match(skuRe);
    const articleHtml = skuMatch ? skuMatch[0] : html;

    const nameMatch = articleHtml.match(/class="name"[^>]*>([^<]+)/i);
    const priceMatch = articleHtml.match(/prc">([^<]+)/i);
    const oldPriceMatch = articleHtml.match(/old">([^<]+)/i);
    const brandMatch = articleHtml.match(/data-brand="([^"]+)"/i);
    const categoryMatch = articleHtml.match(/data-category="([^"]+)"/i);
    const imageMatch = articleHtml.match(/data-src="([^"]+)"/i);

    const parsePrice = (str) => {
      if (!str) return 0;
      return parseFloat(str.replace(/[^\d.]/g, '')) || 0;
    };

    const livePrice = parsePrice(priceMatch && priceMatch[1]);
    const rawBest = parsePrice(oldPriceMatch && oldPriceMatch[1]);
    const bestPrice = rawBest > livePrice ? rawBest : livePrice;

    return res.json({
      sku,
      name: (nameMatch && nameMatch[1] && nameMatch[1].trim()) || sku,
      brand: (brandMatch && brandMatch[1] && brandMatch[1].trim()) || '',
      category: (categoryMatch && categoryMatch[1] && categoryMatch[1].trim()) || 'General',
      livePrice,
      bestPrice,
      image: (imageMatch && imageMatch[1]) || ''
    });

  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch product: ' + err.message });
  }
};
