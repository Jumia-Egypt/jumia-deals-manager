import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Download, Search, Filter, 
  ChevronDown, ChevronUp, ArrowUpRight, ShieldCheck, Tag, ShoppingBag, Eye, Calendar, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface ProductSubmission {
  sku: string;
  name: string;
  category: string;
  brand: string;
  livePrice: number;
  bestPrice?: number;
  promoPrice: number;
  promoStock: number;
  status: string;
}

interface Submission {
  id: string;
  campaignId: string;
  campaignName: string;
  vendorId: string;
  vendorName: string;
  timestamp: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  products: ProductSubmission[];
}

interface SubmissionsDashboardProps {
  userRole: 'admin' | 'vendor' | null;
  vendorId: string | null;
}

export function SubmissionsDashboard({ userRole, vendorId }: SubmissionsDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const url = userRole === 'vendor' && vendorId 
        ? `/api/submissions?vendorId=${vendorId}` 
        : '/api/submissions';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (err) {
      setError('Network error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [userRole, vendorId]);

  const handleUpdateStatus = async (subId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/submissions/${subId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(prev => prev.map(s => s.id === subId ? data.submission : s));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleUpdateProductStatus = async (subId: string, sku: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/submissions/${subId}/products/${sku}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(prev => prev.map(s => s.id === subId ? data.submission : s));
      }
    } catch (err) {
      console.error('Error updating product status:', err);
    }
  };

  const handleDownloadSubmission = (sub: Submission) => {
    const headers = [
      'Submission ID',
      'Campaign Name',
      'Vendor ID',
      'Vendor Name',
      'Submission Date',
      'SKU',
      'Product Name',
      'Category',
      'Brand',
      'Live Price (EGP)',
      'Best Price (EGP)',
      'Promo Price (EGP)',
      'Promo Stock (Units)',
      'Discount %'
    ];

    const approvedProducts = sub.products.filter(p => p.status === 'Approved');
    if (approvedProducts.length === 0) {
      alert("No approved SKUs in this submission to download!");
      return;
    }

    const rows = approvedProducts.map(p => {
      const discount = ((p.livePrice - p.promoPrice) / p.livePrice) * 100;
      return [
        sub.id,
        sub.campaignName,
        sub.vendorId,
        sub.vendorName,
        new Date(sub.timestamp).toLocaleString(),
        p.sku,
        p.name || '',
        p.category || '',
        p.brand || '',
        p.livePrice,
        p.bestPrice || '',
        p.promoPrice,
        p.promoStock,
        discount.toFixed(2)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `submission_${sub.id}_${sub.vendorName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAllSubmissions = async () => {
    if (!window.confirm('â ï¸ Delete ALL submissions from the database? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/submissions', { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setSubmissions([]);
    } catch (err) {
      console.error('Delete all failed:', err);
    }
  };

  const handleDownloadAll = (subsList: Submission[]) => {
    if (subsList.length === 0) return;
    
    const headers = [
      'Submission ID',
      'Campaign Name',
      'Vendor ID',
      'Vendor Name',
      'Submission Date',
      'Status',
      'SKU',
      'Product Name',
      'Category',
      'Brand',
      'Live Price (EGP)',
      'Best Price (EGP)',
      'Promo Price (EGP)',
      'Promo Stock (Units)',
      'Discount %'
    ];

    const rows: any[] = [];
    subsList.forEach(sub => {
      const approvedProducts = sub.products.filter(p => p.status === 'Approved');
      approvedProducts.forEach(p => {
        const discount = ((p.livePrice - p.promoPrice) / p.livePrice) * 100;
        rows.push([
          sub.id,
          sub.campaignName,
          sub.vendorId,
          sub.vendorName,
          new Date(sub.timestamp).toLocaleString(),
          sub.status,
          p.sku,
          p.name || '',
          p.category || '',
          p.brand || '',
          p.livePrice,
          p.bestPrice || '',
          p.promoPrice,
          p.promoStock,
          discount.toFixed(2)
        ]);
      });
    });

    if (rows.length === 0) {
      alert("No approved SKUs found in any of the listed submissions to download!");
      return;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map((val: any) => {
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `all_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleExpand = (subId: string) => {
    setExpandedSubId(prev => prev === subId ? null : subId);
  };

  // Filter and search logic
  const filteredSubmissions = submissions.filter(sub => {
    let matchesStatus = false;
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else if (statusFilter === 'Approved') {
      matchesStatus = sub.status === 'Approved' || sub.status === 'Partially Approved';
    } else {
      matchesStatus = sub.status === statusFilter;
    }
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      sub.id.toLowerCase().includes(searchLower) ||
      sub.campaignName.toLowerCase().includes(searchLower) ||
      sub.vendorName.toLowerCase().includes(searchLower) ||
      sub.products.some(p => p.sku.toLowerCase().includes(searchLower) || p.name.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6" id="submissions-dashboard">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            {userRole === 'admin' ? "Vendors' Pricing Submissions" : "My Campaign Submissions"}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {userRole === 'admin' 
              ? "Review, approve, or reject promotional prices submitted by marketplace vendors."
              : "Track the review and approval status of your submitted promotional offers."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          {userRole === 'admin' && filteredSubmissions.length > 0 && (
            <>
            <button
              onClick={() => handleDownloadAll(filteredSubmissions)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/15 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All (CSV)</span>
            </button>
            <button
              onClick={handleDeleteAllSubmissions}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              ð <span>Delete All</span>
            </button>
            </>
          )}
          <button 
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] mb-6 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, Product Name, Vendor, Submission ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/10 text-sm placeholder:text-slate-400 transition-colors"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 shrink-0 w-full md:w-auto">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(f => {
            const isActive = statusFilter === f;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={clsx(
                  "flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  isActive 
                    ? "bg-white shadow text-slate-900 border border-slate-200/50" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Fetching active submissions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-1">Could not load submissions</h3>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <ShoppingBag className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">No Submissions Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            {searchQuery || statusFilter !== 'All'
              ? "We couldn't find any submissions matching your search filters. Try adjusting them."
              : userRole === 'admin' 
                ? "No vendors have submitted promo pricing yet. Go to the Vendor Portal to submit SKUs."
                : "You haven't submitted any prices yet. Open a campaign from the calendar tab to submit promotional SKUs."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.map((sub) => {
              const isExpanded = expandedSubId === sub.id;
              
              // Count variables
              const totalItems = sub.products.length;
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={sub.id}
                  className={clsx(
                    "bg-white border rounded-2xl transition-all shadow-sm overflow-hidden",
                    sub.status === 'Approved' ? "border-emerald-100 hover:border-emerald-200" :
                    sub.status === 'Partially Approved' ? "border-indigo-100 hover:border-indigo-200 bg-indigo-50/5" :
                    sub.status === 'Rejected' ? "border-red-100 hover:border-red-200" :
                    "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {/* Submission Header Card */}
                  <div 
                    onClick={() => toggleExpand(sub.id)}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                        sub.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        sub.status === 'Partially Approved' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                        sub.status === 'Rejected' ? "bg-red-50 text-red-600 border-red-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {sub.status === 'Approved' && <CheckCircle2 className="w-6 h-6" />}
                        {sub.status === 'Partially Approved' && <ShieldCheck className="w-6 h-6 text-indigo-500" />}
                        {sub.status === 'Rejected' && <XCircle className="w-6 h-6" />}
                        {sub.status === 'Pending' && <Clock className="w-6 h-6 animate-pulse" />}
                      </div>

                      {/* Info Panel */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            {sub.id}
                          </span>
                          <span className={clsx(
                            "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm",
                            sub.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            sub.status === 'Partially Approved' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                            sub.status === 'Rejected' ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          )}>
                            {sub.status}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mt-2 flex items-center gap-1.5">
                          {sub.campaignName}
                        </h4>
                        
                        {/* Meta Rows */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            Vendor: <strong className="text-slate-700 font-bold">{sub.vendorName} (ID: {sub.vendorId})</strong>
                          </span>
                          <span className="hidden sm:inline text-slate-300">Ã¢ÂÂ¢</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Submitted: <strong className="text-slate-700 font-bold">{new Date(sub.timestamp).toLocaleString()}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Header Right Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right flex flex-col items-start lg:items-end gap-1.5">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Submitted SKUs</p>
                          <p className="text-lg font-black text-slate-800 leading-none mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                        </div>
                        {/* SKU Breakdown counters */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sub.products.filter(p => p.status === 'Approved').length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {sub.products.filter(p => p.status === 'Approved').length} Approved
                            </span>
                          )}
                          {sub.products.filter(p => p.status === 'Rejected').length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              {sub.products.filter(p => p.status === 'Rejected').length} Rejected
                            </span>
                          )}
                          {sub.products.filter(p => p.status === 'Pending').length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              {sub.products.filter(p => p.status === 'Pending').length} Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        {userRole === 'admin' && sub.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(sub.id, 'Approved')}
                              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(sub.id, 'Rejected')}
                              className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/10 flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => toggleExpand(sub.id)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 transition-colors"
                          title="View SKUs Breakdown"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDownloadSubmission(sub)}
                            className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl border border-orange-200 transition-colors"
                            title="Download Submission CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submission Expanded Section (Products Grid/Table) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-200 bg-slate-50/50"
                      >
                        <div className="p-5">
                          <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">Products and Pricing Breakdown</h5>
                          
                          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                  <th className="p-3 pl-4">SKU Code</th>
                                  <th className="p-3">Product Name</th>
                                  <th className="p-3">Category</th>
                                  <th className="p-3 text-right">Current Price</th>
                                  <th className="p-3 text-right text-emerald-600 bg-emerald-50/30">Best Price</th>
                                  <th className="p-3 text-right text-orange-600 bg-orange-50/30">Promo Price</th>
                                  <th className="p-3 text-right text-orange-600 bg-orange-50/30">Promo Stock</th>
                                  <th className="p-3 text-center">Discount</th>
                                  <th className="p-3 text-center">Status</th>
                                  {userRole === 'admin' && (
                                    <th className="p-3 text-center">Review Action</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {sub.products.map((p, i) => {
                                  const discount = ((p.livePrice - p.promoPrice) / p.livePrice) * 100;
                                  const statusColors = {
                                    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                    Rejected: "bg-red-50 text-red-700 border-red-200",
                                    Pending: "bg-amber-50 text-amber-700 border-amber-200"
                                  };
                                  return (
                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 text-xs text-slate-700">
                                      <td className="p-3 pl-4 font-mono font-bold text-slate-600">{p.sku}</td>
                                      <td className="p-3 font-bold text-slate-800">{p.name}</td>
                                      <td className="p-3 font-semibold text-slate-500">{p.category}</td>
                                      <td className="p-3 text-right font-bold text-slate-500">{p.livePrice.toLocaleString()} EGP</td>
                                      <td className="p-3 text-right font-bold text-emerald-600 bg-emerald-50/10">{p.bestPrice ? `${p.bestPrice.toLocaleString()} EGP` : '--'}</td>
                                      <td className="p-3 text-right font-black text-slate-900 bg-orange-50/10">{p.promoPrice.toLocaleString()} EGP</td>
                                      <td className="p-3 text-right font-black text-slate-900 bg-orange-50/10">{p.promoStock} units</td>
                                      <td className="p-3 text-center">
                                        <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded font-black border border-green-100 text-[10px]">
                                          {discount.toFixed(1)}% Off
                                        </span>
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className={clsx(
                                          "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm",
                                          statusColors[p.status as keyof typeof statusColors] || "bg-slate-50 text-slate-700 border-slate-200"
                                        )}>
                                          {p.status || 'Pending'}
                                        </span>
                                      </td>
                                      {userRole === 'admin' && (
                                        <td className="p-3 text-center">
                                          <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                                            <button
                                              onClick={() => handleUpdateProductStatus(sub.id, p.sku, 'Approved')}
                                              disabled={p.status === 'Approved'}
                                              className={clsx(
                                                "p-1.5 rounded-lg border transition-all",
                                                p.status === 'Approved' 
                                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600 cursor-not-allowed opacity-60" 
                                                  : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                                              )}
                                              title="Approve SKU"
                                            >
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => handleUpdateProductStatus(sub.id, p.sku, 'Rejected')}
                                              disabled={p.status === 'Rejected'}
                                              className={clsx(
                                                "p-1.5 rounded-lg border transition-all",
                                                p.status === 'Rejected' 
                                                  ? "bg-red-50 border-red-200 text-red-600 cursor-not-allowed opacity-60" 
                                                  : "bg-white border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                              )}
                                              title="Reject SKU"
                                            >
                                              <XCircle className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
