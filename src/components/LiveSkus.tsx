import { useState, useEffect, useRef } from 'react';
import { Package, Search, ChevronDown, Check } from 'lucide-react';
interface DropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  className?: string;
}
function Dropdown({ value, onChange, options, placeholder, className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const selectedOption = options.find(o => o.value === value);
  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer shadow-sm text-slate-700 font-semibold ${className}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-orange-500' : 'text-slate-400'}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 left-0 min-w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 max-h-60 overflow-auto">
          <button
            type="button"
            className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
              value === '' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
            onClick={() => { onChange(''); setIsOpen(false); }}
          >
            <span className="truncate whitespace-nowrap">{placeholder}</span>
            {value === '' && <Check className="w-3.5 h-3.5 text-orange-500 ml-3 flex-shrink-0" />}
          </button>
          {options.length > 0 && <div className="h-px bg-slate-100 my-1 mx-2" />}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                value === opt.value ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              <span className="truncate whitespace-nowrap">{opt.label}</span>
              {value === opt.value && <Check className="w-3.5 h-3.5 text-orange-500 ml-3 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
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
    if (!qty && qty !== 0) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (qty > 50) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (qty > 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };
  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-800 font-sans p-6 md:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 rounded-2xl shadow-sm border border-orange-200">
          <Package className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Live SKUs</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your active products, check stock levels, and assign SKUs to ongoing campaigns.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Filters */}
        <div className="p-4 md:px-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-3 bg-white">
          <div className="relative w-full md:max-w-sm group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by SKU or Model Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-slate-50 hover:bg-white"
            />
          </div>
          <div className="relative w-full md:w-52 z-20">
            <Dropdown
              value={brandFilter}
              onChange={setBrandFilter}
              options={brands.map(b => ({ label: b, value: b }))}
              placeholder="All Brands"
              className="rounded-xl py-2 px-3.5 text-xs"
            />
          </div>
          {selectedSkus.size > 0 && (
            <span className="ml-auto text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
              {selectedSkus.size} selected
            </span>
          )}
        </div>
        {/* Table */}
        <div className="flex-1 overflow-auto bg-white relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-orange-500 border-t-transparent"></div>
              <p className="text-xs text-slate-400 animate-pulse">Loading your SKUs...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl text-xs max-w-md text-center">
                <p className="font-bold mb-1">Failed to load data</p>
                <p className="text-rose-600/80">{error}</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <Package className="w-7 h-7 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">No products found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search or brand filters.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-xs text-left whitespace-nowrap min-w-[1000px]">
              <thead className="bg-orange-50 text-orange-600 sticky top-0 z-10 border-b border-orange-200">
                <tr>
                  <th className="px-4 py-3 text-center font-bold tracking-wide w-16">Select</th>
                  <th className="px-4 py-3 text-center font-bold tracking-wide w-28">SKU</th>
                  <th className="px-4 py-3 text-center font-bold tracking-wide w-28">Supplier SKU</th>
                  <th className="px-4 py-3 text-center font-bold tracking-wide w-24">Brand</th>
                  <th className="px-4 py-3 text-center font-bold tracking-wide">Model Name</th>
                  <th className="px-4 py-3 text-center font-bold tracking-wide w-24">Price Before</th>
                  <th className="px-4 py-3 text-center font-bold tracking-wide w-24">Price After</th>
                  <th className="px-4 py-3 text-center font-bold tracking-wide w-16">Stock</th>
                  <th className="px-4 py-3 text-center font-bold tracking-wide w-44">Assign to Campaign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const isSelected = selectedSkus.has(p.sku);
                  return (
                    <tr
                      key={p.sku}
                      className={`transition-colors duration-150 ${isSelected ? 'bg-orange-50/60 hover:bg-orange-100/50' : 'bg-white hover:bg-orange-50/40'}`}
                    >
                      <td className="px-4 py-2.5 text-center">
                        <label className="relative inline-flex items-center cursor-pointer mx-auto">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(p.sku)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 peer-checked:after:border-white shadow-inner"></div>
                        </label>
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-slate-700">{p.sku}</td>
                      <td className="px-4 py-2.5 text-center font-mono text-slate-500 truncate max-w-[112px]" title={p.supplier_sku}>
                        {p.supplier_sku || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm font-medium">
                          {p.brand || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-slate-700 font-medium">
                        <span className="block truncate max-w-[260px] mx-auto" title={p.model_name}>
                          {p.model_name || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-slate-400 line-through decoration-slate-300 font-mono">
                        {fmt(p.price_before)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-[#f97316] font-mono">
                        {fmt(p.price_after)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-semibold border font-mono ${stockBadge(p.live_stock)}`}>
                          {p.live_stock ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="relative mx-auto w-full max-w-[150px]">
                          <Dropdown
                            value={assignMap[p.sku] || ''}
                            onChange={(val) => setAssignMap({ ...assignMap, [p.sku]: val })}
                            options={campaigns.map(c => ({ label: c.name, value: c.id }))}
                            placeholder="Select"
                            className="rounded-lg py-1.5 px-3 text-xs"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
