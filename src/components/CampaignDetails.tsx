import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, CheckCircle2, Tag, UploadCloud,
  Calendar as CalendarIcon, Package, Search, Zap, Clock, Heart,
  Sun, Wallet, Sparkles, Cake, Shirt, Smartphone, Tablet, Laptop,
  Gamepad2, Tv, Microwave, WashingMachine, Refrigerator, Headphones,
  Monitor, Speaker, Bike, Scissors, Backpack, MoonStar, Users, Beef,
  Eye, ChevronDown, Check, Info,
} from 'lucide-react';
import type { Campaign } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { isValid, format } from 'date-fns';

/* Ã¢ÂÂÃ¢ÂÂ helpers Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const safeFormat = (date: any, formatStr: string) => {
  try {
    const d = new Date(date);
    if (isValid(d)) return format(d, formatStr);
    return 'Invalid Date';
  } catch { return 'Invalid Date'; }
};

const getCampaignStyle = (name: string) => {
  if (name.includes('Flash Sale'))       return { icon: Zap,          bg: 'bg-red-50',    ring: 'ring-red-200/60',    text: 'text-red-700',    iconColor: 'text-red-500' };
  if (name.includes('Daily Deal'))       return { icon: Clock,        bg: 'bg-blue-50',   ring: 'ring-blue-200/60',   text: 'text-blue-700',   iconColor: 'text-blue-500' };
  if (name.includes('Week End Offer'))   return { icon: CalendarIcon, bg: 'bg-purple-50', ring: 'ring-purple-200/60', text: 'text-purple-700', iconColor: 'text-purple-500' };
  if (name.includes('JUMIA Anniversary'))return { icon: Cake,         bg: 'bg-orange-50', ring: 'ring-orange-200/60', text: 'text-orange-700', iconColor: 'text-orange-500' };
  if (name.includes('Black Friday'))     return { icon: Tag,          bg: 'bg-slate-800', ring: 'ring-slate-700',     text: 'text-white',      iconColor: 'text-slate-300' };
  if (name.includes('Mothers Day'))      return { icon: Users,        bg: 'bg-pink-50',   ring: 'ring-pink-200/60',   text: 'text-pink-700',   iconColor: 'text-pink-500' };
  if (name.includes('Valentines Day'))   return { icon: Heart,        bg: 'bg-rose-50',   ring: 'ring-rose-200/60',   text: 'text-rose-700',   iconColor: 'text-rose-500' };
  if (name.includes('Back to School'))   return { icon: Backpack,     bg: 'bg-indigo-50', ring: 'ring-indigo-200/60', text: 'text-indigo-700', iconColor: 'text-indigo-500' };
  if (name.includes('Eid Adha'))         return { icon: Beef,         bg: 'bg-stone-50',  ring: 'ring-stone-200/60',  text: 'text-stone-700',  iconColor: 'text-stone-500' };
  if (name.includes('Ramadan') || name.includes('Ramdan')) return { icon: MoonStar, bg: 'bg-amber-50', ring: 'ring-amber-200/60', text: 'text-amber-700', iconColor: 'text-amber-500' };
  if (name.includes('Summer Campaign'))  return { icon: Sun,          bg: 'bg-yellow-50', ring: 'ring-yellow-200/60', text: 'text-yellow-700', iconColor: 'text-yellow-500' };
  if (name.includes('Pay Week'))         return { icon: Wallet,       bg: 'bg-emerald-50',ring: 'ring-emerald-200/60',text: 'text-emerald-700',iconColor: 'text-emerald-500' };
  return { icon: Sparkles, bg: 'bg-slate-50', ring: 'ring-slate-200/60', text: 'text-slate-700', iconColor: 'text-slate-500' };
};

const getCategoryStyle = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('fashion'))               return { icon: Shirt,        color: 'text-pink-500',   bg: 'bg-pink-50',   border: 'border-pink-200' };
  if (cat.includes('phones accessories'))    return { icon: Headphones,   color: 'text-sky-500',    bg: 'bg-sky-50',    border: 'border-sky-200' };
  if (cat.includes('phones'))                return { icon: Smartphone,   color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200' };
  if (cat.includes('tablets'))               return { icon: Tablet,       color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' };
  if (cat.includes('computing accessories')) return { icon: Monitor,      color: 'text-cyan-500',   bg: 'bg-cyan-50',   border: 'border-cyan-200' };
  if (cat.includes('computing'))             return { icon: Laptop,       color: 'text-cyan-600',   bg: 'bg-cyan-50',   border: 'border-cyan-200' };
  if (cat.includes('gaming accessories'))    return { icon: Headphones,   color: 'text-purple-400', bg: 'bg-purple-50', border: 'border-purple-200' };
  if (cat.includes('gaming'))                return { icon: Gamepad2,     color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' };
  if (cat.includes('tvs accessories'))       return { icon: Speaker,      color: 'text-slate-500',  bg: 'bg-slate-50',  border: 'border-slate-200' };
  if (cat.includes('tvs'))                   return { icon: Tv,           color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200' };
  if (cat.includes('small home appliance'))  return { icon: Microwave,    color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200' };
  if (cat.includes('medium home appliance')) return { icon: WashingMachine,color:'text-teal-500',  bg: 'bg-teal-50',   border: 'border-teal-200' };
  if (cat.includes('large home appliance'))  return { icon: Refrigerator, color: 'text-slate-600',  bg: 'bg-slate-100', border: 'border-slate-300' };
  if (cat.includes('electric scooters'))     return { icon: Bike,         color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-200' };
  if (cat.includes('health and beauty'))     return { icon: Scissors,     color: 'text-rose-500',   bg: 'bg-rose-50',   border: 'border-rose-200' };
  return { icon: Package, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
};

/* Ã¢ÂÂÃ¢ÂÂ Dropdown (same as LiveSkus) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
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

/* Ã¢ÂÂÃ¢ÂÂ Loader (same as LiveSkus) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function Loader() {
  return (
    <>
      <style>{`.jumia-loader{--dim:2.2rem;background-color:#f97316;opacity:0.55;width:var(--dim);height:var(--dim);border-radius:50%;display:grid;place-items:center;animation:spin_412 5s infinite;} .jumia-loader svg{transform:translateY(-1px) scale(.65);} @keyframes spin_412{0%{transform:rotate(0) scale(1);}50%{transform:rotate(720deg) scale(1.2);}100%{transform:rotate(0) scale(1);}}`}</style>
      <div className="jumia-loader">
        <svg version="1.1" viewBox="0 0 47.94 47.94" xmlns="http://www.w3.org/2000/svg">
          <path style={{ fill: '#fff' }} d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956c0.947-1.919,3.683-1.919,4.63,0z" />
        </svg>
      </div>
    </>
  );
}

/* Ã¢ÂÂÃ¢ÂÂ Types Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
interface CampaignDetailsProps {
  campaign: Campaign;
  onBack: () => void;
  userRole?: 'admin' | 'vendor' | null;
  vendorId?: string | null;
  vendorName?: string | null;
}

interface ProductEntry {
  sku: string;
  supplier_sku: string;
  brand: string;
  model_name: string;
  price_after: number;   // current live price
  promoPrice: string;    // editable
  promoStock: string;    // editable
}

/* Ã¢ÂÂÃ¢ÂÂ Main Component Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
export function CampaignDetails({ campaign, onBack, userRole, vendorId, vendorName }: CampaignDetailsProps) {
  const [entries, setEntries]                 = useState<ProductEntry[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [loadError, setLoadError]             = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{ id: string; time: string } | null>(null);
  const [isReviewing, setIsReviewing]         = useState(false);
  const [brandFilter, setBrandFilter]         = useState('');
  const [search, setSearch]                   = useState('');

  /* Load vendor's products from Supabase */
  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    const load = async () => {
      setLoading(true); setLoadError('');
      try {
        const r = await fetch(`/api/products?vendor_id=${vendorId}`);
        if (!r.ok) throw new Error('Failed to load products');
        const prods = (await r.json()) || [];
        setEntries(
          prods.map((p: any) => ({
            sku:          p.sku,
            supplier_sku: p.supplier_sku || '',
            brand:        p.brand || '',
            model_name:   p.model_name || '',
            price_after:  parseFloat(p.price_after) || 0,
            promoPrice:   '',
            promoStock:   '',
          }))
        );
      } catch (e: any) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vendorId]);

  /* Derived */
  const brands   = Array.from(new Set(entries.map(p => p.brand).filter(Boolean))).sort();
  const filtered = entries.filter(p => {
    const mb = !brandFilter || p.brand === brandFilter;
    const ms = !search
      || p.sku?.toLowerCase().includes(search.toLowerCase())
      || p.model_name?.toLowerCase().includes(search.toLowerCase());
    return mb && ms;
  });
  const readyEntries = entries.filter(
    e => e.promoPrice && parseFloat(e.promoPrice) > 0 && e.promoStock && parseInt(e.promoStock) > 0
  );

  const updateEntry = (sku: string, field: 'promoPrice' | 'promoStock', value: string) =>
    setEntries(prev => prev.map(e => e.sku === sku ? { ...e, [field]: value } : e));

  const fmt = (n: number) => (n > 0 ? `EGP ${n.toLocaleString()}` : 'Ã¢ÂÂ');

  const handleSubmit = async () => {
    if (readyEntries.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId:  campaign.id,
          vendorId:    vendorId   || null,
          vendorName:  vendorName || null,
          products:    readyEntries.map(p => ({ sku: p.sku, price: p.promoPrice, stock: p.promoStock })),
        }),
      });
      const data = await res.json();
      if (data.success) setSubmissionSuccess({ id: data.submissionId, time: data.timestamp });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /* Ã¢ÂÂÃ¢ÂÂ Success screen Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
  if (submissionSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-12 text-center max-w-lg mx-auto mt-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
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
        <button
          onClick={onBack}
          className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  /* Ã¢ÂÂÃ¢ÂÂ Left panel (campaign info) Ã¢ÂÂ unchanged Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
  const LeftPanel = (
    <div className="w-full lg:w-[240px] flex flex-col gap-4 shrink-0 lg:h-full lg:overflow-y-auto lg:pr-1 pb-4">
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
          <span className="w-1.5 h-6 bg-orange-500 rounded-full inline-block" />
          Campaign Details
        </h3>
        <div className="space-y-6 relative z-10">
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2">Active Campaign</p>
            {(() => {
              const style = getCampaignStyle(campaign.name);
              const Icon = style.icon;
              return (
                <div className={clsx('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ring-1 shadow-sm', style.bg, style.ring, style.text)}>
                  <Icon className={clsx('w-4 h-4', style.iconColor)} />
                  <p className="text-sm font-bold leading-none">{campaign.name}</p>
                </div>
              );
            })()}
          </div>

          <div className="flex flex-col gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-red-500" /> Deadline
              </p>
              <p className="text-sm font-bold text-red-600 bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100">
                {safeFormat(campaign.rules?.submissionDeadline, 'MMM d, yyyy')}
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
            {campaign.rules?.notes && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
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
              {campaign.rules?.eligibleCategories?.map(cat => {
                const style = getCategoryStyle(cat);
                const Icon = style.icon;
                return (
                  <span key={cat} className={clsx('px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5', style.bg, style.color, style.border)}>
                    <Icon className={clsx('w-3 h-3', style.color)} />
                    {cat}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* Ã¢ÂÂÃ¢ÂÂ Admin view Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
  if (userRole === 'admin') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-6 h-full lg:h-[calc(100vh-140px)] min-h-[500px]">
        {LeftPanel}
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
      </motion.div>
    );
  }

  /* Ã¢ÂÂÃ¢ÂÂ Review state Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
  if (isReviewing) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-6 h-full lg:h-[calc(100vh-140px)] min-h-[500px]">
        {LeftPanel}
        <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden relative h-[500px] lg:h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 relative">
            <div>
              <h3 className="text-lg font-black text-slate-900">Review &amp; Confirm Prices</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Please review your final promotional offers before submitting to Jumia Admin.</p>
            </div>
            <div className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl text-xs font-black">
              {readyEntries.length} Items Ready
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3 pb-24 bg-slate-50/30">
            {readyEntries.map(p => {
              const promo = parseFloat(p.promoPrice) || 0;
              const discount = p.price_after > 0 ? ((p.price_after - promo) / p.price_after) * 100 : 0;
              return (
                <div key={p.sku} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h4 className="text-sm font-black text-slate-800 truncate">{p.model_name || p.sku}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{p.sku} ÃÂ· {p.brand}</p>
                    {p.supplier_sku && (
                      <p className="text-[10px] text-slate-300 font-mono mt-0.5">{p.supplier_sku}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-center sm:text-right shrink-0">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Current Price</span>
                      <span className="text-xs font-bold text-slate-500">{fmt(p.price_after)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black text-orange-500 block tracking-wider">Promo Price</span>
                      <span className="text-sm font-black text-slate-900">{promo.toLocaleString()} EGP</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black text-emerald-500 block tracking-wider">Promo Stock</span>
                      <span className="text-sm font-black text-slate-900">{p.promoStock} units</span>
                    </div>
                  </div>
                  {discount > 0 && (
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs font-black shrink-0">
                      {discount.toFixed(1)}% Off
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-slate-200 flex justify-between items-center shadow-[0_-4px_12px_rgb(0,0,0,0.02)]">
            <button
              onClick={() => setIsReviewing(false)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all text-xs flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back &amp; Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <UploadCloud className="w-4 h-4" />}
              Confirm &amp; Final Submit
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* Ã¢ÂÂÃ¢ÂÂ Main promotional-prices table Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row gap-6 h-full lg:h-[calc(100vh-140px)] min-h-[500px]">
      {LeftPanel}

      <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden relative h-[500px] lg:h-full">

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 flex-nowrap">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Promotional Prices</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Enter promotional prices and stock for your products.</p>
          </div>

          {/* Filters */}
          <div className="ml-auto flex items-center gap-3 flex-nowrap">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search SKU or model..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-slate-50 hover:bg-white w-44"
              />
            </div>

            {/* Brand filter */}
            <div className="w40 z-20">
              <Dropdown
                value={brandFilter}
                onChange={setBrandFilter}
                options={brands.map(b => ({ label: b, value: b }))}
                placeholder="All Brands"
                className="rounded-xl py-2 px-3"
              />
            </div>

            {/* Count */}
            {!loading && (
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {readyEntries.length > 0
                  ? <><span className="font-bold text-orange-500">{readyEntries.length}</span> / {entries.length} ready</>
                  : `${filtered.length} / ${entries.length} products`}
              </span>
            )}
          </div>
        </div>

        {/* Table area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[120px]">
              <Loader />
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl text-xs max-w-md text-center">
                <p className="font-bold mb-1">Failed to load products</p>
                <p>{loadError}</p>
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
              <Package className="w-10 h-10 text-slate-200" />
              <p className="text-xs font-semibold text-slate-500">No products in your catalog yet. Ask your admin to upload your SKUs first.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
              <Package className="w-10 h-10 text-slate-200" />
              <p className="text-xs font-semibold text-slate-500">No products match your filters.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <colgroup>
                <col style={{ width: '115px' }} />   {/* SKU */}
                <col style={{ width: '140px' }} />   {/* Supplier SKU */}
                <col style={{ width: '105px' }} />   {/* Brand */}
                <col />                               {/* Model Name Ã¢ÂÂ auto */}
                <col style={{ width: '120px' }} />   {/* Current Price */}
                <col style={{ width: '155px' }} />   {/* Promo Price */}
                <col style={{ width: '115px' }} />   {/* Promo Stock */}
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="bg-orange-50 border-b border-orange-200 text-orange-600">
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">SKU</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Supplier SKU</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Brand</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Model Name</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide">Current Price</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide text-orange-700 bg-orange-100/60">Promo Price</th>
                  <th className="px-4 py-3 text-center font-semibold tracking-wide text-orange-700 bg-orange-100/60">Promo Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => {
                  const hasPromo = p.promoPrice && parseFloat(p.promoPrice) > 0;
                  const hasStock = p.promoStock && parseInt(p.promoStock) > 0;
                  return (
                    <tr
                      key={p.sku}
                      className={clsx(
                        'transition-colors duration-100',
                        hasPromo && hasStock
                          ? 'bg-orange-50/40 hover:bg-orange-50'
                          : 'bg-white hover:bg-slate-50'
                      )}
                    >
                      {/* SKU */}
                      <td className="px-4 py-3 text-center font-mono text-slate-700">{p.sku}</td>

                      {/* Supplier SKU */}
                      <td className="px-4 py-3 text-center font-mono text-slate-500 truncate max-w-[170px]" title={p.supplier_sku}>
                        {p.supplier_sku || 'Ã¢ÂÂ'}
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3 text-center">
                        <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md shadow-sm">
                          {p.brand || 'Ã¢ÂÂ'}
                        </span>
                      </td>

                      {/* Model Name */}
                      <td className="px-4 py-3 text-left text-slate-700">
                        <span className="block truncate" title={p.model_name}>{p.model_name || 'Ã¢ÂÂ'}</span>
                      </td>

                      {/* Current Price */}
                      <td className="px-4 py-3 text-center font-mono text-slate-500">
                        {fmt(p.price_after)}
                      </td>

                      {/* Promo Price */}
                      <td className="px-4 py-3 text-center bg-orange-50/20">
                        <input
                          type="number"
                          min={0}
                          value={p.promoPrice}
                          onChange={e => updateEntry(p.sku, 'promoPrice', e.target.value)}
                          placeholder="Enter price"
                          className={clsx(
                            'w-full text-center focus:outline-none font-bold text-[11px] px-2 py-1.5 rounded-lg transition-colors border',
                            hasPromo
                              ? 'text-orange-700 bg-white border-orange-200 ring-1 ring-orange-200 shadow-sm'
                              : 'text-slate-600 bg-white border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-300 shadow-sm'
                          )}
                        />
                      </td>

                      {/* Promo Stock */}
                      <td className="px-4 py-3 text-center bg-orange-50/20">
                        <input
                          type="number"
                          min={0}
                          value={p.promoStock}
                          onChange={e => updateEntry(p.sku, 'promoStock', e.target.value)}
                          placeholder="Units"
                          className={clsx(
                            'w-full text-center focus:outline-none font-bold text-[11px] px-2 py-1.5 rounded-lg transition-colors border',
                            hasStock
                              ? 'text-orange-700 bg-white border-orange-200 ring-1 ring-orange-200 shadow-sm'
                              : 'text-slate-600 bg-white border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-300 shadow-sm'
                          )}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Ã¢ÂÂ submit */}
        {!loading && entries.length > 0 && (
          <div className="px-5 py-4 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center justify-between shadow-[0_-4px_12px_rgb(0,0,0,0.02)]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
              Fill Promo Price &amp; Stock to mark a product ready
            </p>
            <button
              onClick={() => setIsReviewing(true)}
              disabled={readyEntries.length === 0 || submitting}
              className="ml-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Eye className="w-4 h-4" />
              Review Promotional Prices
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
