import React, { useState, useEffect, useRef } from 'react';
import { Campaign } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Edit2, Save, X, Trash2, Smartphone, Tablet, Headphones, Laptop, Mouse, Gamepad2, Shirt, Microwave, Coffee, Refrigerator, Tv, Sparkles, ChevronDown } from 'lucide-react';
import { getCampaignStyle } from '../utils';
import clsx from 'clsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const categoryIcons: Record<string, React.ElementType> = {
  "Phones": Smartphone,
  "Tablets": Tablet,
  "Phones accessories": Headphones,
  "Computing": Laptop,
  "Computing Accessories": Mouse,
  "Gaming": Gamepad2,
  "Gaming Accessories": Headphones,
  "Fashion": Shirt,
  "Small Home Appliance": Coffee,
  "Medium Home Applainces": Microwave,
  "Large Home Appliances": Refrigerator,
  "TVs": Tv,
  "Health and Beauty": Sparkles
};

const toLocalISOString = (dateInput: string | Date | undefined) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};


function CustomDropdown({
  value,
  options,
  onChange,
  label
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="text-[10px] font-bold text-slate-400 block mb-1 text-center">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full bg-slate-50 border text-slate-700 text-xs rounded-lg p-2 font-semibold transition-all text-center flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20",
          isOpen ? "border-orange-500 ring-2 ring-orange-500/20" : "border-slate-200 hover:border-orange-400"
        )}
      >
        <span>{value}</span>
        <ChevronDown className={clsx("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[70px]"
          >
            <div className="max-h-40 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {options.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "w-full text-center py-2 px-1 text-xs rounded-lg transition-colors font-semibold block my-0.5",
                      isSelected
                        ? "bg-orange-500 text-white font-bold"
                        : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function DateTimePicker({ value, onChange, label, hasError, isValid }: { value: string, onChange: (val: string) => void, label: string, hasError?: boolean, isValid?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ? new Date(value) : new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? new Date(value) : new Date());

  useEffect(() => {
    if (isOpen) {
      const initialDate = value ? new Date(value) : new Date();
      setTempDate(initialDate);
      setCurrentMonth(initialDate);
    }
  }, [isOpen, value]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const handleConfirm = () => {
    onChange(tempDate.toISOString());
    setIsOpen(false);
  };

  const handleHourChange = (hStr: string) => {
    const h = parseInt(hStr, 10);
    const isPM = format(tempDate, 'a') === 'PM';
    const newDate = new Date(tempDate);
    let finalH = h;
    if (isPM) {
      if (h !== 12) finalH = h + 12;
    } else {
      if (h === 12) finalH = 0;
    }
    newDate.setHours(finalH);
    setTempDate(newDate);
  };

  const handleMinuteChange = (mStr: string) => {
    const m = parseInt(mStr, 10);
    const newDate = new Date(tempDate);
    newDate.setMinutes(m);
    setTempDate(newDate);
  };

  const handleAmPmChange = (ampm: string) => {
    const currentH = tempDate.getHours();
    const h12 = currentH % 12;
    const newDate = new Date(tempDate);
    let finalH = h12;
    if (ampm === 'PM') {
      finalH = h12 === 0 ? 12 : h12 + 12;
    } else {
      finalH = h12 === 0 ? 0 : h12;
    }
    newDate.setHours(finalH);
    setTempDate(newDate);
  };

  return (
    <div className="relative">
      <label className="text-xs font-bold block mb-1">{label}</label>
      <div 
        className={clsx("border p-2.5 rounded-lg w-full cursor-pointer flex justify-between items-center bg-white shadow-sm transition-colors", hasError ? "border-red-500" : (isValid ? "border-green-500" : "border-slate-300 hover:border-orange-500"))}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-slate-700">
          {value ? format(new Date(value), 'MMM d, yyyy - h:mm a') : 'Select Date & Time'}
        </span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-72 left-0 right-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800 text-sm">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-xs font-bold text-slate-400 py-1">{d}</div>
                ))}
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map(day => {
                  const isSelected = isSameDay(day, tempDate);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        const newDate = new Date(day);
                        newDate.setHours(tempDate.getHours());
                        newDate.setMinutes(tempDate.getMinutes());
                        setTempDate(newDate);
                      }}
                      className={clsx(
                        "w-8 h-8 rounded-full text-xs flex items-center justify-center transition-colors mx-auto relative",
                        isSelected 
                          ? "bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20" 
                          : "hover:bg-slate-100 text-slate-700",
                        isToday && !isSelected && "border border-orange-200 text-orange-600 font-medium"
                      )}
                    >
                      {format(day, 'd')}
                      {isToday && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 bg-orange-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Friendly Time Selection Row */}
              <div className="border-t border-slate-100 pt-3 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Set Time</span>
                </div>
                
                <div className="flex gap-2">
                  {/* Hours */}
                  <CustomDropdown
                    label="Hour"
                    value={format(tempDate, 'hh')}
                    options={Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))}
                    onChange={handleHourChange}
                  />

                  {/* Minutes */}
                  <CustomDropdown
                    label="Minute"
                    value={format(tempDate, 'mm')}
                    options={Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))}
                    onChange={handleMinuteChange}
                  />

                  {/* Period */}
                  <CustomDropdown
                    label="Period"
                    value={format(tempDate, 'a')}
                    options={['AM', 'PM']}
                    onChange={handleAmPmChange}
                  />
                </div>
              </div>

              <button 
                type="button"
                onClick={handleConfirm}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 text-sm font-bold transition-colors shadow-md shadow-orange-500/15"
              >
                Confirm Date & Time
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


export function AdminDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Campaign>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = () => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data));
  };

  const handleEdit = (c: Campaign) => {
    setValidationError(null);
    setEditingId(c.id);
    setFormData(c);
  };

  const handleSave = async () => {
    setValidationError(null);
    if (new Date(formData.startDate || '') > new Date(formData.endDate || '')) {
      setValidationError("Start date cannot be after end date.");
      return;
    }
    if (formData.rules?.submissionDeadline && new Date(formData.rules.submissionDeadline) > new Date(formData.startDate || '')) {
      setValidationError("Submission deadline cannot be after start date.");
      return;
    }
    const isNew = !formData.id;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/campaigns' : `/api/campaigns/${formData.id}`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setEditingId(null);
    setFormData({});
    fetchCampaigns();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await fetch(`/api/campaigns/${deleteConfirmId}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      fetchCampaigns();
    }
  };

  const handleCreate = () => {
    setValidationError(null);
    setEditingId('new');
    setFormData({
      name: '',
      type: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      description: '',
      rules: {
        minDiscount: 0,
        maxDiscount: 100,
        eligibleCategories: [],
        submissionDeadline: new Date().toISOString(),
        notes: ''
      }
    });
  };

  const renderFormContent = () => (
    <div className="space-y-4">
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}
      <select className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm text-sm" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}>
        <option value="" disabled>Select Campaign Theme</option>
        <option value="Flash Sale">Flash Sale</option>
        <option value="Daily Deal">Daily Deal</option>
        <option value="Week End Offer">Week End Offer</option>
        <option value="JUMIA Anniversary">JUMIA Anniversary</option>
        <option value="Black Friday">Black Friday</option>
        <option value="Mothers Day">Mothers Day</option>
        <option value="Valentines Day">Valentines Day</option>
        <option value="Back to School">Back to School</option>
        <option value="Eid Adha">Eid Adha</option>
        <option value="Ramadan Campaign">Ramadan Campaign</option>
        <option value="Summer Campaign">Summer Campaign</option>
        <option value="Pay Week">Pay Week</option>
      </select>
      
      <div className="grid grid-cols-2 gap-4">
        {(() => {
          const startDate = new Date(formData.startDate || '');
          const endDate = new Date(formData.endDate || '');
          const deadline = new Date(formData.rules?.submissionDeadline || '');
          const isStartValid = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate;
          const isStartError = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate;
          
          const isEndValid = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate;
          const isEndError = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate;
          
          const isDeadlineValid = !isNaN(deadline.getTime()) && !isNaN(startDate.getTime()) && deadline <= startDate;
          const isDeadlineError = !isNaN(deadline.getTime()) && !isNaN(startDate.getTime()) && deadline > startDate;
          
          return (
            <>
              <DateTimePicker label="Start Date" value={formData.startDate || ''} onChange={val => setFormData({...formData, startDate: val})} hasError={isStartError} isValid={isStartValid} />
              <DateTimePicker label="End Date" value={formData.endDate || ''} onChange={val => setFormData({...formData, endDate: val})} hasError={isEndError} isValid={isEndValid} />
            </>
          );
        })()}
      </div>
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        <h4 className="font-bold">Rules</h4>
        <div>
          <label className="text-xs font-bold mb-2 block">Eligible Categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-h-60 overflow-y-auto">
            {Object.keys(categoryIcons).map(cat => {
              const Icon = categoryIcons[cat];
              return (
                <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-slate-50 rounded">
                  <input 
                    type="checkbox"
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    checked={formData.rules?.eligibleCategories?.includes(cat) || false}
                    onChange={(e) => {
                      const current = formData.rules?.eligibleCategories || [];
                      const next = e.target.checked 
                        ? [...current, cat]
                        : current.filter(c => c !== cat);
                      setFormData({
                        ...formData, 
                        rules: { ...formData.rules!, eligibleCategories: next }
                      });
                    }}
                  />
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="truncate" title={cat}>{cat}</span>
                </label>
              );
            })}
          </div>
        </div>
        {(() => {
          const startDate = new Date(formData.startDate || '');
          const deadline = new Date(formData.rules?.submissionDeadline || '');
          const isDeadlineValid = !isNaN(deadline.getTime()) && !isNaN(startDate.getTime()) && deadline <= startDate;
          const isDeadlineError = !isNaN(deadline.getTime()) && !isNaN(startDate.getTime()) && deadline > startDate;
          return <DateTimePicker label="Submission Deadline" value={formData.rules?.submissionDeadline || ''} onChange={val => setFormData({...formData, rules: {...formData.rules!, submissionDeadline: val}})} hasError={isDeadlineError} isValid={isDeadlineValid} />
        })()}

        <div>
          <label className="text-xs font-bold block mb-1">Notes (e.g., Minimum SKUs)</label>
          <input type="text" className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm text-sm" value={formData.rules?.notes || ''} onChange={e => setFormData({...formData, rules: {...formData.rules!, notes: e.target.value}})} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded-lg flex items-center gap-2"><X className="w-4 h-4"/> Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Campaign Dashboard</h2>
        <button onClick={handleCreate} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      </div>
      <div className="space-y-4">
        {campaigns.map(c => (
          <div key={c.id} className="border border-slate-200 p-4 rounded-lg">
            {editingId === c.id ? renderFormContent() : (
              <div className="flex justify-between items-center">
                <div>
                  {(() => {
                    const style = getCampaignStyle(c.name);
                    const Icon = style.icon;
                    return (
                      <div className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-1", style.bg, style.text)}>
                        <Icon className={clsx("w-4 h-4", style.iconColor)} />
                        <h3 className="font-bold text-lg">{c.name}</h3>
                      </div>
                    );
                  })()}
                  <p className="text-sm text-slate-500">{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(c.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {editingId === 'new' && (
          <div className="border border-slate-200 p-4 rounded-lg border-orange-500 shadow-sm">
             {renderFormContent()}
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Campaign</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Are you sure you want to delete this campaign? This action cannot be undone and will permanently remove all associated details.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors shadow-sm shadow-red-500/10"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
