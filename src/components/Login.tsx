import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'admin' | 'vendor', name?: string, vendorId?: string) => void;
}

export function Login({ onLogin }: LoginProps) {
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
      let data: any;
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        setError('Server error ' + res.status + (text ? ': ' + text.substring(0, 120) : ''));
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }
      onLogin(data.role as 'admin' | 'vendor', data.name, data.id);
    } catch (err: any) {
      setError('Network error: ' + (err?.message || String(err)));
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
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Jumia Deals Portal</h2>
          <p className="text-slate-500 text-center text-sm mb-8">Sign in to manage your campaigns and deals.</p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-mono break-all">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-slate-50 focus:bg-white transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
