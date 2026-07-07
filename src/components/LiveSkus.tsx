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
    n != null && n > 0 ? `EGP ${n.toLocaleString()}` : '—';

  const stockBadge = (qty: number) => {
    if (!qty && qty !== 0) return 'bg-gray-100 text-gray-500';
    if (qty > 50) return 'bg-green-100 text-green-700';
    if (qty > 10) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="text-orange-500" size={22} />
        <h2 className="text-xl font-bold text-gray-800">My Live SKUs</h2>
        {!loading && (
          <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {filtered.length} / {products.length}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search SKU or model…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="text-sm focus:outline-none bg-transparent text-gray-700 cursor-pointer"
          >
            <option value="">All Brands</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {selectedSkus.size > 0 && (
          <span className="ml-auto text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
            {selectedSkus.size} selected
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
          Loading products…
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <colgroup>
                <col style={{ width: '40px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '110px' }} />
                <col />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '190px' }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: '#f97316' }} className="text-white">
                  <th className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="cursor-pointer w-4 h-4 accent-white"
                    />
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide">SKU</th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide">Supplier SKU</th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide">Brand</th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide">Model Name</th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide">Price Before</th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide">Price After</th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide">Stock</th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide">Assign to Campaign</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                      {products.length === 0 ? 'No products uploaded yet.' : 'No products match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr
                      key={p.sku}
                      className={`border-t border-gray-100 transition-colors ${
                        selectedSkus.has(p.sku)
                          ? 'bg-orange-50'
                          : i % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50/40'
                      } hover:bg-orange-50/60`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedSkus.has(p.sku)}
                          onChange={() => toggleOne(p.sku)}
                          className="cursor-pointer w-4 h-4 accent-orange-500"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-700">{p.sku}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-400">{p.supplier_sku || '—'}</td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{p.brand || '—'}</td>
                      <td className="px-3 py-2.5 text-center text-gray-800 font-medium">
                        <span className="block truncate max-w-xs mx-auto" title={p.model_name}>{p.model_name || '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-400">{fmt(p.price_before)}</td>
                      <td className="px-3 py-2.5 text-center text-green-600 font-semibold">{fmt(p.price_after)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center justify-center w-12 px-2 py-0.5 rounded-full text-xs font-semibold ${stockBadge(p.live_stock)}`}>
                          {p.live_stock ?? '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <select
                          value={assignMap[p.sku] || ''}
                          onChange={e => setAssignMap(prev => ({ ...prev, [p.sku]: e.target.value }))}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full max-w-[170px]"
                        >
                          <option value="">— Select Campaign —</option>
                          {campaigns.length === 0 && (
                            <option disabled>No active campaigns</option>
                          )}
                          {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
