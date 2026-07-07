import { useState, useEffect } from 'react';
import { Package, Search, SlidersHorizontal } from 'lucide-react';
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
    n != null && n > 0 ? `EGP ${n.toLocaleString()}` : '\u2014';
  const stockBadge = (qty: number) => {
    if (!qty && qty !== 0) return 'bg-gray-100 text-gray-500';
    if (qty > 50) return 'bg-green-100 text-green-700';
    if (qty > 10) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  return (
    <div className="w-full h-full bg-slate-50 p-6 flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Live SKUs</h2>
            <p className="text-xs text-slate-500">Manage your active products and campaigns</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SKU or Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-shadow"
            />
          </div>
          {/* Brand Filter */}
          <div className="relative w-full sm:w-48">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-shadow"
            >
              <option value="">All Brands</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Main Table Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-12 text-red-500 text-sm font-medium">
            Error: {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
            <Package className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm table-fixed">
              <thead>
                <tr className="bg-orange-500 text-white border-b border-orange-600">
                  <th className="py-3 px-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-orange-300 text-orange-600 focus:ring-orange-500 cursor-pointer w-4 h-4 accent-orange-600"
                    />
                  </th>
                  <th className="py-3 px-4 text-center font-semibold w-24">SKU</th>
                  <th className="py-3 px-4 text-center font-semibold w-[120px]">Supplier SKU</th>
                  <th className="py-3 px-4 text-center font-semibold w-32">Brand</th>
                  <th className="py-3 px-4 text-center font-semibold">Model Name</th>
                  <th className="py-3 px-4 text-center font-semibold w-24">Price Before</th>
                  <th className="py-3 px-4 text-center font-semibold w-24">Price After</th>
                  <th className="py-3 px-4 text-center font-semibold w-24">Stock</th>
                  <th className="py-3 px-4 text-center font-semibold w-48">Assign to Campaign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p, i) => {
                  const isSelected = selectedSkus.has(p.sku);
                  return (
                    <tr
                      key={p.sku}
                      className={`
                        transition-colors group
                        ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                        ${isSelected ? '!bg-orange-50/80 hover:!bg-orange-50' : 'hover:bg-orange-50/30'}
                      `}
                    >
                      <td className="py-3 px-4 text-center border-r border-slate-100">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(p.sku)}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer w-4 h-4 accent-orange-600"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-700 border-r border-slate-100">
                        {p.sku}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500 truncate max-w-[120px] border-r border-slate-100" title={p.supplier_sku}>
                        {p.supplier_sku || '\u2014'}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-700 font-medium border-r border-slate-100 truncate" title={p.brand}>
                        {p.brand || '\u2014'}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 border-r border-slate-100">
                        <div className="truncate max-w-[200px] mx-auto" title={p.model_name}>
                          {p.model_name || '\u2014'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 line-through text-xs border-r border-slate-100">
                        {fmt(p.price_before)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800 border-r border-slate-100">
                        {fmt(p.price_after)}
                      </td>
                      <td className="py-3 px-4 text-center border-r border-slate-100">
                        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${stockBadge(p.live_stock)}`}>
                          {p.live_stock ?? 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          className="w-full max-w-[160px] mx-auto py-1.5 px-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                          value={assignMap[p.sku] || ''}
                          onChange={(e) => setAssignMap({ ...assignMap, [p.sku]: e.target.value })}
                        >
                          <option value="">Select Campaign</option>
                          {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
