const CATALOG = {
  "123456EG": { sku: "123456EG", name: "Samsung Galaxy S24 Ultra 256GB - Titanium Black", brand: "Samsung", category: "Electronics", sellerSku: "SAM-S24U-256", image: "https://images.unsplash.com/photo-1707227155609-0820bb291a26?w=400&q=80", livePrice: 45000, bestPrice: 41500, priceBeforeDiscount: 48000, currentDiscount: 6.25, stock: 120, minMargin: 40000 },
  "789012EG": { sku: "789012EG", name: "Apple AirPods Pro (2nd generation)", brand: "Apple", category: "Electronics", sellerSku: "APP-AIR-PRO2", image: "https://images.unsplash.com/photo-1606220588913-b3aecb4b277c?w=400&q=80", livePrice: 12000, bestPrice: 10900, priceBeforeDiscount: 14000, currentDiscount: 14.28, stock: 45, minMargin: 10500 },
  "456789EG": { sku: "456789EG", name: "Nike Air Max 270 - Men's Sneaker", brand: "Nike", category: "Fashion", sellerSku: "NK-AM270-M-42", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", livePrice: 5500, bestPrice: 4800, priceBeforeDiscount: 7000, currentDiscount: 21.4, stock: 200, minMargin: 4500 }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { sku } = req.query;
  const product = CATALOG[sku] || { sku, name: "Mobile Phone", brand: "Generic", category: "Phones", sellerSku: "GEN-MOB-PHN", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", livePrice: 10000, bestPrice: 8900, priceBeforeDiscount: 12000, currentDiscount: 16.67, stock: 100, minMargin: 5000 };
  return res.json(product);
}
