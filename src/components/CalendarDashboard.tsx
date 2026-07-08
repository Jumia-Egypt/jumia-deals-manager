import React, { useEffect, useState } from 'react';
import { isValid, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { getCampaignStyle } from '../utils';
import clsx from 'clsx';
import type { Campaign } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

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

interface CalendarDashboardProps {
  onSelectCampaign: (campaign: Campaign) => void;
  userRole?: "admin" | "vendor" | null;
}




function Loader() {
  return (
    <>
      <style>{'.jumia-loader{--dim:2.2rem;background-color:#f97316;opacity:0.55;width:var(--dim);height:var(--dim);border-radius:50%;display:grid;place-items:center;animation:spin_412 5s infinite;} .jumia-loader svg{transform:translateY(-1px) scale(.65);} @keyframes spin_412{0%{transform:rotate(0) scale(1);}50%{transform:rotate(720deg) scale(1.2);}100%{transform:rotate(0) scale(1);}}'}</style>
      <div className="jumia-loader">
        <svg version="1.1" viewBox="0 0 47.94 47.94" xmlns="http://www.w3.org/2000/svg">
          <path style={{fill:'#fff'}} d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956c0.947-1.919,3.683-1.919,4.63,0z"/>
        </svg>
      </div>
    </>
  );
}

export function CalendarDashboard({ onSelectCampaign, userRole }: CalendarDashboardProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{day: Date, campaigns: Campaign[]} | null>(null);

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        setCampaigns(data);
        setLoading(false);
      });
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Empty days for grid alignment
  const startDay = monthStart.getDay();
  const emptyDays = Array.from({ length: startDay });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    );
  }
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Campaign Calendar</h2>
          <p className="text-sm text-slate-500 mt-1">Review upcoming events and submit your promotional prices.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgb(0,0,0,0.02),0_1px_2px_-1px_rgb(0,0,0,0.02)] border border-slate-200/60 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {format(currentMonth, 'MMMM yyyy')}
            {isSameDay(currentMonth, new Date()) && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Current</span>}
          </h3>
          <div className="flex space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-slate-500 hover:text-slate-900">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-slate-500 hover:text-slate-900">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[800px]">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] rounded-xl bg-slate-50/50" />
          ))}
          
          {daysInMonth.map(day => {
            // Find campaigns active on this day
            const activeCampaigns = campaigns.filter(c => {
              const start = new Date(c.startDate);
              const end = new Date(c.endDate);
              // Normalize times for accurate comparison
              start.setHours(0,0,0,0);
              end.setHours(23,59,59,999);
              return (() => { try { return isValid(start) && isValid(end) ? isWithinInterval(day, { start, end }) : false; } catch { return false; } })();
            });

            // Find campaigns starting on this day
            const startingCampaigns = activeCampaigns.filter(c => {
               const start = new Date(c.startDate);
               return (() => { try { return isValid(start) ? isSameDay(day, start) : false; } catch { return false; } })();
            });

            const isToday = isSameDay(day, new Date());
            const hasCampaigns = activeCampaigns.length > 0;
            const hasStartingCampaigns = startingCampaigns.length > 0;

            return (
              <div 
                key={day.toISOString()} 
                onClick={() => {
                  if (hasStartingCampaigns) {
                    setSelectedDayInfo({ day, campaigns: startingCampaigns });
                  }
                }}
                className={clsx(
                  "min-h-[120px] p-2.5 rounded-xl border transition-all duration-200 flex flex-col relative group",
                  hasCampaigns 
                    ? "border-orange-200/60 bg-gradient-to-b from-orange-50/50 to-orange-100/30" 
                    : "border-slate-100 bg-white hover:border-slate-200",
                  hasStartingCampaigns && "cursor-pointer hover:shadow-md hover:shadow-orange-500/5 hover:-translate-y-0.5"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={clsx(
                    "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-lg transition-colors",
                    isToday ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20" : 
                    hasStartingCampaigns ? "text-orange-900 bg-white shadow-sm ring-1 ring-orange-200/50" : "text-slate-600"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {hasStartingCampaigns && (
                    <span className="flex h-2 w-2 relative mt-1 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                  )}
                </div>
                
                <div className="space-y-1.5 mt-auto w-full z-10 relative">
                  {activeCampaigns.map(c => {
                    const style = getCampaignStyle(c.name);
                    const Icon = style.icon;
                    const isEnding = (() => { try { const d = new Date(c.endDate); return isValid(d) ? isSameDay(day, d) : false; } catch { return false; } })();
                    return (
                    <div 
                      key={c.id} 
                      className={clsx(
                        "text-[10px] px-2 py-1.5 rounded-lg ring-1 font-bold truncate shadow-sm flex items-center justify-between gap-1.5",
                        style.bg,
                        style.ring,
                        style.text,
                        isEnding && "border-dashed opacity-80"
                      )}
                      title={c.name}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon className={clsx("w-3 h-3 shrink-0", style.iconColor)} />
                        <span className="truncate">{c.name}</span>
                      </div>
                      {isEnding && <span className="text-[8px] uppercase tracking-wider font-bold opacity-80 shrink-0">Ended</span>}
                    </div>
                  )})}
                </div>
                {hasCampaigns && (
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-orange-500/10 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 flex items-start space-x-4 shadow-lg shadow-slate-900/10 border border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-orange-500/20 to-transparent pointer-events-none"></div>
        <div className="bg-white/10 p-2 rounded-lg shrink-0 backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">Upcoming Deadlines</h4>
          <p className="text-xs font-medium text-slate-300 mt-1.5 leading-relaxed max-w-2xl">
            You have <strong className="text-white">{campaigns.length} active campaigns</strong> this month. Make sure to submit your promotional prices before the deadlines to secure your placement in the deals section.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedDayInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Campaigns</h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {format(selectedDayInfo.day, 'MMMM d, yyyy')}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedDayInfo(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto flex flex-col gap-3">
                {selectedDayInfo.campaigns.map(c => {
                  const style = getCampaignStyle(c.name);
                  const Icon = style.icon;
                  return (
                    <div 
                      key={c.id}
                      onClick={() => {
                        if (userRole !== 'admin') {
                          setSelectedDayInfo(null);
                          onSelectCampaign(c);
                        }
                      }}
                      className={clsx("p-4 rounded-xl border border-slate-200 flex flex-col gap-3 bg-white", userRole !== "admin" && "hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/5 transition-all cursor-pointer group")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={clsx("p-2 rounded-lg ring-1", style.bg, style.ring, style.text)}>
                          <Icon className={clsx("w-5 h-5 shrink-0", style.iconColor)} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{c.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{c.rules.notes || 'Submit promotional prices'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Starts</p>
                          <p className="text-xs font-semibold text-slate-700">{safeFormat(c.startDate, 'MMM d, yyyy')}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Ends</p>
                          <p className="text-xs font-semibold text-slate-700">{safeFormat(c.endDate, 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
