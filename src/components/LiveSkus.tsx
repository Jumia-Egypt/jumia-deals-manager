import React, { useState, useEffect } from 'react';
import { Package, Search, RefreshCw } from 'lucide-react';

interface ProductRow {
  sku: string; supplier_sku: string; brand: string; model_name: string;
  price_before: number; price_after: number; live_stock: number;
}

interface LiveSkusProps { vendorId: string | null; }

export default function LiveSkus({ vendorId }: LiveSkusProps) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/products?vendor_id=' + vendorId);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data.map((p: any) => ({
        sku: p.sku, supplier_sku: p.supplier_sku || '', brand: p.brand || '',
        model_name: p.model_name || p.name || '',
        price_before: p.best_price || 0, price_after: p.live_price || 0, live_stock: p.live_stock || 0
      })) : []);
    } catch { setProducts([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [vendorId]);

  const filtered = products.filter(r =>
    !search ||
    r.sku.toLowerCase().includes(search.toLowerCase()) ||
    r.model_name.toLowerCase().includes(search.toLowerCase()) ||
    r.brand.toLowerCase().includes(search.toLowerCase()) ||
    (r.supplier_sku || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Live SKUs</h1>
        <p className="text-sm text-slate-500 mt-1">Your active product catalog as uploaded by the Jumia team.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-slate-700">{products.length} SKUs</span>
            {loading && <span className="text-xs text-slate-400 animate-pulse">Loading...</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search SKU, brand, model..."
                className="pl-8 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <button onClick={load} disabled={loading}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {filtered.length === 0 && !loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {products.length === 0 ? 'No SKUs have been uploaded for your account yet.' : 'No results match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold">
                  <th className="text-left px-4 py-3">SKU</th>
                  <th className="text-left px-4 py-3">Supplier SKU</th>
                  <th className="text-left px-4 py-3">Brand</th>
                  <th className="text-left px-4 py-3">Model Name</th>
                  <th className="text-right px-4 py-3">Price Before</th>
                  <th className="text-right px-4 py-3">Price After</th>
                  <th className="text-right px-4 py-3">Live Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{row.sku}</td>
                    <td className="px-4 py-2.5 text-slate-500">{row.supplier_sku || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.brand || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-700 max-w-[200px] truncate">{row.model_name || '—'}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">EGP {row.price_before?.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-700">EGP {row.price_after?.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{row.live_stock?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
