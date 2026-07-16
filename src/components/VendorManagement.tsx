import React, { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, ShoppingCart, Package, ChevronLeft, Plus, Save, Calendar, Trash2, Mail, Lock, UserPlus, X, Eye, EyeOff, Upload, FileText, Check, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

interface DailyDatePickerProps {
  value: string;
  onChange: (formattedValue: string) => void;
}

function DailyDatePicker({ value, onChange }: DailyDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow the popup to render before scrolling
      setTimeout(() => {
        popupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }, [isOpen]);


  const getInitialDate = () => {
    if (!value) return new Date();
    const parsedDate = Date.parse(value);
    if (!isNaN(parsedDate)) {
      return new Date(parsedDate);
    }
    try {
      const match = value.match(/^(\d+)\s+([A-Za-z]+)$/);
      if (match) {
        const day = parseInt(match[1], 10);
        const monthStr = match[2];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = months.findIndex(m => m.toLowerCase().startsWith(monthStr.toLowerCase()));
        if (monthIndex !== -1) {
          const year = new Date().getFullYear();
          return new Date(year, monthIndex, day);
        }
      }
    } catch (e) {}
    return new Date();
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(getInitialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (!value) return null;
    const parsedDate = Date.parse(value);
    if (!isNaN(parsedDate)) {
      return new Date(parsedDate);
    }
    try {
      const match = value.match(/^(\d+)\s+([A-Za-z]+)$/);
      if (match) {
        const day = parseInt(match[1], 10);
        const monthStr = match[2];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = months.findIndex(m => m.toLowerCase().startsWith(monthStr.toLowerCase()));
        if (monthIndex !== -1) {
          const year = new Date().getFullYear();
          return new Date(year, monthIndex, day);
        }
      }
    } catch (e) {}
    return null;
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const formatted = format(date, 'yyyy-MM-dd');
    onChange(formatted);
    setIsOpen(false);
  };

  const displayLabel = value || 'Choose Date';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-slate-200 hover:border-orange-500 p-2.5 rounded-lg text-sm bg-white outline-none transition-colors font-medium text-slate-700 h-[38px]"
      >
        <span>{displayLabel}</span>
        <Calendar className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-64 left-0"
            >
              <div className="flex justify-between items-center mb-3">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <span key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {days.map((day, dIdx) => {
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isSameDay(day, new Date());
                  return (
                    <button
                      key={dIdx}
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      className={clsx(
                        "h-7 w-7 text-xs rounded-lg flex items-center justify-center font-bold transition-all",
                        isSelected
                          ? "bg-orange-500 text-white"
                          : isTodayDate
                            ? "border border-orange-500 text-orange-600 hover:bg-orange-50"
                            : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 mt-3 pt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today);
                    handleSelectDate(today);
                  }}
                  className="w-full py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Today ({format(new Date(), 'yyyy-MM-dd')})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const defaultVendors = [
  {
    id: '884920',
    name: 'Tech Store Egypt',
    email: 'tech@vendor.com',
    password: 'password123',
    targetGMV: 500000,
    achievementGMV: 425000,
    countOfOrders: 1450,
    grossItemSold: 2005,
    dailyData: [
      { date: '1 Jul', gmv: 45000, orders: 150, items: 210 },
      { date: '2 Jul', gmv: 52000, orders: 180, items: 250 },
      { date: '3 Jul', gmv: 48000, orders: 165, items: 230 },
      { date: '4 Jul', gmv: 61000, orders: 210, items: 290 },
      { date: '5 Jul', gmv: 59000, orders: 195, items: 275 },
      { date: '6 Jul', gmv: 75000, orders: 260, items: 350 },
      { date: '7 Jul', gmv: 85000, orders: 290, items: 400 },
    ]
  },
  {
    id: '884921',
    name: 'Fashion Hub',
    email: 'fashion@vendor.com',
    password: 'password123',
    targetGMV: 200000,
    achievementGMV: 180000,
    countOfOrders: 850,
    grossItemSold: 1100,
    dailyData: []
  }
];

export function VendorManagement() {
  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('vendorsData');
    return saved ? JSON.parse(saved) : defaultVendors;
  });

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Sync from Supabase on mount — Supabase is source of truth for who exists
  useEffect(() => {
    fetch('/api/vendors')
      .then(r => r.json())
      .then(apiUsers => {
        if (!Array.isArray(apiUsers)) return;
        setVendors((prev: any) => {
          return apiUsers.map((av: any) => {
            const local = prev.find((l: any) =>
              l.id === av.id || l.email?.toLowerCase() === av.email?.toLowerCase()
            );
            return {
              achievementGMV: 0, countOfOrders: 0, grossItemSold: 0, dailyData: [],
              ...(local || {}),
              id: av.id,
              name: av.name,
              email: av.email?.toLowerCase(),
              role: av.role,
              password: av.password,
              targetGMV: local?.targetGMV ?? (av.target_gmv || 200000),
            };
          });
        });
      })
      .catch(() => {});
  }, []);

  // Load performance data from Supabase when a vendor is selected
  useEffect(() => {
    if (!selectedVendorId) return;
    fetch(`/api/performance?vendor_id=${selectedVendorId}`)
      .then(r => r.json())
      .then(rows => {
        if (!Array.isArray(rows) || rows.length === 0) return;
        const dailyData = rows.map((r: any) => ({
          date: r.date, // Supabase returns YYYY-MM-DD — use directly
          gmv: Number(r.gmv),
          orders: Number(r.gross_orders),
          items: Number(r.gross_items),
        }));
        const totalGmv    = dailyData.reduce((s: number, r: any) => s + r.gmv, 0);
        const totalOrders = dailyData.reduce((s: number, r: any) => s + r.orders, 0);
        const totalItems  = dailyData.reduce((s: number, r: any) => s + r.items, 0);
        setVendors((prev: any) => prev.map((v: any) => v.id === selectedVendorId
          ? { ...v, dailyData, achievementGMV: totalGmv, countOfOrders: totalOrders, grossItemSold: totalItems }
          : v
        ));
      })
      .catch(() => {});
  }, [selectedVendorId]);

  // Custom states for adding a new vendor
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPassword, setNewVendorPassword] = useState('');
  const [newVendorTarget, setNewVendorTarget] = useState(200000);
  const [addVendorError, setAddVendorError] = useState('');
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  // Admin form states
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addAdminError, setAddAdminError] = useState('');

  // Password visibility state in the vendor table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [vendorToDeleteId, setVendorToDeleteId] = useState<string | null>(null);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editVendorName, setEditVendorName] = useState('');
  const [editVendorEmail, setEditVendorEmail] = useState('');
  const [editVendorPassword, setEditVendorPassword] = useState('');
  const [editProfileError, setEditProfileError] = useState('');

  const togglePasswordVisibility = (vendorId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering table row select
    setVisiblePasswords(prev => ({
      ...prev,
      [vendorId]: !prev[vendorId]
    }));
  };

  const handleDeleteVendor = (vendorId: string) => {
    setVendorToDeleteId(vendorId);
  };

  const handleConfirmDeleteVendor = () => {
    if (vendorToDeleteId) {
      fetch(`/api/vendors?id=${vendorToDeleteId}`, { method: 'DELETE' }).catch(() => {});
      setVendors(vendors.filter((v: any) => v.id !== vendorToDeleteId));
      if (selectedVendorId === vendorToDeleteId) {
        setSelectedVendorId(null);
      }
      setVendorToDeleteId(null);
    }
  };

  const handleSubmitInputs = async () => {
    const selectedVendor = vendors.find((v: any) => v.id === selectedVendorId);
    if (selectedVendor?.dailyData?.length > 0) {
      try {
        // Dates are already YYYY-MM-DD — use directly
        const rows = selectedVendor.dailyData
          .map((r: any) => ({
            date: r.date,
            gmv: Number(r.gmv || 0),
            gross_orders: Number(r.orders || 0),
            gross_items: Number(r.items || 0),
          }))
          .filter((r: any) => r.date);

        if (rows.length > 0) {
          await fetch('/api/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vendor_id: selectedVendorId, rows }),
          });
        }
      } catch {}
    }

    setShowSubmitSuccess(true);
    setTimeout(() => setShowSubmitSuccess(false), 4000);
  };

  const handleOpenEditProfile = (vendor: any) => {
    setEditVendorName(vendor.name || '');
    setEditVendorEmail(vendor.email || '');
    setEditVendorPassword(vendor.password || '');
    setEditProfileError('');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (vendorId: string) => {
    setEditProfileError('');
    const nameClean = editVendorName.trim();
    const emailClean = editVendorEmail.trim();
    const passwordClean = editVendorPassword.trim();

    if (!nameClean || !emailClean || !passwordClean) {
      setEditProfileError('All fields (Name, Email, and Password) are required.');
      return;
    }

    const emailExists = vendors.some((v: any) => v.id !== vendorId && v.email?.toLowerCase() === emailClean.toLowerCase());
    if (emailExists) {
      setEditProfileError('A vendor account with this email address already exists.');
      return;
    }

    fetch(`/api/vendors/${vendorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameClean, email: emailClean, password: passwordClean })
    }).catch(() => {});

    setVendors(vendors.map(v => v.id === vendorId ? {
      ...v,
      name: nameClean,
      email: emailClean,
      password: passwordClean
    } : v));

    setIsEditingProfile(false);
  };

  // File upload and bulk update states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkImportDailyData = async (parsedDailyData: any[]) => {
    const selectedVendor = vendors.find((v: any) => v.id === selectedVendorId);
    if (!selectedVendor || parsedDailyData.length === 0) return;

    // Group raw rows by date (Excel may have multiple product rows per date)
    const byDate = new Map<string, { gmv: number; orders: number; items: number; models: Map<string, { gmv: number; orders: number; items: number }> }>();
    for (const r of parsedDailyData) {
      if (!byDate.has(r.date)) {
        byDate.set(r.date, { gmv: 0, orders: 0, items: 0, models: new Map() });
      }
      const day = byDate.get(r.date)!;
      day.gmv    += Number(r.gmv    || 0);
      day.orders += Number(r.orders || 0);
      day.items  += Number(r.items  || 0);
      if (r.modelName) {
        const existing = day.models.get(r.modelName) || { gmv: 0, orders: 0, items: 0 };
        existing.gmv    += Number(r.gmv    || 0);
        existing.orders += Number(r.orders || 0);
        existing.items  += Number(r.items  || 0);
        day.models.set(r.modelName, existing);
      }
    }

    // Build grouped array sorted by date
    const grouped: any[] = [];
    byDate.forEach((val, date) => {
      const models_data = Array.from(val.models.entries()).map(([name, d]) => ({
        name, gmv: d.gmv, orders: d.orders, items: d.items,
      }));
      grouped.push({ date, gmv: val.gmv, orders: val.orders, items: val.items, models_data });
    });
    grouped.sort((a, b) => a.date.localeCompare(b.date));

    const totalGmv    = grouped.reduce((acc, curr) => acc + curr.gmv, 0);
    const totalOrders = grouped.reduce((acc, curr) => acc + curr.orders, 0);
    const totalItems  = grouped.reduce((acc, curr) => acc + curr.items, 0);

    handleUpdateVendor({
      ...selectedVendor,
      dailyData: grouped,
      achievementGMV: totalGmv,
      countOfOrders: totalOrders,
      grossItemSold: totalItems
    });

    // Persist to Supabase via API
    try {
      const apiRows = grouped
        .map(r => ({
          date: r.date,
          gmv: Number(r.gmv || 0),
          gross_orders: Number(r.orders || 0),
          gross_items: Number(r.items || 0),
          models_data: r.models_data || [],
        }))
        .filter(r => r.date);

      if (apiRows.length > 0) {
        await fetch('/api/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendor_id: selectedVendorId, rows: apiRows }),
        });
      }
    } catch {}
  };

  const handleFileParse = (file: File) => {
    setUploadStatus('idle');
    setUploadMessage('');

    // Use SheetJS for ALL file types (xlsx, xls, csv, tsv, ods, txt).
    // This correctly handles CSV numbers with thousand-separators like "213,908"
    // because SheetJS treats them as quoted fields — the naive comma-split breaks them.
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        // Convert any date representation → ISO string YYYY-MM-DD
        const resolveDate = (val: any): string | null => {
          let d: Date | null = null;
          if (val instanceof Date && !isNaN(val.getTime())) {
            d = val;
          } else if (typeof val === 'number' && val > 40000 && val < 60000) {
            // Excel serial: days since 1899-12-30; subtract 25569 to get Unix epoch days
            const ms = Math.round((val - 25569) * 86400 * 1000);
            const c = new Date(ms);
            if (!isNaN(c.getTime())) d = c;
          } else if (typeof val === 'string' && val.trim()) {
            const c = new Date(val.trim());
            if (!isNaN(c.getTime())) d = c;
          }
          return d ? d.toISOString().split('T')[0] : null;
        };

        const parsed: any[] = [];
        for (const row of rawRows) {
          const dateVal = row['Date'] ?? row['date'] ?? row['DATE'] ?? '';
          const gmvVal  = row['Gross Merchandise Value'] ?? row['GMV'] ?? row['gmv'] ?? row['achievedGMV'] ?? 0;
          const ordVal  = row['# Gross Orders']  ?? row['Gross Orders']  ?? row['Orders']  ?? row['orders']  ?? 0;
          const itmVal  = row['# Gross Items']   ?? row['Gross Items']   ?? row['Items']   ?? row['items']   ?? 0;
          const modelVal = String(row['Product Name'] ?? row['Model Name'] ?? row['product_name'] ?? row['model_name'] ?? '').trim();

          // Skip blank / Total / NaN / filter rows
          if (dateVal === '' || dateVal == null) continue;
          if (typeof dateVal === 'string') {
            const s = dateVal.trim().toLowerCase();
            if (!s || s === 'nan' || s.includes('total') || s.includes('filter')) continue;
          }

          const isoDate = resolveDate(dateVal);
          if (!isoDate) continue;

          // Strip commas from numbers (handles "213,908" → 213908)
          const gmv    = parseFloat(String(gmvVal).replace(/,/g, '')) || 0;
          const orders = parseInt(String(ordVal).replace(/,/g, ''), 10) || 0;
          const items  = parseInt(String(itmVal).replace(/,/g, ''), 10) || 0;

          parsed.push({ date: isoDate, gmv, orders, items, modelName: modelVal });
        }

        if (parsed.length === 0) {
          setUploadStatus('error');
          setUploadMessage('No valid records found. Expected columns: Date, Gross Merchandise Value, # Gross Orders, # Gross Items');
          return;
        }

        await handleBulkImportDailyData(parsed);
        // Count unique dates for the success message
        const uniqueDates = new Set(parsed.map((r: any) => r.date)).size;
        setUploadStatus('success');
        setUploadMessage(`Successfully imported ${uniqueDates} day${uniqueDates !== 1 ? 's' : ''} (${parsed.length} product rows)!`);
      } catch (err: any) {
        setUploadStatus('error');
        setUploadMessage(`Parsing error: ${err.message || 'Unknown error'}`);
      }
    };
    reader.onerror = () => { setUploadStatus('error'); setUploadMessage('Failed to read the file.'); };
    reader.readAsBinaryString(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileParse(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileParse(file);
    }
  };

  useEffect(() => {
    localStorage.setItem('vendorsData', JSON.stringify(vendors));
  }, [vendors]);

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddVendorError('');

    const nameClean = newVendorName.trim();
    const emailClean = newVendorEmail.trim().toLowerCase();
    const passwordClean = newVendorPassword.trim();

    if (!nameClean || !emailClean || !passwordClean) {
      setAddVendorError('All fields (Name, Email, and Password) are required.');
      return;
    }

    const emailExists = vendors.some((v: any) => v.email?.toLowerCase() === emailClean);
    if (emailExists) {
      setAddVendorError('A vendor account with this email address already exists.');
      return;
    }

    try {
      const apiRes = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameClean, email: emailClean, password: passwordClean, target_gmv: Number(newVendorTarget) || 200000 })
      });
      const saved = await apiRes.json();
      if (!apiRes.ok) { setAddVendorError(saved.error || 'Failed to create vendor'); return; }

      setVendors((prev: any) => [...prev, {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        password: passwordClean,
        role: 'VENDOR',
        targetGMV: Number(newVendorTarget) || 200000,
        achievementGMV: 0,
        countOfOrders: 0,
        grossItemSold: 0,
        dailyData: []
      }]);
    } catch {
      setAddVendorError('Connection error. Please try again.');
      return;
    }

    setNewVendorName('');
    setNewVendorEmail('');
    setNewVendorPassword('');
    setNewVendorTarget(200000);
    setIsAddingVendor(false);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError('');
    const nameClean = newAdminName.trim();
    const emailClean = newAdminEmail.trim().toLowerCase();
    const passwordClean = newAdminPassword.trim();
    if (!nameClean || !emailClean || !passwordClean) {
      setAddAdminError('All fields are required.');
      return;
    }
    const emailExists = vendors.some((v: any) => v.email?.toLowerCase() === emailClean);
    if (emailExists) {
      setAddAdminError('An account with this email already exists.');
      return;
    }
    try {
      const apiRes = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameClean, email: emailClean, password: passwordClean, role: 'ADMIN' })
      });
      const saved = await apiRes.json();
      if (!apiRes.ok) { setAddAdminError(saved.error || 'Failed to create admin'); return; }
      setVendors((prev: any) => [...prev, { id: saved.id, name: saved.name, email: saved.email, password: passwordClean, role: 'ADMIN', targetGMV: 0, achievementGMV: 0, countOfOrders: 0, grossItemSold: 0, dailyData: [] }]);
    } catch {
      setAddAdminError('Connection error. Please try again.');
      return;
    }
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    setIsAddingAdmin(false);
  };

    const handleUpdateVendor = (updatedVendor: any) => {
    setVendors(vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));
  };

  const handleAddDailyData = () => {
    if (!selectedVendor) return;
    const newDailyData = [...(selectedVendor.dailyData || []), { date: '', gmv: 0, orders: 0, items: 0 }];
    handleUpdateVendor({ ...selectedVendor, dailyData: newDailyData });
  };

  const handleUpdateDailyData = (index: number, field: string, value: string | number) => {
    if (!selectedVendor) return;
    const newDailyData = [...selectedVendor.dailyData];
    newDailyData[index] = { ...newDailyData[index], [field]: value };

    // Recalculate totals
    const totalGmv = newDailyData.reduce((acc, curr) => acc + Number(curr.gmv || 0), 0);
    const totalOrders = newDailyData.reduce((acc, curr) => acc + Number(curr.orders || 0), 0);
    const totalItems = newDailyData.reduce((acc, curr) => acc + Number(curr.items || 0), 0);

    handleUpdateVendor({
      ...selectedVendor,
      dailyData: newDailyData,
      achievementGMV: totalGmv,
      countOfOrders: totalOrders,
      grossItemSold: totalItems
    });
  };

  const handleDeleteDailyData = (index: number) => {
    if (!selectedVendor) return;
    const newDailyData = selectedVendor.dailyData.filter((_, i) => i !== index);

    // Recalculate totals
    const totalGmv = newDailyData.reduce((acc, curr) => acc + Number(curr.gmv || 0), 0);
    const totalOrders = newDailyData.reduce((acc, curr) => acc + Number(curr.orders || 0), 0);
    const totalItems = newDailyData.reduce((acc, curr) => acc + Number(curr.items || 0), 0);

    handleUpdateVendor({
      ...selectedVendor,
      dailyData: newDailyData,
      achievementGMV: totalGmv,
      countOfOrders: totalOrders,
      grossItemSold: totalItems
    });
  };

  if (selectedVendor) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedVendorId(null)}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedVendor.name}</h2>
              <p className="text-sm text-slate-500 mt-1">Manage targets and daily performance data.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenEditProfile(selectedVendor)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-all self-start sm:self-auto shadow-sm border border-slate-200/60 animate-in fade-in slide-in-from-top-1"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            Manage Profile
          </button>
        </div>

        {/* Stats Row with Formatted Commas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target GMV</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">
                {Number(selectedVendor.targetGMV || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">EGP</span>
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Achieved GMV</p>
              <div className="flex items-baseline justify-between gap-2 mt-0.5">
                <h3 className="text-xl font-bold text-slate-800">
                  {Number(selectedVendor.achievementGMV || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">EGP</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {selectedVendor.targetGMV > 0
                    ? `${((selectedVendor.achievementGMV / selectedVendor.targetGMV) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders & Items</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">
                {Number(selectedVendor.countOfOrders || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">Orders</span>
                <span className="mx-1.5 text-slate-300">/</span>
                {Number(selectedVendor.grossItemSold || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">Items</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Overall Target</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">Target GMV (EGP)</label>
                    <input
                      type="number"
                      value={selectedVendor.targetGMV}
                      onChange={(e) => handleUpdateVendor({ ...selectedVendor, targetGMV: Number(e.target.value) })}
                      className="w-full max-w-md border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm font-semibold text-slate-700"
                    />
                    <span className="text-xs font-semibold text-slate-400 mt-1.5 block">
                      Formatted: <span className="font-bold text-orange-600">{Number(selectedVendor.targetGMV || 0).toLocaleString()} EGP</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right free space - Bulk File Upload Dropzone */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-orange-500" />
                    Bulk Import Daily Data
                  </h3>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 min-h-[140px]",
                    isDragging
                      ? "border-orange-500 bg-orange-50/50 animate-pulse"
                      : "border-slate-200 hover:border-orange-400 hover:bg-slate-50/50"
                  )}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv,.tsv,.ods,.txt"
                    className="hidden"
                  />
                  <div className="p-3 bg-orange-50 rounded-full text-orange-500">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Drag & drop your report file here</p>
                    <p className="text-xs text-slate-400 mt-0.5">Supports Excel, CSV, TSV or any spreadsheet format (.xlsx, .csv, .tsv, .ods)</p>
                  </div>
                </div>

                {/* Upload status message */}
                <AnimatePresence mode="wait">
                  {uploadStatus !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className={clsx(
                        "p-3 rounded-xl text-xs flex items-center gap-2.5 font-semibold",
                        uploadStatus === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                      )}
                    >
                      {uploadStatus === 'success' ? (
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="flex-1">{uploadMessage}</span>
                      <button
                        type="button"
                        onClick={() => setUploadStatus('idle')}
                        className="text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100"
                      >
                        Clear
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Daily Achievements</h3>
              <button
                onClick={handleAddDailyData}
                className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Day
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-3 w-48">Date (YYYY-MM-DD)</th>
                    <th className="p-3">Achieved GMV</th>
                    <th className="p-3">Count of Orders</th>
                    <th className="p-3">Gross Items Sold</th>
                    <th className="p-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedVendor.dailyData?.map((day, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <DailyDatePicker
                          value={day.date}
                          onChange={(formatted) => handleUpdateDailyData(idx, 'date', formatted)}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          placeholder="GMV"
                          value={day.gmv}
                          onChange={(e) => handleUpdateDailyData(idx, 'gmv', Number(e.target.value))}
                          className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-orange-500 font-semibold text-slate-700"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                          {Number(day.gmv || 0).toLocaleString()} EGP
                        </span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          placeholder="Orders"
                          value={day.orders}
                          onChange={(e) => handleUpdateDailyData(idx, 'orders', Number(e.target.value))}
                          className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-orange-500 font-semibold text-slate-700"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                          {Number(day.orders || 0).toLocaleString()} Orders
                        </span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          placeholder="Items"
                          value={day.items}
                          onChange={(e) => handleUpdateDailyData(idx, 'items', Number(e.target.value))}
                          className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-orange-500 font-semibold text-slate-700"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                          {Number(day.items || 0).toLocaleString()} Items
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteDailyData(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!selectedVendor.dailyData || selectedVendor.dailyData.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic text-sm">
                        No daily data recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSubmitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="font-semibold text-sm">Inputs Submitted & Saved Successfully!</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitSuccess(false)}
                className="text-green-500 hover:text-green-700 text-xs font-bold"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedVendorId(null)}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            Back to List
          </button>
          <button
            type="button"
            onClick={handleSubmitInputs}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Submit Inputs
          </button>
        </div>

        {/* Custom Manage Profile Modal in Vendor View */}
        <AnimatePresence>
          {isEditingProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col p-6"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" />
                  Manage Vendor Profile
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Update login credentials and account settings for <span className="font-bold text-slate-600">{selectedVendor?.name}</span>.
                </p>

                {editProfileError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 mb-4">
                    {editProfileError}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Vendor Name</label>
                    <input
                      type="text"
                      value={editVendorName}
                      onChange={(e) => setEditVendorName(e.target.value)}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Login Email</label>
                    <input
                      type="email"
                      value={editVendorEmail}
                      onChange={(e) => setEditVendorEmail(e.target.value)}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Login Password</label>
                    <input
                      type="text"
                      value={editVendorPassword}
                      onChange={(e) => setEditVendorPassword(e.target.value)}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProfile(selectedVendor?.id)}
                    className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/10"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage vendor and admin accounts for the portal.</p>
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => { setIsAddingVendor(!isAddingVendor); setIsAddingAdmin(false); }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm shadow-orange-500/20 transition-all justify-center"
          >
            {isAddingVendor ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isAddingVendor ? 'Cancel' : 'Add Vendor'}
          </button>
          <button
            onClick={() => { setIsAddingAdmin(!isAddingAdmin); setIsAddingVendor(false); }}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all justify-center"
          >
            {isAddingAdmin ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isAddingAdmin ? 'Cancel' : 'Add Admin'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAddingVendor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddVendor} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserPlus className="w-5 h-5 text-orange-500" />
                Create New Vendor Account
              </h3>

              {addVendorError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg">
                  {addVendorError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Vendor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jumia Express"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Login Email</label>
                  <input
                    type="email"
                    required
                    placeholder="vendor@jumia.com"
                    value={newVendorEmail}
                    onChange={(e) => setNewVendorEmail(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Login Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newVendorPassword}
                    onChange={(e) => setNewVendorPassword(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Target GMV (EGP)</label>
                  <input
                    type="number"
                    required
                    placeholder="200000"
                    value={newVendorTarget}
                    onChange={(e) => setNewVendorTarget(Number(e.target.value))}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-slate-700"
                  />
                  <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                    Formatted: <span className="font-bold text-orange-600">{Number(newVendorTarget || 0).toLocaleString()} EGP</span>
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingVendor(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Create Vendor
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddAdmin} className="bg-white rounded-2xl shadow-sm border border-slate-800/20 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserPlus className="w-5 h-5 text-slate-700" />
                Create New Admin Account
              </h3>
              {addAdminError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg">{addAdminError}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Admin Name</label>
                  <input type="text" required placeholder="e.g. John Admin" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Login Email</label>
                  <input type="email" required placeholder="admin@jumia.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
                  <input type="text" required placeholder="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddingAdmin(false)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors">Create Admin</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">Vendor Account</th>
                <th className="p-4">Credentials (Email / Password)</th>
                <th className="p-4 text-right">Target (EGP)</th>
                <th className="p-4 text-right">Achievement GMV</th>
                <th className="p-4 text-right">Orders</th>
                <th className="p-4 text-right">Gross Items Sold</th>
                <th className="p-4 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.filter((v: any) => !v.role || v.role.toUpperCase() !== 'ADMIN').map(vendor => {
                const progress = vendor.targetGMV > 0 ? (vendor.achievementGMV / vendor.targetGMV) * 100 : 0;
                const isPassVisible = visiblePasswords[vendor.id];
                return (
                  <tr
                    key={vendor.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer text-sm"
                    onClick={() => setSelectedVendorId(vendor.id)}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 hover:text-orange-500 transition-colors">{vendor.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">ID: {vendor.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{vendor.email || `${vendor.id}@vendor.com`}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                            {isPassVisible ? (vendor.password || 'password123') : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => togglePasswordVisibility(vendor.id, e)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                            title={isPassVisible ? "Hide Password" : "Show Password"}
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-semibold text-slate-700">
                        {vendor.targetGMV.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-slate-900">{vendor.achievementGMV.toLocaleString()}</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-700">
                      {vendor.countOfOrders.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-700">
                      {vendor.grossItemSold.toLocaleString()}
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Delete Vendor Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Accounts Table */}
      {vendors.some((v: any) => v.role?.toUpperCase() === 'ADMIN') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-800/20 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Admin Accounts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4">Admin</th>
                  <th className="p-4">Credentials (Email / Password)</th>
                  <th className="p-4 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.filter((v: any) => v.role?.toUpperCase() === 'ADMIN').map((vendor: any) => {
                  const isPassVisible = visiblePasswords[vendor.id];
                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50 transition-colors text-sm">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{vendor.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">ID: {vendor.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-slate-600 text-xs">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{vendor.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                              {isPassVisible ? (vendor.password || '••••••••') : '••••••••'}
                            </span>
                            <button type="button" onClick={(e) => togglePasswordVisibility(vendor.id, e)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button type="button" onClick={() => handleDeleteVendor(vendor.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center" title="Delete Admin Account">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

            {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {vendorToDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Vendor Account</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Are you sure you want to delete this vendor account? This action cannot be undone and will permanently remove all associated daily target records and credentials.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setVendorToDeleteId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteVendor}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors shadow-sm shadow-red-500/10"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Manage Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-500" />
                Manage Vendor Profile
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Update login credentials and account settings for <span className="font-bold text-slate-600">{selectedVendor?.name}</span>.
              </p>

              {editProfileError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 mb-4">
                  {editProfileError}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Vendor Name</label>
                  <input
                    type="text"
                    value={editVendorName}
                    onChange={(e) => setEditVendorName(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Login Email</label>
                  <input
                    type="email"
                    value={editVendorEmail}
                    onChange={(e) => setEditVendorEmail(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-slate-700"
       