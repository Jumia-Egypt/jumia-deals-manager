import React, { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, ShoppingCart, Package, Calendar, Info } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface MyPerformanceProps {
  vendorId?: string | null;
}

export function MyPerformance({ vendorId }: MyPerformanceProps) {
  const [activeMetric, setActiveMetric] = useState<'gmv' | 'orders' | 'items'>('gmv');
  const [vendorData, setVendorData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const hoveredDayRef = useRef<any>(null);

  useEffect(() => {
    setSelectedDay(null);
    hoveredDayRef.current = null;
  }, [vendorId]);

  useEffect(() => {
    if (!vendorId) return;

    // Get vendor name + targetGMV from localStorage (stored by admin panel)
    let vendorName = 'My Store';
    let targetGMV = 200000;
    try {
      const saved = localStorage.getItem('vendorsData');
      if (saved) {
        const vs = JSON.parse(saved);
        const found = vs.find((v: any) => v.id === vendorId);
        if (found) { vendorName = found.name || vendorName; targetGMV = found.targetGMV || targetGMV; }
      }
    } catch {}

    // Fetch models GIS data from Supabase via API
    fetch(`/api/models?vendor_id=${vendorId}`)
      .then(r => r.json())
      .then(rows => { if (Array.isArray(rows)) window.__modelsData = rows; })
      .catch(() => {});

    // Fetch daily performance from Supabase via API
    fetch(`/api/performance?vendor_id=${vendorId}`)
      .then(r => r.json())
      .then(rows => {
        if (!Array.isArray(rows) || rows.length === 0) {
          setVendorData({ id: vendorId, name: vendorName, targetGMV, achievementGMV: 0, countOfOrders: 0, grossItemSold: 0, dailyData: [] });
          return;
        }
        const dailyData = rows.map((r: any) => ({
          date: (() => {
            try {
              const d = new Date(r.date + 'T00:00:00');
              return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            } catch { return r.date; }
          })(),
          gmv: Number(r.gmv),
          orders: Number(r.gross_orders),
          items: Number(r.gross_items),
          rawDate: r.date,
        }));
        const achievementGMV = dailyData.reduce((s: number, r: any) => s + r.gmv, 0);
        const countOfOrders  = dailyData.reduce((s: number, r: any) => s + r.orders, 0);
        const grossItemSold  = dailyData.reduce((s: number, r: any) => s + r.items, 0);
        setVendorData({ id: vendorId, name: vendorName, targetGMV, achievementGMV, countOfOrders, grossItemSold, dailyData });
      })
      .catch(() => {
        setVendorData({ id: vendorId, name: vendorName, targetGMV, achievementGMV: 0, countOfOrders: 0, grossItemSold: 0, dailyData: [] });
      });
  }, [vendorId]);

  if (!vendorData) {
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <style>{`.jumia-loader{--dim:2.2rem;background-color:#f97316;opacity:0.55;width:var(--dim);height:var(--dim);border-radius:50%;display:grid;place-items:center;animation:spin_412 5s infinite;} .jumia-loader svg{transform:translateY(-1px) scale(.65);} @keyframes spin_412{0%{transform:rotate(0) scale(1);}50%{transform:rotate(720deg) scale(1.2);}100%{transform:rotate(0) scale(1);}}`}</style>
        <div className="jumia-loader">
          <svg version="1.1" viewBox="0 0 47.94 47.94" xmlns="http://www.w3.org/2000/svg">
            <path style={{fill:'#fff'}} d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956c0.947-1.919,3.683-1.919,4.63,0z"/>
          </svg>
        </div>
      </div>
    );
  }

  const targetGMV = vendorData.targetGMV || 0;
  const currentGMV = vendorData.achievementGMV || 0;
  const progress = targetGMV > 0 ? (currentGMV / targetGMV) * 100 : 0;
  const totalOrders = vendorData.countOfOrders || 0;
  const totalItems = vendorData.grossItemSold || 0;
  const chartData = vendorData.dailyData || [];

  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'gmv': return { key: 'gmv', name: 'GMV (EGP)', color: '#f97316' };
      case 'orders': return { key: 'orders', name: 'Count of Orders', color: '#3b82f6' };
      case 'items': return { key: 'items', name: 'Gross Items Sold', color: '#8b5cf6' };
    }
  };

  const config = getMetricConfig();

  // Build models list from Supabase API data (window.__modelsData) or fall back to empty
  const getActiveModelsList = () => {
    const apiModels: any[] = (window as any).__modelsData || [];
    if (apiModels.length === 0) return [];

    if (selectedDay) {
      const filtered = apiModels.filter((r: any) => r.date === selectedDay.rawDate);
      const total = filtered.reduce((s: number, r: any) => s + Number(r.gross_items || 0), 0);
      return filtered
        .map((r: any) => ({ name: r.model_name, sold: Number(r.gross_items || 0), percentage: total > 0 ? (Number(r.gross_items || 0) / total) * 100 : 0 }))
        .sort((a: any, b: any) => b.sold - a.sold);
    } else {
      const agg: Record<string, number> = {};
      apiModels.forEach((r: any) => { agg[r.model_name] = (agg[r.model_name] || 0) + Number(r.gross_items || 0); });
      const total = Object.values(agg).reduce((s, v) => s + v, 0);
      return Object.entries(agg)
        .map(([name, sold]) => ({ name, sold, percentage: total > 0 ? (sold / total) * 100 : 0 }))
        .sort((a: any, b: any) => b.sold - a.sold);
    }
  };

  const modelsList = getActiveModelsList();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Performance</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Track your campaign achievements against your targets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GMV Target Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 rounded-full blur-2xl group-hover:bg-orange-100 transition-colors duration-500"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="p-3.5 rounded-2xl bg-orange-100/80 text-orange-600 shadow-inner">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Needed Target (GMV)</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">{targetGMV.toLocaleString()} <span className="text-xl font-bold text-slate-400">EGP</span></h3>
            </div>
          </div>
          <div className="space-y-3 mt-2 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Achievement</p>
                <p className="text-xl font-bold text-orange-600">{currentGMV.toLocaleString()} EGP</p>
              </div>
              <p className="text-2xl font-black text-slate-900">{progress.toFixed(1)}%</p>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders & Items Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 rounded-full blur-2xl group-hover:bg-orange-100 transition-colors duration-500"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-orange-50/50 rounded-full blur-2xl"></div>
          <div className="relative z-10 grid grid-cols-2 gap-8 h-full items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="p-2 rounded-xl bg-orange-100/80 text-orange-600 shadow-inner">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Total Orders</span>
              </div>
              <p className="text-4xl font-black tracking-tight text-slate-900">{totalOrders.toLocaleString()}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="p-2 rounded-xl bg-orange-100/80 text-orange-600 shadow-inner">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Gross Items</span>
              </div>
              <p className="text-4xl font-black tracking-tight text-slate-900">{totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Daily Progress</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Click on the graph to view daily details</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
            <button onClick={() => setActiveMetric('gmv')} className={clsx("px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 outline-none", activeMetric === 'gmv' ? "bg-white text-orange-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}>GMV</button>
            <button onClick={() => setActiveMetric('orders')} className={clsx("px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 outline-none", activeMetric === 'orders' ? "bg-white text-blue-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}>Orders</button>
            <button onClick={() => setActiveMetric('items')} className={clsx("px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 outline-none", activeMetric === 'items' ? "bg-white text-purple-600 shadow-sm scale-105" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}>Gross IS</button>
          </div>
        </div>

        <div className="h-[400px] w-full">
  #       {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }} barSize={40}
                onMouseMove={(state: any) => { if (state && typeof state.activeTooltipIndex === 'number' && chartData[state.activeTooltipIndex]) hoveredDayRef.current = chartData[state.activeTooltipIndex]; }}
                onClick={() => { if (hoveredDayRef.current) setSelectedDay(hoveredDayRef.current); }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.color} stopOpacity={1}/>
                    <stop offset="100%" stopColor={config.color} stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 600 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(val) => activeMetric === 'gmv' ? `${(val/1000)}k` : val} dx={-15} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', padding: '12px 16px' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: '800', fontSize: '16px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  cursor={{ fill: '#f8fafc22' }}
                  formatter={(value: number) => [activeMetric === 'gmv' ? `${value.toLocaleString()} EGP` : value.toLocaleString(), config.name]}
                />
                <Bar dataKey={config.key} fill="url(#barGradient)" radius={[8, 8, 0, 0]}
                  onClick={(data: any) => { if (data && data.payload) setSelectedDay(data.payload); }}
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`}
                      fill={selectedDay && selectedDay.date === entry.date ? config.color : 'url(#barGradient)'}
                      opacity={selectedDay && selectedDay.date !== entry.date ? 0.4 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <TrendingUp className="w-8 h-8 mb-3 text-slate-300" />
              <p className="font-medium">No daily data available yet.</p>
            </div>
          )}
        </div>

        {/* Quick Select Date Pills */}
        {chartData.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2.5 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex flex-wrap gap-2.5 items-center">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1 mr-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Quick Select Date:
              </span>
              {chartData.map((day: any) => {
                const isSelected = selectedDay && selectedDay.date === day.date;
                return (
                  <button key={day.date} type="button" onClick={() => setSelectedDay(day)}
                    className={clsx(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all outline-none",
                      isSelected
                        ? "bg-orange-600 text-white shadow-md scale-105 border border-orange-600"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 active:scale-95 shadow-sm"
                    )}
                  >
                    {day.date}
                  </button>
                );
              })}
            </div>
            {selectedDay && (
              <button type="button" onClick={() => setSelectedDay(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 hover:border-orange-300 active:scale-95 shadow-sm outline-none flex items-center gap-1.5"
              >
                Clear Selection
              </button>
            )}
          </div>
        )}

        {/* Daily Breakdown */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div key={selectedDay.date} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl text-orange-600 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    Daily Breakdown for <span className="text-orange-600 font-black">{selectedDay.date}</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-slate-50 p-5 rounded-2xl flex items-center gap-4 hover:bg-slate-100 group transition-colors">
                    <div className="p-3 bg-orange-100/50 rounded-xl text-orange-600 group-hover:bg-orange-100 transition-colors">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">GMV Achievement</p>
                      <p className="text-xl font-black text-slate-900">{Number(selectedDay.gmv || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">EGP</span></p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl flex items-center gap-4 hover:bg-slate-100 group transition-colors">
                    <div className="p-3 bg-blue-100/50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Count of Orders</p>
                      <p className="text-xl font-black text-slate-900">{Number(selectedDay.orders || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">Orders</span></p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl flex items-center gap-4 hover:bg-slate-100 group transition-colors">
                    <div className="p-3 bg-purple-100/50 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Gross Items Sold</p>
                      <p className="text-xl font-black text-slate-900">{Number(selectedDay.items || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">Items</span></p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 text-sm font-semibold text-slate-500 bg-white p-5 rounded-2xl border border-slate-200 border-dashed"
              >
                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <span>Click on any date point inside the graph above to view its detailed breakdown for GMV, Orders, and Gross IS.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Model Sales Distribution Table */}
      {modelsList.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {selectedDay ? `Model Sales Breakdown: ${selectedDay.date}` : 'Model Sales Distribution'}
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                {selectedDay ? `Detailed item sales for models sold on ${selectedDay.date}.` : 'Cumulative item sales for all time.'}
              </p>
            </div>
            <div className="self-start sm:self-center px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              {selectedDay ? 'Day View' : 'All-time totals'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <th className="pb-4">Model Name</th>
                  <th className="pb-4 text-right">Items Sold</th>
                  <th className="pb-4 text-right">Volume Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modelsList.map((model: any) => (
                  <tr key={model.name} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"></span>
                      {model.name}
                    </td>
                    <td className="py-4 text-sm font-black text-slate-900 text-right">{model.sold.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xs font-bold text-slate-500">{model.percentage.toFixed(1)}%</span>
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                          <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${model.percentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
