import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Tag, Settings, LogOut, User, Users, Package } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
  userRole?: 'admin' | 'vendor' | null;
  userName?: string;
}

export function Layout({ children, activeTab = 'calendar', onNavigate, onLogout, userRole, userName }: LayoutProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  let menuItems = [];
  if (userRole === 'admin') {
    menuItems = [
      { id: 'admin', label: 'Campaign Management', icon: Settings },
      { id: 'calendar', label: 'Campaign Calendar', icon: Calendar },
      { id: 'vendor-skus', label: 'Vendor SKUs', icon: Package },
      { id: 'submissions', label: 'Vendors\' Submissions', icon: Tag },
      { id: 'vendor-management', label: 'Account Management', icon: Users }
    ];
  } else {
    menuItems = [
      { id: 'calendar', label: 'Campaign Calendar', icon: Calendar },
      { id: 'live-skus', label: 'Live SKUs', icon: Package },
      { id: 'submissions', label: 'My Submissions', icon: Tag },
      { id: 'performance', label: 'My Performance', icon: User }
    ];
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* Top Navigation Bar */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20 ring-1 ring-white/20">
              J
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">{userRole === "admin" ? "Admin Portal" : "Vendor Portal"}</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={clsx(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-orange-50 text-orange-600 ring-1 ring-orange-200/50 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={clsx("w-4 h-4 transition-colors", isActive ? "text-orange-500" : "text-slate-400")} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-5 relative" ref={profileMenuRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="text-right hidden sm:block group-hover:opacity-80 transition-opacity">
              <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{userName || "Tech Store Egypt"}</p>
              <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{userRole === "admin" ? "ADMINISTRATOR" : "ID: 884920"}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 ring-2 ring-white shadow-sm overflow-hidden border border-slate-200 group-hover:ring-orange-200 transition-all">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[120%] w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 sm:hidden">
                  <p className="text-sm font-bold text-slate-900">{userName || "Tech Store Egypt"}</p>
                  <p className="text-xs text-slate-500">{userRole === "admin" ? "ADMINISTRATOR" : "ID: 884920"}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden flex overflow-x-auto bg-white border-b border-slate-200 px-4 py-2 space-x-2 shrink-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={clsx(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                isActive 
                  ? "bg-orange-50 text-orange-600 ring-1 ring-orange-200/50" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={clsx("w-4 h-4 transition-colors", isActive ? "text-orange-500" : "text-slate-400")} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none"></div>
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-[1600px] mx-auto relative h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
