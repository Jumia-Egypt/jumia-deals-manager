import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, CheckCircle2, XCircle, Info, UploadCloud, Plus, Tag, ExternalLink, 
  Calendar as CalendarIcon, Package, Search, Zap, Clock, Gift, Heart, 
  Sun, Wallet, Sparkles, Cake, Shirt, Smartphone, Tablet, Laptop, 
  Gamepad2, Tv, Microwave, WashingMachine, Refrigerator, Headphones, 
  Monitor, Speaker, Bike, Scissors, Backpack, Baby, MoonStar, Users, Beef,
  Trash2, Eye, X
} from 'lucide-react';
import type { Campaign, ProductInfo, ValidationResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { isValid, format } from 'date-fns';

const safeFormat = (date, formatStr) => {
  try {
    const d = new Date(date);
    if (isValid(d)) {
      return format(d, formatStr);
    }
    return 'Invalid Date';
  } catch {
    return 'Invalid Date';
  }
};

const getCampaignStyle = (name: string) => {
  if (name.includes('Flash Sale')) {
    return { icon: Zap, bg: 'bg-red-50', ring: 'ring-red-200/60', text: 'text-red-700', iconColor: 'text-red-500' };
  }
  if (name.includes('Daily Deal')) {
    return { icon: Clock, bg: 'bg-blue-50', ring: 'ring-blue-200/60', text: 'text-blue-700', iconColor: 'text-blue-500' };
  }
  if (name.includes('Week End Offer')) {
    return { icon: CalendarIcon, bg: 'bg-purple-50', ring: 'ring-purple-200/60', text: 'text-purple-700', iconColor: 'text-purple-500' };
  }
  if (name.includes('JUMIA Anniversary')) {
    return { icon: Cake, bg: 'bg-orange-50', ring: 'ring-orange-200/60', text: 'text-orange-700', iconColor: 'text-orange-500' };
  }
  if (name.includes('Black Friday')) {
    return { icon: Tag, bg: 'bg-slate-800', ring: 'ring-slate-700', text: 'text-white', iconColor: 'text-slate-300' };
  }
  if (name.includes('Mothers Day')) {
    return { icon: Users, bg: 'bg-pink-50', ring: 'ring-pink-200/60', text: 'text-pink-700', iconColor: 'text-pink-500' };
  }
  if (name.includes('Valentines Day')) {
    return { icon: Heart, bg: 'bg-rose-50', ring: 'ring-rose-200/60', text: 'text-rose-700', iconColor: 'text-rose-500' };
  }
  if (name.includes('Back to School')) {
    return { icon: Backpack, bg: 'bg-indigo-50', ring: 'ring-indigo-200/60', text: 'text-indigo-700', iconColor: 'text-indigo-500' };
  }
  if (name.includes('Eid Adha')) {
    return { icon: Beef, bg: 'bg-stone-50', ring: 'ring-stone-200/60', text: 'text-stone-700', iconColor: 'text-stone-500' };
  }
  if (name.includes('Ramadan') || name.includes('Ramdan')) {
    return { icon: MoonStar, bg: 'bg-amber-50', ring: 'ring-amber-200/60', text: 'text-amber-700', iconColor: 'text-amber-500' };
  }
  if (name.includes('Summer Campaign')) {
    return { icon: Sun, bg: 'bg-yellow-50', ring: 'ring-yellow-200/60', text: 'text-yellow-700', iconColor: 'text-yellow-500' };
  }
  if (name.includes('Pay Week')) {
    return { icon: Wallet, bg: 'bg-emerald-50', ring: 'ring-emerald-200/60', text: 'text-emerald-700', iconColor: 'text-emerald-500' };
  }
  return { icon: Sparkles, bg: 'bg-slate-50', ring: 'ring-slate-200/60', text: 'text-slate-700', iconColor: 'text-slate-500' };
};

const getCategoryStyle = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('fashion')) return { icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200' };
  if (cat.includes('phones accessories')) return { icon: Headphones, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' };
  if (cat.includes('phones')) return { icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
  if (cat.includes('tablets')) return { icon: Tablet, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' };
  if (cat.includes('computing accessories')) return { icon: Monitor, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200' };
  if (cat.includes('computing')) return { icon: Laptop, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' };
  if (cat.includes('gaming accessories')) return { icon: Headphones, color: 'text-purple-400', bg: 'bg-purple-50', border: 'border-purple-200' };
  if (cat.includes('gaming')) return { icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' };
  if (cat.includes('tvs accessories')) return { icon: Speaker, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
  if (cat.includes('tvs')) return { icon: Tv, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
  if (cat.includes('small home appliance')) return { icon: Microwave, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
  if (cat.includes('medium home appliance')) return { icon: WashingMachine, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200' };
  if (cat.includes('large home appliance')) return { icon: Refrigerator, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' };
  if (cat.includes('electric scooters')) return { icon: Bike, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
  if (cat.includes('health and beauty')) return { icon: Scissors, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' };
  return { icon: Package, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
};

interface CampaignDetailsProps {
  campaign: Campaign;
  onBack: () => void;
  userRole?: 'admin' | 'vendor' | null;
  vendorId?: string | null;
  vendorName?: string | null;
}

interface ProductEntry {
  id: string;
  sku: string;
  product?: ProductInfo;
  newPrice: string;
  newStock: string;
  loading: boolean;
  error?: string;
  validation?: ValidationResult;
}

export function CampaignDetails({ campaign, onBack, userRole, vendorId, vendorName }: CampaignDetailsProps) {
  const [entries, setEntries] = useState<ProductEntry[]>([
    { id: '1', sku: '', newPrice: '', newStock: '', loading: false }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{id: string, time: string} | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedError, setSelectedError] = useState<ProductEntry | null>(null);

  const handleDeleteEntry = (id: string) => {
    if (entries.length === 1) {
      setEntries([{ id: Math.random().toString(), sku: '', newPrice: '', newStock: '', loading: false }]);
    } else {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced SKU fetch
  const handleSkuChange = async (id: string, sku: string) => {
    setEntries(prev => {
      const last = prev[prev.length - 1];
      const mapped = prev.map(e => e.id === id ? { ...e, sku, product: undefined, error: undefined, validation: undefined } : e);
      if (last?.id === id && last?.sku === '' && sku.length === 1) {
        return [...mapped, { id: Math.random().toString(), sku: '', newPrice: '', newStock: '', loading: false }];
      }
      return mapped;
    });
    
    if (sku.length >= 6) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, loading: true } : e));
      try {
        const res = await fetch(`https://www.jumia.com.eg/catalog/?q=${sku}`, { cache: 'no-store' });
        const html = await res.text();
        const skuUpper = sku.toUpperCase();
        const idx = html.indexOf(`data-sku="${skuUpper}"`);
        if (idx === -1) {
          setEntries(prev => prev.map(e => e.id === id ? { ...e, loading: false, error: 'SKU not found on Jumia Egypt. Please check and try again.' } : e));
          return;
        }
        const chunk = html.slice(idx, idx + 4000);
        const name = (chunk.match(/<h3 class="name">([^<]+)<\/h3>/) || [])[1] || sku;
        const image = ((chunk.match(/data-src="([^"]+)"/) || [])[1] || '').replace('/300x300/', '/500x500/');
        const priceRaw = (chunk.match(/<div class="prc">EGP ([\d,]+\.?[\d]*)/) || [])[1] || '0';
        const livePrice = parseFloat(priceRaw.replace(/,/g, ''));
        const oldPriceRaw = (chunk.match(/<div class="old">EGP ([\d,]+\.?[\d]*)/) || [])[1];
        const bestPrice = oldPriceRaw ? parseFloat(oldPriceRaw.replace(/,/g, '')) : livePrice;
        const brand = name.split(' ')[0];
        const product = { sku, name, brand, category: 'General', image, livePrice, bestPrice };
        setEntries(prev => prev.map(e => e.id === id ? { ...e, product, loading: false } : e));
      } catch (err) {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, loading: false, error: 'Failed to fetch product. Please try again.' } : e));
      }
    }
  };

  const handlePriceChange = async (id: string, price: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, newPrice: price, validation: undefined } : e));
    await validateEntry(id, price, undefined);
  };

  const handleStockChange = async (id: string, stock: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, newStock: stock, validation: undefined } : e));
    await validateEntry(id, undefined, stock);
  };

  const validateEntry = async (id: string, changedPrice?: string, changedStock?: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry?.product) return;

    const price = changedPrice !== undefined ? changedPrice : entry.newPrice;
    const stock = changedStock !== undefined ? changedStock : entry.newStock;

    if (!price || !stock) return;

    try {
      const res = await fetch('/api/validate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: entry.sku,
          newPrice: price,
          newStock: stock,
          campaignId: campaign.id
        })
      });
      const validation = await res.json();
      
      setEntries(prev => {
        const newEntries = prev.map(e => e.id === id ? { ...e, validation } : e);
        
        // Auto-add new row if this one is valid and it's the last row
        if (validation.valid && id === prev[prev.length - 1].id) {
          newEntries.push({ id: Math.random().toString(), sku: '', newPrice: '', newStock: '', loading: false });
        }
        
        return newEntries;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const allValid = entries.filter(e => e.sku).length > 0 && entries.filter(e => e.sku).every(e => e.validation?.valid);
  const [bulkProgress, setBulkProgress] = useState<{total: number, loaded: number} | null>(null);
  const [batchStatus, setBatchStatus] = useState<{type: 'loading'|'pausing', batch: number, total: number, countdown?: number} | null>(null);
  const bulkEntryIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!bulkProgress) return;
    const loaded = entries.filter(e =>
      bulkEntryIdsRef.current.has(e.id) && !e.loading && (e.product || e.error)
    ).length;
    if (loaded !== bulkProgress.loaded) {
      setBulkProgress(prev => prev ? { ...prev, loaded } : null);
    }
  }, [entries]);

  const loadXLSX = (): Promise<any> => new Promise(resolve => {
    if ((window as any).XLSX) { resolve((window as any).XLSX); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
    script.onload = () => resolve((window as any).XLSX);
    document.head.appendChild(script);
  });

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    let skus: string[] = [];
    if (ext === 'csv') {
      const text = await file.text();
      skus = text.split(/\r?\n/).map(l => l.split(',')[0].trim().replace(/"/g, '').toUpperCase()).filter(s => s.length >= 6);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const XLSX = await loadXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      skus = rows.map((r: any[]) => String(r[0] || '').trim().toUpperCase()).filter((s: string) => s.length >= 6);
    }
    if (skus.length === 0) return;
    const newEntries = skus.map(sku => ({ id: Math.random().toString(), sku, newPrice: '', newStock: '', loading: false }));
    setEntries([...newEntries, { id: Math.random().toString(), sku: '', newPrice: '', newStock: '', loading: false }]);
    // Wait 3s for Jumia tab to load (Cloudflare clearance), then start fetching
    const ids = new Set(newEntries.map((e: any) => e.id));
    bulkEntryIdsRef.current = ids;
    setBulkProgress({ total: newEntries.length, loaded: 0 });
    await new Promise(r => setTimeout(r, 3000));
    // Batch + pause with live countdown status
    const BATCH_SIZE = 20;
    const SKU_DELAY = 500;
    const PAUSE_SECS = 60;
    const totalBatches = Math.ceil(newEntries.length / BATCH_SIZE);
    (async () => {
      for (let b = 0; b < totalBatches; b++) {
        const slice = newEntries.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
        setBatchStatus({ type: 'loading', batch: b + 1, total: totalBatches });
        slice.forEach((entry, j) => setTimeout(() => handleSkuChange(entry.id, entry.sku), j * SKU_DELAY));
        await new Promise(r => setTimeout(r, slice.length * SKU_DELAY));
        if (b < totalBatches - 1) {
          for (let cd = PAUSE_SECS; cd > 0; cd--) {
            setBatchStatus({ type: 'pausing', batch: b + 1, total: totalBatches, countdown: cd });
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
      setBatchStatus(null);
    })();
  };

  const handleSubmit = async () => {
    if (!allValid) return;
    setSubmitting(true);
    
    try {
      const validProducts = entries.filter(e => e.validation?.valid);
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          vendorId: vendorId || null,
          vendorName: vendorName || null,
          products: validProducts.map(p => ({ sku: p.sku, price: p.newPrice, stock: p.newStock }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionSuccess({ id: data.submissionId, time: data.timestamp });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-12 text-center max-w-lg mx-auto mt-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Prices Submitted</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
          Your promotional prices for <strong className="text-slate-800">{campaign.name}</strong> have been successfully submitted for review.
        </p>
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 text-sm text-slate-600 space-y-3 mb-8 text-left w-full">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
            <span className="font-medium text-slate-500">Submission ID</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">{submissionSuccess.id}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-medium text-slate-500">Timestamp</span>
            <span className="font-bold text-slate-900">{safeFormat(submissionSuccess.time, 'PPp')}</span>
          </div>
        </div>
        <div>
          <button 
            onClick={onBack}
            className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row gap-6 h-full lg:h-[calc(100vh-140px)] min-h-[500px]"
    >
      {/* Left Column: Info */}
      <div className="w-full lg:w-[340px] flex flex-col gap-4 shrink-0 lg:h-full lg:overflow-y-auto lg:pr-1 pb-4">
        <button 
          onClick={onBack}
          className="group flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm w-fit mb-2"
        >
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm group-hover:border-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Calendar</span>
        </button>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_1px_3px_rgb(0,0,0,0.02)] flex-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Tag className="w-32 h-32" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-orange-500 rounded-full inline-block"></span>
            Campaign Details
          </h3>
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2">Active Campaign</p>
              {(() => {
                const style = getCampaignStyle(campaign.name);
                const Icon = style.icon;
                return (
                  <div className={clsx("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ring-1 shadow-sm", style.bg, style.ring, style.text)}>
                    <Icon className={clsx("w-4 h-4", style.iconColor)} />
                    <p className="text-sm font-bold leading-none">{campaign.name}</p>
                  </div>
                );
              })()}
            </div>
            
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="col-span-2">
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-red-500" /> Deadline
                </p>
                <p className="text-sm font-bold text-red-600 bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100">
                  {safeFormat(campaign.rules.submissionDeadline, 'MMM d, yyyy')}
                </p>
              </div>
              
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-emerald-500" /> Starts
                </p>
                <p className="text-xs font-bold text-slate-700 bg-white inline-block px-2 py-0.5 rounded border border-slate-200">
                  {safeFormat(campaign.startDate, 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                  <MoonStar className="w-3 h-3 text-blue-500" /> Ends
                </p>
                <p className="text-xs font-bold text-slate-700 bg-white inline-block px-2 py-0.5 rounded border border-slate-200">
                  {safeFormat(campaign.endDate, 'MMM d, yyyy')}
                </p>
              </div>

              {campaign.rules.notes && (
                <div className="col-span-2 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Admin Notes
                  </p>
                  <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">{campaign.rules.notes}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2">Eligible Categories</p>
              <div className="flex flex-wrap gap-1.5">
                {campaign.rules.eligibleCategories.map(cat => {
                  const style = getCategoryStyle(cat);
                  const Icon = style.icon;
                  return (
                    <span key={cat} className={clsx("px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5", style.bg, style.color, style.border)}>
                      <Icon className={clsx("w-3 h-3", style.color)} />
                      {cat}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Spreadsheet Entry */}
      {userRole === 'admin' ? (
        <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden relative items-center justify-center p-8 text-center h-[500px] lg:h-full">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Admin View</h3>
          <p className="text-slate-500 max-w-sm">
            Vendors will use this section to submit promotional prices.
            As an administrator, you can review their submissions in the "Vendors' Submissions" tab.
          </p>
        </div>
      ) : isReviewing ? (
        <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden relative h-[500px] lg:h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 relative">
             <div>
               <h3 className="text-lg font-black text-slate-900">Review & Confirm Prices</h3>
               <p className="text-xs text-slate-500 font-medium mt-0.5">Please review your final promotional offers before submitting to Jumia Admin.</p>
             </div>
             <div className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl text-xs font-black">
               {entries.filter(e => e.validation?.valid).length} Items Ready
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24 bg-slate-50/30">
            {entries.filter(e => e.validation?.valid).map((entry) => {
              if (!entry.product) return null;
              const livePrice = entry.product.livePrice;
              const promoPrice = parseFloat(entry.newPrice) || 0;
              const discount = livePrice > 0 ? ((livePrice - promoPrice) / livePrice) * 100 : 0;
              
              return (
                <div key={entry.id} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                    <img src={entry.product.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h4 className="text-sm font-black text-slate-800 truncate">{entry.product.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{entry.sku} · {entry.product.brand}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-center sm:text-right shrink-0">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Current Price</span>
                      <span className="text-xs font-bold text-slate-500">{livePrice.toLocaleString()} EGP</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black text-orange-500 block tracking-wider">Promo Price</span>
                      <span className="text-sm font-black text-slate-900">{promoPrice.toLocaleString()} EGP</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black text-emerald-500 block tracking-wider">Promo Stock</span>
                      <span className="text-sm font-black text-slate-900">{entry.newStock} units</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs font-black shrink-0">
                    {discount.toFixed(1)}% Off
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Actions for Review State */}
          <div className="absolute bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-slate-200 flex justify-between items-center shadow-[0_-4px_12px_rgb(0,0,0,0.02)]">
            <button
              onClick={() => setIsReviewing(false)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all text-xs flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back & Edit</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 text-xs"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <UploadCloud className="w-4 h-4" />}
              <span>Confirm & Final Submit</span>
            </button>
          </div>
        </div>
      ) : (
      <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden relative h-[500px] lg:h-full">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 relative">
           <div>
             <h3 className="text-lg font-bold text-slate-900">Promotional Prices</h3>
             <p className="text-xs text-slate-500 font-medium mt-0.5">Enter SKU to automatically fetch product details.</p>
           </div>
           <div className="flex gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100 text-xs font-bold">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
               {entries.filter(e => e.validation?.valid).length} Ready
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-100 text-xs font-bold">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
               {entries.filter(e => e.validation && !e.validation.valid).length} Errors
             </div>
             {bulkProgress && (
               bulkProgress.loaded >= bulkProgress.total
                 ? <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg border border-green-300 text-xs font-bold">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                     ✓ Finished
                   </div>
                 : <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-xs font-bold">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                     {bulkProgress.loaded} of {bulkProgress.total} Loading
                   </div>
             )}
           </div>
           {batchStatus && (
             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
               batchStatus.type === 'pausing'
                 ? 'bg-amber-50 text-amber-700 border-amber-200'
                 : 'bg-blue-50 text-blue-700 border-blue-200'
             }`}>
               {batchStatus.type === 'loading'
                 ? <><span className="animate-pulse">⏳</span> Batch {batchStatus.batch}/{batchStatus.total} loading...</>
                 : <><span className="animate-pulse">⏸</span> Pausing {batchStatus.countdown}s before next batch</>
               }
             </div>
           )}
        </div>

        {/* Scrollable Container for Table */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[1000px] flex flex-col h-full">
            {/* Header Row */}
            <div className="border-b border-slate-200 bg-[#F8FAFC] grid grid-cols-12 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0 z-10 shadow-sm items-center min-h-[44px]">
              <div className="col-span-2 p-2 border-r border-slate-200 whitespace-nowrap flex items-center justify-center text-center">SKU Simple</div>
              <div className="col-span-3 p-2 border-r border-slate-200 whitespace-nowrap flex items-center justify-center text-center">Product Details</div>
              <div className="col-span-1 p-2 border-r border-slate-200 whitespace-nowrap flex items-center justify-center text-center">Current Price</div>
              <div className="col-span-1 p-2 border-r border-slate-200 text-emerald-600 bg-emerald-50/30 whitespace-nowrap flex items-center justify-center text-center">Best Price</div>
              <div className="col-span-2 p-2 border-r border-slate-200 text-orange-600 bg-orange-50/30 whitespace-nowrap flex items-center justify-center text-center">Promo Price</div>
              <div className="col-span-1 p-2 border-r border-slate-200 text-orange-600 bg-orange-50/30 whitespace-nowrap flex items-center justify-center text-center">Promo Stock</div>
              <div className="col-span-1 p-2 border-r border-slate-200 whitespace-nowrap flex items-center justify-center text-center">Status</div>
              <div className="col-span-1 p-2 whitespace-nowrap flex items-center justify-center text-center">Action</div>
            </div>
            
            {/* Rows */}
            <div className="flex-1 overflow-y-auto pb-24 relative bg-slate-50/30">
          <AnimatePresence>
            {entries.map((entry, index) => (
               <motion.div 
                 layout
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 key={entry.id} 
                 className={clsx(
                   "grid grid-cols-12 items-center transition-all bg-white border-b group min-h-[56px]",
                   entry.validation?.valid ? "border-slate-100" : 
                   entry.validation && !entry.validation.valid ? "bg-red-50/10 border-red-100" :
                   "border-slate-100 hover:bg-slate-50/50"
                 )}
               >
                 {/* SKU */}
                 <div className="col-span-2 p-2 border-r border-slate-100 flex items-center justify-center text-center relative h-full">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-focus-within:bg-orange-500 transition-colors"></div>
                    <div className="relative w-full flex items-center justify-center">
                      <input
                        type="text"
                        value={entry.sku}
                        onChange={(e) => handleSkuChange(entry.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (index === entries.length - 1) {
                              setEntries(prev => [...prev, { id: Math.random().toString(), sku: '', newPrice: '', newStock: '', loading: false }]);
                            }
                          }
                        }}
                        placeholder="SKU..."
                        className={clsx(
                          "w-full text-center text-[11px] font-mono placeholder:text-slate-300 focus:outline-none bg-transparent uppercase",
                          entry.sku ? "font-bold text-slate-800" : ""
                        )}
                      />
                    </div>
                    {entry.loading && <p className="absolute bottom-0.5 right-1 text-[7px] text-blue-500 font-bold uppercase tracking-wider">Loading</p>}
                    {entry.error && <p className="absolute bottom-0.5 right-1 text-[7px] text-red-500 font-bold uppercase tracking-wider">{entry.error}</p>}
                 </div>

                 {/* Product Details */}
                 <div className="col-span-3 p-2 h-full border-r border-slate-100 flex items-center justify-start text-left min-w-0">
                   {entry.product ? (
                     <div className="flex items-center gap-2 w-full min-w-0">
                       <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                         <img src={entry.product.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="truncate flex-1">
                         <p className="text-[10px] font-bold truncate text-slate-800 leading-tight" title={entry.product.name}>{entry.product.name}</p>
                         <p className="text-[8px] text-slate-400 uppercase font-semibold mt-0.5 truncate">{entry.product.brand}</p>
                       </div>
                     </div>
                   ) : (
                     <span className="text-slate-300 text-[10px] font-semibold italic mx-auto">No product matched</span>
                   )}
                 </div>

                 {/* Current Price */}
                 <div className="col-span-1 p-2 h-full border-r border-slate-100 flex items-center justify-center text-center text-[10px] font-bold text-slate-700 bg-slate-50/30 whitespace-nowrap">
                   {entry.product ? `${entry.product.livePrice.toLocaleString()} EGP` : null}
                 </div>

                 {/* Best Price */}
                 <div className="col-span-1 p-2 h-full border-r border-slate-100 flex items-center justify-center text-center text-[10px] font-bold text-emerald-600 bg-emerald-50/10 whitespace-nowrap">
                   {entry.product ? `${entry.product.bestPrice.toLocaleString()} EGP` : null}
                 </div>

                 {/* Promo Price */}
                 <div className="col-span-2 p-2 h-full border-r border-slate-100 flex items-center justify-center text-center bg-orange-50/10">
                   {entry.product ? (
                     <div className="relative group w-24 flex items-center justify-center mx-auto">
                        <input
                          type="number"
                          value={entry.newPrice}
                          onChange={(e) => handlePriceChange(entry.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (index === entries.length - 1) {
                                setEntries(prev => [...prev, { id: Math.random().toString(), sku: '', newPrice: '', newStock: '', loading: false }]);
                              }
                            }
                          }}
                          placeholder="Price"
                          className={clsx(
                            "w-full text-center focus:outline-none font-black text-[11px] px-1.5 py-1 rounded transition-colors",
                            entry.validation?.valid ? "text-slate-900 bg-white shadow-sm ring-1 ring-slate-200" :
                            entry.validation && !entry.validation.valid ? "text-red-700 bg-red-50 ring-1 ring-red-200" :
                            "text-slate-900 bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500"
                          )}
                        />
                     </div>
                   ) : (
                      <div className="w-14 h-6 bg-slate-100 rounded-md opacity-50 mx-auto"></div>
                   )}
                 </div>

                 {/* Promo Stock */}
                 <div className="col-span-1 p-2 h-full border-r border-slate-100 flex items-center justify-center text-center bg-orange-50/10">
                   {entry.product ? (
                     <div className="relative group w-full flex items-center justify-center">
                        <input
                          type="number"
                          value={entry.newStock}
                          onChange={(e) => handleStockChange(entry.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (index === entries.length - 1) {
                                setEntries(prev => [...prev, { id: Math.random().toString(), sku: '', newPrice: '', newStock: '', loading: false }]);
                              }
                            }
                          }}
                          placeholder="Stock"
                          className={clsx(
                            "w-full text-center focus:outline-none font-black text-[11px] px-1.5 py-1 rounded transition-colors",
                            entry.validation?.valid ? "text-slate-900 bg-white shadow-sm ring-1 ring-slate-200" :
                            entry.validation && !entry.validation.valid ? "text-red-700 bg-red-50 ring-1 ring-red-200" :
                            "text-slate-900 bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500"
                          )}
                        />
                     </div>
                   ) : (
                      <div className="w-14 h-6 bg-slate-100 rounded-md opacity-50 mx-auto"></div>
                   )}
                 </div>

                 {/* Status */}
                 <div className="col-span-1 p-2 h-full border-r border-slate-100 flex items-center justify-center">
                   {entry.validation?.valid ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-0.5 shadow-sm ring-1 ring-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-black text-green-600 uppercase text-center leading-none">
                          VALID
                        </span>
                      </div>
                   ) : entry.validation && !entry.validation.valid ? (
                      <div 
                        onClick={() => setSelectedError(entry)}
                        className="flex flex-col items-center justify-center w-full cursor-pointer hover:bg-red-50/50 p-1 rounded-xl transition-all"
                        title="Click to view error reason"
                      >
                        <div className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-0.5 shadow-sm ring-1 ring-red-200 shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-black text-red-600 uppercase text-center leading-none">
                          INVALID
                        </span>
                      </div>
                   ) : (
                      <div className="text-slate-300 text-xs font-bold">--</div>
                   )}
                 </div>

                 {/* Action */}
                 <div className="col-span-1 p-2 h-full flex items-center justify-center">
                   <button
                     onClick={() => handleDeleteEntry(entry.id)}
                     className="p-1 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200/50 hover:border-red-200 transition-all shadow-sm"
                     title="Delete SKU row"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                 </div>
               </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Fillers for visual padding if few entries */}
          {entries.length < 5 && (
            <>
              <div className="grid grid-cols-12 h-14 border-b border-slate-100 bg-white opacity-40">
                <div className="col-span-2 border-r border-slate-100"></div>
                <div className="col-span-3 border-r border-slate-100"></div>
                <div className="col-span-1 border-r border-slate-100 bg-slate-50/30"></div>
                <div className="col-span-1 border-r border-slate-100 bg-emerald-50/10"></div>
                <div className="col-span-2 border-r border-slate-100 bg-orange-50/10"></div>
                <div className="col-span-1 border-r border-slate-100 bg-orange-50/10"></div>
                <div className="col-span-1 border-r border-slate-100"></div>
                <div className="col-span-1"></div>
              </div>
              <div className="grid grid-cols-12 h-14 border-b border-slate-100 bg-white opacity-20">
                <div className="col-span-2 border-r border-slate-100"></div>
                <div className="col-span-3 border-r border-slate-100"></div>
                <div className="col-span-1 border-r border-slate-100 bg-slate-50/30"></div>
                <div className="col-span-1 border-r border-slate-100 bg-emerald-50/10"></div>
                <div className="col-span-2 border-r border-slate-100 bg-orange-50/10"></div>
                <div className="col-span-1 border-r border-slate-100 bg-orange-50/10"></div>
                <div className="col-span-1 border-r border-slate-100"></div>
                <div className="col-span-1"></div>
              </div>
            </>
          )}
        </div>
          </div>
        </div>

        {/* Footer Actions (Sticky Bottom) */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-slate-200 flex justify-between items-center shadow-[0_-4px_12px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 hidden sm:block tracking-wider uppercase bg-slate-100 px-2 py-1 rounded">
              TIP: PRESS ENTER TO AUTO-ADD NEXT ROW
            </p>

                      <button
              onClick={() => setEntries(prev => [...prev, { id: Math.random().toString(), sku: '', newPrice: '', newStock: '', loading: false }])}
              className="px-4 py-1.5 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:translate-y-px"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.open('https://www.jumia.com.eg', '_blank', 'noopener,noreferrer');
                setTimeout(() => fileInputRef.current?.click(), 200);
              }}
              className="px-4 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:translate-y-px"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Sheet</span>
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleBulkUpload} />
          </div>
          <button
            onClick={() => setIsReviewing(true)}
            disabled={!allValid || entries.filter(e => e.sku).length === 0 || submitting}
            className="ml-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Eye className="w-4 h-4" />
            <span>Review Promotional Prices</span>
          </button>
        </div>
      </div>
      )}

      {/* Validation Issue Interactive Modal popup */}
      <AnimatePresence>
        {selectedError && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setSelectedError(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Validation Error Details</h4>
                  <p className="text-xs text-slate-500 font-medium">SKU: <span className="font-mono font-bold text-slate-700">{selectedError.sku}</span></p>
                </div>
              </div>

              {selectedError.product && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex items-center gap-4">
                  <img 
                    src={selectedError.product.image} 
                    alt={selectedError.product.name}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-slate-800 truncate">{selectedError.product.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{selectedError.product.category} Ã¢ÂÂ¢ {selectedError.product.brand}</p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">Current Price: <span className="text-slate-700 font-black">{selectedError.product.livePrice.toLocaleString()} EGP</span></p>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Your Promo Price</span>
                    <span className="text-sm font-black text-red-600">{selectedError.newPrice ? `${parseFloat(selectedError.newPrice).toLocaleString()} EGP` : 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Your Promo Stock</span>
                    <span className="text-sm font-black text-red-600">{selectedError.newStock ? `${selectedError.newStock} units` : 'Not Set'}</span>
                  </div>
                </div>

                <div className="bg-red-50/50 border border-red-100/80 rounded-2xl p-4">
                  <p className="text-xs font-extrabold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Validation Issues:
                  </p>
                  <ul className="space-y-1.5">
                    {selectedError.validation?.error ? (
                      selectedError.validation.error.split(" AND ").map((errStr, idx) => (
                        <li key={idx} className="text-xs text-red-700 font-bold flex items-start gap-1.5 leading-relaxed">
                          <span className="text-red-500 mt-1 shrink-0">Ã¢ÂÂ¢</span>
                          <span>{errStr}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-red-700 font-bold">Unknown validation error.</li>
                    )}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setSelectedError(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors shadow-lg shadow-slate-900/10"
              >
                Understand & Dismiss
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
