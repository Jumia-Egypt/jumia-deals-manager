import React, { useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'admin' | 'vendor', name?: string, vendorId?: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'admin' | 'vendor'>('vendor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        return;
      }
      onLogin(data.role as 'admin' | 'vendor', data.name, data.id);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="font-bold text-2xl text-white">J</span>
            </div>
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === 'vendor' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setRole('vendor')}
            >
              Vendor Login
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === 'admin' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setRole('admin')}
            >
              Admin Login
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">{role === 'admin' ? 'Admin Portal' : 'Vendor Portal'}</h2>
          <p className="text-slate-500 text-center text-sm mb-8">Sign in to manage your campaigns and deals.</p>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-slate-50 focus:bg-white transition-colors"
                placeholder="vendor@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-slate-50 focus:bg-white transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
