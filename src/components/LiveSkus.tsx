import { useState, useEffect, useRef } from 'react';
import { Package, Search, ChevronDown, Check } from 'lucide-react';

/* ── Dropdown ────────────────────────────────── */
interface DropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  className?: string;
}
function Dropdown({ value, onChange, options, placeholder, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const sel = options.find(o => o.value === value);
  return (
    <div className="relative w-full" ref={ref}>
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer shadow-sm text-slate-700 font-medium ${className}`}>
        <span className="truncate text-xs">{sel ? sel.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-orange-500' : 'text-slate-400'}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 left-0 min-w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 max-h-60 overflow-auto">
          <button type="button" onClick={() => { onChange(''); setIsOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${value === '' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}>
            <span className="truncate">{placeholder}</span>
            {value === '' && <Check className="w-3 h-3 text-orange-500 ml-2 flex-shrink-0" />}
          </button>
          {options.length > 0 && <div className="h-px bg-slate-100 my-1 mx-2" />}
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${value === opt.value ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}>
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <Check className="w-3 h-3 text-orange-500 ml-2 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <>
      <style>{`.jumia-loader{--dim:2.2rem;background-color:#f97316;opacity:0.55;width:var(--dim);height:var(--dim);border-radius:50%;display:grid;place-items:center;animation:spin_412 5s infinite;} .jumia-loader svg{transform:translateY(-1px) scale(.65);} @keyframes spin_412{0%{transform:rotate(0) scale(1);}50%{transform:rotate(720deg) scale(1.2);}100%{transform:rotate(0) scale(1);}}`}</style>
      <div className="jumia-loader">
        <svg version="1.1" viewBox="0 0 47.94 47.94" xmlns="http://www.w3.org/2000/svg">
          <path style={{fill:'#fff'}} d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956c0.947-1.919,3.683-1.919,4.63,0z"/>
        </svg>
      </div>
    </>
  );
}

/* ── Types ───────────────────────────────────── */
interface Product {
  sku: string;
  supplier_sku: string;
  brand: string;
  model_name: string;
  price_before: number;
  price_after: number;
  live_stock: number;
}
interface LiveSkusProps { vendorId: string; }

/* ── Main Component ──────────────────────────── */
export default function LiveSkus({ vendorId }: LiveSkusProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!vendorId) return;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const pR = await fetch(`/api/products?vendor_id=${vendorId}`);
        if (!pR.ok) throw new Error('Failed to load products');
        setProducts(await pR.json() || []);
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
    const mb = !brandFilter || p.brand === brandFilter;
    const ms = !search || p.sku?.toLowerCase().includes(search.toLowerCase()) || p.model_name?.toLowerCase().includes(search.toLowerCase());
    return mb && ms;
  });

  const fmt = (n: number | null | undefined) => n != null && n > 0 ? `EGP ${n.toLocaleString()}` : '—';
  const stockBadge = (qty: number) => {
    if (!qty && qty !== 0) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (qty > 50) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (qty > 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-2.5 rounded-xl shadow-sm border border-orange-200">
          <Package className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Live SKUs</h1>
          <p className="text-xs text-slate-500 mt-0.5">View and manage your active products.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
            <input type="text" placeholder="Search SKU or model..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-slate-50 hover:bg-white w-56" />
          </div>
          <div className="w-44 z-20">
            <Dropdown value={brandFilter} onChange={setBrandFilter}
              options={brands.map(b => ({ label: b, value: b }))} placeholder="All Brands"
              className="rounded-xl py-2 px-3" />
          </div>
          {!loading && (
            <span className="ml-auto text-xs text-slate-400">{filtered.length} / {products.length} products</span>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[120px]">
              <Loader />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl text-xs max-w-md text-center">
                <p className="font-bold mb-1">Failed to load data</p><p>{error}</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
              <Package className="w-10 h-10 text-slate-200" />
              <p className="text-xs font-semibold text-slate-500">
                {products.length === 0 ? 'No products uploaded yet.' : 'No products match your filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs whitespace-nowrap min-w-[820px]">
              <colgroup>
                <col style={{width:'150px'}} />
                <col style={{width:'200px'}} />
                <col style={{width:'130px'}} />
                <col />
                <col style={{width:'140px'}} />
                <col style={{width:'140px'}} />
                <col style={{width:'90px'}} />
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="bg-orange-50 border-b border-orange-200 text-orange-600">
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">SKU</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Supplier SKU</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Brand</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Model Name</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Price Before</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Price After</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.sku} className="bg-white hover:bg-orange-50 transition-colors duration-100">
                    <td className="px-4 py-3 text-center font-mono text-slate-700">{p.sku}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-500 truncate max-w-[200px]" title={p.supplier_sku}>
                      {p.supplier_sku || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md shadow-sm">{p.brand || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-left text-slate-700">
                      <span className="block truncate" title={p.model_name}>{p.model_name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-400 line-through">{fmt(p.price_before)}</td>
                    <td className="px-4 py-3 text-center font-mono font-semibold" style={{color:'#f97316'}}>{fmt(p.price_after)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-10 py-0.5 rounded-full font-semibold border font-mono ${stockBadge(p.live_stock)}`}>
                        {p.live_stock ?? 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
