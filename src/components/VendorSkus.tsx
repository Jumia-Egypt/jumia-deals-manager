import { useState, useEffect, useRef } from 'react';
import { UploadCloud, Save, Search, ChevronDown, Check, Users, Trash2, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

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
            <span>{placeholder}</span>
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

interface ParsedRow { sku: string; supplier_sku: string; brand: string; model_name: string; price_before: number; price_after: number; live_stock: number; }
interface Vendor { id: string; name: string; email: string; role: string; }

const COL_MAP: Record<string, string> = {
  sku:'sku', skusimple:'sku', simple:'sku', jumiasku:'sku', simpleusku:'sku',
  suppliersku:'supplier_sku', skusuppliersource:'supplier_sku', suppliersource:'supplier_sku', skusupplier:'supplier_sku', suppsku:'supplier_sku',
  brand:'brand',
  productname:'model_name', modelname:'model_name', name:'model_name', model:'model_name', product:'model_name', title:'model_name',
  pricebefore:'price_before', bestprice:'price_before', originalprice:'price_before',
  priceafter:'price_after', liveprice:'price_after', saleprice:'price_after',
  availablestock:'live_stock', livestock:'live_stock', stock:'live_stock', qty:'live_stock', quantity:'live_stock', availqty:'live_stock',
};

export default function VendorSkus() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [isPendingUpload, setIsPendingUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load vendors
  useEffect(() => {
    fetch('/api/vendors')
      .then(r => r.json())
      .then((d: Vendor[]) => setVendors((d || []).filter(v => v.role === 'VENDOR')))
      .catch(() => {});
  }, []);

  // Load existing SKUs from Supabase when vendor changes
  useEffect(() => {
    if (!selectedVendorId) { setRows([]); setIsPendingUpload(false); setMsg(null); return; }
    setLoadingRows(true);
    setMsg(null);
    setIsPendingUpload(false);
    fetch(`/api/products?vendor_id=${selectedVendorId}`)
      .then(r => r.json())
      .then(d => setRows(d || []))
      .catch(() => setRows([]))
      .finally(() => setLoadingRows(false));
  }, [selectedVendorId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const wb = XLSX.read(ev.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const parsed = raw.map(r => {
        const out: any = { sku:'', supplier_sku:'', brand:'', model_name:'', price_before:0, price_after:0, live_stock:0 };
        Object.keys(r).forEach(k => {
          const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          const mapped = COL_MAP[norm];
          if (mapped) out[mapped] = r[k];
        });
        return out as ParsedRow;
      }).filter(r => r.sku);
      setRows(parsed);
      setIsPendingUpload(true);
      setMsg(null);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!selectedVendorId || rows.length === 0) return;
    setSaving(true); setMsg(null);
    try {
      const res = await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: rows.map(r => ({ ...r, vendor_id: selectedVendorId })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setMsg({ type: 'ok', text: `${rows.length} products saved to Supabase.` });
      setIsPendingUpload(false);
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message });
    } finally { setSaving(false); }
  };

  const handleClear = async () => {
    if (!selectedVendorId) return;
    if (!window.confirm('Delete ALL SKUs for this vendor from Supabase? This cannot be undone.')) return;
    setClearing(true); setMsg(null);
    try {
      const res = await fetch(`/api/products?vendor_id=${selectedVendorId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setRows([]);
      setIsPendingUpload(false);
      setMsg({ type: 'ok', text: 'All SKUs deleted from Supabase.' });
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message });
    } finally { setClearing(false); }
  };

  const brands = Array.from(new Set(rows.map(r => r.brand).filter(Boolean))).sort();
  const filtered = rows.filter(r => {
    const mb = !brandFilter || r.brand === brandFilter;
    const ms = !search || r.sku?.toLowerCase().includes(search.toLowerCase()) || r.model_name?.toLowerCase().includes(search.toLowerCase());
    return mb && ms;
  });

  const fmt = (n: number) => n > 0 ? `EGP ${Number(n).toLocaleString()}` : '—';
  const stockBadge = (qty: number) => {
    if (!qty && qty !== 0) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (qty > 50) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (qty > 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans p-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-2.5 rounded-xl shadow-sm border border-orange-200">
          <Users className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Vendor SKUs</h1>
          <p className="text-xs text-slate-500 mt-0.5">View, upload, or clear a vendor's product catalog.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="w-72">
          <Dropdown
            value={selectedVendorId}
            onChange={setSelectedVendorId}
            options={vendors.map(v => ({ label: `${v.name} (${v.email})`, value: v.id }))}
            placeholder="Select Vendor"
            className="rounded-xl py-2.5 px-3.5"
          />
        </div>

        {selectedVendorId && (
          <>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
              <UploadCloud className="w-4 h-4" />
              {isPendingUpload ? `Replace (${rows.length} rows)` : 'Upload CSV / XLSX'}
            </button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />

            {isPendingUpload && (
              <button type="button" onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : `Save ${rows.length} products`}
              </button>
            )}

            {rows.length > 0 && !isPendingUpload && (
              <button type="button" onClick={handleClear} disabled={clearing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ml-auto">
                <Trash2 className="w-3.5 h-3.5" />
                {clearing ? 'Deleting…' : `Clear All ${rows.length} SKUs`}
              </button>
            )}
          </>
        )}

        {msg && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {msg.text}
          </span>
        )}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Pending upload banner */}
        {isPendingUpload && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            {rows.length} rows parsed from file — click <strong>Save</strong> to persist to Supabase.
          </div>
        )}

        {/* Filters */}
        {rows.length > 0 && (
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
            <span className="ml-auto text-xs text-slate-400">{filtered.length} / {rows.length} rows</span>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {!selectedVendorId ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-slate-400">
              <Users className="w-10 h-10 text-slate-200" />
              <p className="text-xs font-semibold">Select a vendor to view their SKUs.</p>
            </div>
          ) : loadingRows ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin h-7 w-7 border-2 border-orange-500 border-t-transparent rounded-full" />
              <p className="text-xs text-slate-400 animate-pulse">Loading SKUs…</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-slate-400">
              <UploadCloud className="w-10 h-10 text-slate-200" />
              <p className="text-xs font-semibold">No products found. Upload a CSV or XLSX file to add products.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-6">
              <p className="text-xs font-semibold text-slate-500">No rows match your filters.</p>
            </div>
          ) : (
            <table className="w-full text-xs whitespace-nowrap min-w-[900px]">
              <colgroup>
                <col style={{width:'110px'}} />
                <col style={{width:'110px'}} />
                <col style={{width:'100px'}} />
                <col />
                <col style={{width:'110px'}} />
                <col style={{width:'110px'}} />
                <col style={{width:'70px'}} />
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="text-white" style={{background:'linear-gradient(90deg,#f97316,#fb923c)'}}>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide">SKU</th>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide">Supplier SKU</th>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide">Brand</th>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide">Model Name</th>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide">Price Before</th>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide">Price After</th>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r, i) => (
                  <tr key={`${r.sku}-${i}`} className={i % 2 === 0 ? 'bg-white hover:bg-orange-50/30' : 'bg-slate-50/40 hover:bg-orange-50/30'}>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-700">{r.sku}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-500 truncate max-w-[110px]" title={r.supplier_sku}>{r.supplier_sku || '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md shadow-sm">{r.brand || '—'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-left text-slate-700">
                      <span className="block truncate" title={r.model_name}>{r.model_name || '—'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400 line-through">{fmt(r.price_before)}</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold" style={{color:'#f97316'}}>{fmt(r.price_after)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center w-10 py-0.5 rounded-full font-semibold border font-mono ${stockBadge(r.live_stock)}`}>
                        {r.live_stock ?? 0}
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
