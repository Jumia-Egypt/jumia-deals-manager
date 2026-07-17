import React, { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, ShoppingCart, Package, Calendar, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface MyPerformanceProps {
  vendorId?: string | null;
}

export function MyPerformance({ vendorId }: MyPerformanceProps) {
  const [activeMetric, setActiveMetric] = useState<'gmv' | 'orders' | 'items'>('gmv');
  const [vendorData, setVendorData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [modelsData, setModelsData] = useState<any[]>([]);
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
      .then(rows => { if (Array.isArray(rows)) setModelsData(rows); })
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Performance</h2>
        <p className="text-sm text-slate-500 mt-1">Track your campaign achievements against your targets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Needed Target (GMV)</p>
              <h3 className="text-3xl font-black text-slate-900">{targetGMV.toLocaleString()} <span className="text-lg text-slate-400">EGP</span></h3>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-500">Current Achievement</p>
                <p className="text-lg font-bold text-orange-600">{currentGMV.toLocaleString()} EGP</p>
              </div>
              <p className="text-xl font-black text-slate-900">{progress.toFixed(1)}%</p>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              </div>
              <p className="text-3xl font-black">{totalOrders.toLocaleString()}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Package className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Gross Items</span>
              </div>
              <p className="text-3xl font-black">{totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h3 className="text-lg font-bold text-slate-900">Daily Progress</h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveMetric('gmv')}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-bold transition-all",
                activeMetric === 'gmv' ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              GMV
            </button>
            <button
              onClick={() => setActiveMetric('orders')}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-bold transition-all",
                activeMetric === 'orders' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveMetric('items')}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-bold transition-all",
                activeMetric === 'items' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Gross IS
            </button>
          </div>
        </div>

        <div className="h-[350px] w-full">
          {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              className="cursor-pointer"
              onMouseMove={(state: any) => {
                if (state && typeof state.activeTooltipIndex === 'number' && chartData[state.activeTooltipIndex]) {
                  hoveredDayRef.current = chartData[state.activeTooltipIndex];
                }
              }}
              onClick={() => {
                if (hoveredDayRef.current) {
                  setSelectedDay(hoveredDayRef.current);
                }
              }}
            >
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(val) => activeMetric === 'gmv' ? `${(val/1000)}k` : val}
                dx={-10}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                formatter={(value: number) => [
                  activeMetric === 'gmv' ? `${value.toLocaleString()} EGP` : value.toLocaleString(),
                  config.name
                ]}
              />
              <Area
                type="monotone"
                dataKey={config.key}
                stroke={config.color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMetric)"
                dot={{ r: 4, stroke: config.color, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 7, stroke: config.color, strokeWidth: 2, fill: '#fff' }}
                onClick={(data: any) => {
                  if (data && data.payload) {
                    setSelectedDay(data.payload);
                  }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
              No daily data available yet.
            </div>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider ml-1 mr-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Quick Select Date:
            </span>
            {chartData.map((day: any) => {
              const isSelected = selectedDay && selectedDay.date === day.date;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border",
                    isSelected
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm scale-105"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95"
                  )}
                >
                  {day.date}
                </button>
              );
            })}
          </div>
        )}


        {modelsData.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Model Performance — GIS</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedDay ? `Items sold on ${selectedDay.date}` : 'All-time totals'}
                </p>
              </div>
              {selectedDay && (
                <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                  {selectedDay.date}
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {(() => {
                const filtered = selectedDay
                  ? modelsData.filter((r: any) => r.date === selectedDay.date)
                  : modelsData;
                const grouped: Record<string, number> = {};
                filtered.forEach((r: any) => {
                  grouped[r.model_name] = (grouped[r.model_name] || 0) + Number(r.gross_items || 0);
                });
                const sorted = Object.entries(grouped)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .filter(([, v]) => (v as number) > 0);
                if (sorted.length === 0) return (
                  <p className="text-xs text-slate-400 text-center py-6">No items sold{selectedDay ? ' on this day' : ''}</p>
                );
                return sorted.map(([name, items]) => (
                  <div key={name} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <span className="text-xs text-slate-700 flex-1 mr-4 leading-snug">{name}</span>
                    <span className="text-xs font-bold text-orange-600 shrink-0 tabular-nums">{items as number} units</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100">
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div
                key={selectedDay.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-50 rounded-lg text-orange-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Daily Breakdown for <span className="text-orange-600 font-extrabold">{selectedDay.date}</span>
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3.5 transition-all hover:bg-slate-50">
                    <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GMV Achievement</p>
                      <p className="text-base font-extrabold text-slate-800 mt-0.5">
                        {Number(selectedDay.gmv || 0).toLocaleString()} <span className="text-[11px] font-medium text-slate-500">EGP</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3.5 transition-all hover:bg-slate-50">
                    <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-600">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Count of Orders</p>
                      <p className="text-base font-extrabold text-slate-800 mt-0.5">
                        {Number(selectedDay.orders || 0).toLocaleString()} <span className="text-[11px] font-medium text-slate-500">Orders</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3.5 transition-all hover:bg-slate-50">
                    <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-600">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Items Sold (IS)</p>
                      <p className="text-base font-extrabold text-slate-800 mt-0.5">
                        {Number(selectedDay.items || 0).toLocaleString()} <span className="text-[11px] font-medium text-slate-500">Items</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100"
              >
                <Info className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Tip: Click on any date point inside the graph above to view its detailed breakdown for GMV, Orders, and Gross IS.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
