import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Package, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Vendor { id: string; name: string; email: string; }
interface ProductRow {
  sku: string; supplier_sku: string; brand: string; model_name: string;
  price_before: number; price_after: number; live_stock: number;
}

export default function VendorSkus() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [existingSkus, setExistingSkus] = useState<ProductRow[]>([]);
  const [preview, setPreview] = useState<ProductRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{type:'success'|'error', text:string} | null>(null);
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/vendors')
      .then(r => r.json())
      .then(data => setVendors((data || []).filter((v: any) => v.role?.toUpperCase() === 'VENDOR')))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedVendor) { setExistingSkus([]); return; }
    fetch('/api/products?vendor_id=' + selectedVendor.id)
      .then(r => r.json())
      .then(data => setExistingSkus(Array.isArray(data) ? data.map((p: any) => ({
        sku: p.sku, supplier_sku: p.supplier_sku || '', brand: p.brand || '',
        model_name: p.model_name || p.name || '',
        price_before: p.best_price || 0, price_after: p.live_price || 0, live_stock: p.live_stock || 0
      })) : []))
      .catch(() => {});
  }, [selectedVendor]);

  const parseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const normalize = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');
        const map: Record<string, string> = {
          // SKU
          sku: 'sku', skusimple: 'sku', simple: 'sku', jumiasku: 'sku', simpleusku: 'sku',
          // Supplier SKU
          suppliersku: 'supplier_sku', skusuppliersource: 'supplier_sku',
          suppliersource: 'supplier_sku', skusupplier: 'supplier_sku', suppsku: 'supplier_sku',
          // Brand
          brand: 'brand',
          // Name
          productname: 'model_name', modelname: 'model_name', name: 'model_name',
          model: 'model_name', product: 'model_name', title: 'model_name',
          // Price Before
          pricebefore: 'price_before', bestprice: 'price_before', originalprice: 'price_before',
          // Price After
          priceafter: 'price_after', liveprice: 'price_after', saleprice: 'price_after',
          // Stock
          availablestock: 'live_stock', livestock: 'live_stock', stock: 'live_stock',
          qty: 'live_stock', quantity: 'live_stock', availqty: 'live_stock'
        };
        const rows: ProductRow[] = raw.map(r => {
          const out: any = { sku:'', supplier_sku:'', brand:'', model_name:'', price_before:0, price_after:0, live_stock:0 };
          Object.keys(r).forEach(k => {
            const mapped = map[normalize(k)];
            if (mapped) out[mapped] = r[k];
          });
          out.price_before = parseFloat(String(out.price_before).replace(/[^0-9.]/g,'')) || 0;
          out.price_after = parseFloat(String(out.price_after).replace(/[^0-9.]/g,'')) || 0;
          out.live_stock = parseInt(String(out.live_stock).replace(/[^0-9]/g,'')) || 0;
          out.sku = String(out.sku).trim();
          return out;
        }).filter(r => r.sku);
        setPreview(rows);
        setSaveMsg(rows.length === 0
          ? { type: 'error', text: 'No SKUs found — check column headers match: SKU Simple, Brand, Product Name, Price Before, Price After, Available Stock' }
          : null
        );
      } catch { setSaveMsg({ type: 'error', text: 'Failed to parse file. Use CSV or XLSX.' }); }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async () => {
    if (!selectedVendor || preview.length === 0) return;
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: selectedVendor.id, products: preview })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaveMsg({ type: 'success', text: data.count + ' SKUs saved for ' + selectedVendor.name });
      setPreview([]);
      const r2 = await fetch('/api/products?vendor_id=' + selectedVendor.id);
      const d2 = await r2.json();
      setExistingSkus(Array.isArray(d2) ? d2.map((p: any) => ({
        sku: p.sku, supplier_sku: p.supplier_sku || '', brand: p.brand || '',
        model_name: p.model_name || p.name || '',
        price_before: p.best_price || 0, price_after: p.live_price || 0, live_stock: p.live_stock || 0
      })) : []);
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err.message || 'Failed to save' });
    } finally { setSaving(false); }
  };

  const displayRows = preview.length > 0 ? preview : existingSkus.filter(r =>
    !search || r.sku.toLowerCase().includes(search.toLowerCase()) ||
    r.model_name.toLowerCase().includes(search.toLowerCase()) ||
    r.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Vendor SKUs</h1>
        <p className="text-sm text-slate-500 mt-1">Upload product catalogs per vendor.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Vendor</label>
        <div className="relative max-w-xs">
          <select
            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={selectedVendor?.id || ''}
            onChange={e => {
              const v = vendors.find(x => x.id === e.target.value) || null;
              setSelectedVendor(v); setPreview([]); setSaveMsg(null);
            }}
          >
            <option value="">— Choose a vendor —</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {selectedVendor && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Upload for <span className="text-orange-500">{selectedVendor.name}</span></p>
                <p className="text-xs text-slate-400 mt-0.5">Columns: SKU Simple · SKU Supplier Source · Brand · Product Name · Price Before · Price After · Available Stock</p>
              </div>
              <div className="flex items-center gap-2">
                {preview.length > 0 && (
                  <>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{preview.length} rows ready</span>
                    <button onClick={() => setPreview([])} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                      className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save to Supabase'}
                    </button>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={parseFile} />
                <button onClick={() => fileRef.current?.click()}
                  className="px-4 py-1.5 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>
            {saveMsg && (
              <div className={`mt-3 flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl ${saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {saveMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {saveMsg.text}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-slate-700">
                  {preview.length > 0 ? 'Preview — ' + preview.length + ' rows' : existingSkus.length + ' SKUs in database'}
                </span>
              </div>
              {preview.length === 0 && existingSkus.length > 0 && (
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              )}
            </div>
            {displayRows.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                {existingSkus.length === 0 ? 'No SKUs uploaded yet for this vendor.' : 'No results match your search.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold">
                      <th className="text-left px-4 py-3">SKU</th>
                      <th className="text-left px-4 py-3">Supplier SKU</th>
                      <th className="text-left px-4 py-3">Brand</th>
                      <th className="text-left px-4 py-3">Product Name</th>
                      <th className="text-right px-4 py-3">Price Before</th>
                      <th className="text-right px-4 py-3">Price After</th>
                      <th className="text-right px-4 py-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayRows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{row.sku}</td>
                        <td className="px-4 py-2.5 text-slate-500">{row.supplier_sku || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.brand || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-700 max-w-[220px] truncate">{row.model_name || '—'}</td>
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
        </>
      )}
    </div>
  );
}
