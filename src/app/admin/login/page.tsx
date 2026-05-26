'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, ShieldAlert, KeyRound, Mail, Sparkles, Terminal } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sbConfigured, setSbConfigured] = useState(false);

  useEffect(() => {
    setSbConfigured(isSupabaseConfigured());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (sbConfigured && supabase) {
        // Real Supabase Authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        // Save session indicator
        if (typeof window !== 'undefined') {
          localStorage.setItem('nls_admin_session', 'true');
        }
        router.push('/admin');
      } else {
        // Sandbox Mock Mode Auth
        if (email.trim() === 'admin@nextlevel.store' && password === 'admin123') {
          if (typeof window !== 'undefined') {
            localStorage.setItem('nls_admin_session', 'true');
          }
          router.push('/admin');
        } else {
          setError('Invalid credentials! (Tip: In local sandbox mode, use admin@nextlevel.store / admin123)');
        }
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-[#030014] py-16 px-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 rounded-2xl bg-purple-900/30 border border-purple-500/20 mb-4 animate-float">
            <Gamepad2 className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ADMIN PORTAL</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
            {sbConfigured ? 'Supabase Authentication' : 'Local Sandbox Mode Active'}
          </p>
        </div>

        {/* Info alert about local Sandbox settings */}
        {!sbConfigured && (
          <div className="mb-6 p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 text-cyan-400 text-xs leading-relaxed flex items-start gap-2.5 shadow-[0_0_15px_rgba(0,240,255,0.02)]">
            <Terminal className="h-5 w-5 text-cyan-400 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">Sandbox Credentials:</span>
              <span>Use <code className="bg-cyan-950/60 px-1 py-0.5 rounded font-semibold text-white">admin@nextlevel.store</code> with password <code className="bg-cyan-950/60 px-1 py-0.5 rounded font-semibold text-white">admin123</code> to test the administrator dashboard!</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-500/20 bg-red-950/10 text-red-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={sbConfigured ? 'your@email.com' : 'admin@nextlevel.store'}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Security Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3.5 rounded-xl font-extrabold text-black bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
