import { useState, useEffect } from 'react';
import { Package, Search, ChevronDown, Tag } from 'lucide-react';

interface Product {
  sku: string;
  supplier_sku: string;
  brand: string;
  model_name: string;
  price_before: number;
  price_after: number;
  live_stock: number;
}
interface Campaign {
  id: string;
  name: string;
  status: string;
}
interface LiveSkusProps {
  vendorId: string;
}

export default function LiveSkus({ vendorId }: LiveSkusProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
  const [assignMap, setAssignMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!vendorId) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [prodRes, campRes] = await Promise.all([
          fetch(`/api/products?vendor_id=${vendorId}`),
          fetch('/api/campaigns'),
        ]);
        if (!prodRes.ok) throw new Error('Failed to load products');
        const prodData = await prodRes.json();
        setProducts(prodData || []);
        if (campRes.ok) {
          const campData = await campRes.json();
          setCampaigns((campData || []).filter((c: Campaign) => c.status === 'Active'));
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vendorId]);

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();

  const filtered = products.filter(p => {
    const matchBrand = !brandFilter || p.brand === brandFilter;
    const matchSearch =
      !search ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.model_name?.toLowerCase().includes(search.toLowerCase());
    return matchBrand && matchSearch;
  });

  const allSelected = filtered.length > 0 && selectedSkus.size === filtered.length;

  const toggleAll = () => {
    if (allSelected) setSelectedSkus(new Set());
    else setSelectedSkus(new Set(filtered.map(p => p.sku)));
  };

  const toggleOne = (sku: string) => {
    setSelectedSkus(prev => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku); else next.add(sku);
      return next;
    });
  };

  const fmt = (n: number | null | undefined) =>
    n != null && n > 0 ? `EGP ${n.toLocaleString()}` : '—';

  const stockStyle = (qty: number): { bar: string; text: string; label: string } => {
    if (qty > 50) return { bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' };
    if (qty > 10) return { bar: 'bg-amber-400', text: 'text-amber-700', label: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' };
    return { bar: 'bg-rose-500', text: 'text-rose-700', label: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' };
  };

  return (
    <div className="p-6 space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Live SKUs</h1>
            <p className="text-xs text-gray-400 mt-0.5">Your uploaded products catalog</p>
          </div>
        </div>
        {!loading && (
          <div className="flex items-center gap-2">
            {selectedSkus.size > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold ring-1 ring-orange-200">
                <Tag className="w-3 h-3" />
                {selectedSkus.size} selected
              </span>
            )}
            <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
              {filtered.length} / {products.length} products
            </span>
          </div>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search SKU or model name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
          />
        </div>
        <div className="relative">
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer transition"
          >
            <option value="">All Brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your products…</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Package className="w-14 h-14 opacity-15" />
          <p className="text-sm font-medium">
            {products.length === 0 ? 'No products uploaded yet.' : 'No products match your filters.'}
          </p>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed min-w-[960px]">
              <colgroup>
                <col className="w-12" />
                <col className="w-28" />
                <col className="w-28" />
                <col className="w-28" />
                <col />
                <col className="w-28" />
                <col className="w-28" />
                <col className="w-20" />
                <col className="w-44" />
              </colgroup>
              <thead>
                <tr className="text-white text-xs font-semibold uppercase tracking-wider" style={{ background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)' }}>
                  <th className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded accent-white cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 text-center">SKU</th>
                  <th className="py-3.5 px-4 text-center">Supplier SKU</th>
                  <th className="py-3.5 px-4 text-center">Brand</th>
                  <th className="py-3.5 px-4 text-center">Model Name</th>
                  <th className="py-3.5 px-4 text-center">Price Before</th>
                  <th className="py-3.5 px-4 text-center">Price After</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-center">Assign Campaign</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const isSelected = selectedSkus.has(p.sku);
                  const stock = stockStyle(p.live_stock);
                  return (
                    <tr
                      key={p.sku}
                      onClick={() => toggleOne(p.sku)}
                      className={`
                        border-t border-gray-100 cursor-pointer transition-colors
                        ${isSelected
                          ? 'bg-orange-50/70'
                          : i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/40 hover:bg-gray-50'}
                      `}
                    >
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(p.sku)}
                          className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{p.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-gray-400 truncate" title={p.supplier_sku}>
                        {p.supplier_sku || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{p.brand || '—'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="block truncate text-gray-700 font-medium text-xs" title={p.model_name}>{p.model_name || '—'}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-gray-400 line-through">{fmt(p.price_before)}</td>
                      <td className="py-3 px-4 text-center text-sm font-bold text-gray-800">{fmt(p.price_after)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg text-xs font-bold ${stock.label}`}>
                          {p.live_stock ?? 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                          <select
                            value={assignMap[p.sku] || ''}
                            onChange={e => setAssignMap(prev => ({ ...prev, [p.sku]: e.target.value }))}
                            className={`
                              w-full appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border cursor-pointer
                              focus:outline-none focus:ring-2 focus:ring-orange-400 transition
                              ${assignMap[p.sku]
                                ? 'border-orange-300 bg-orange-50 text-orange-700 font-semibold'
                                : 'border-gray-200 bg-white text-gray-500'}
                            `}
                          >
                            <option value="">— Select —</option>
                            {campaigns.length === 0
                              ? <option disabled>No active campaigns</option>
                              : campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                            }
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
