'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Gamepad2, 
  LayoutDashboard, 
  ShoppingBag, 
  FolderLock, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronRight,
  UserCheck,
  Globe
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sbConfigured, setSbConfigured] = useState(false);

  useEffect(() => {
    setSbConfigured(isSupabaseConfigured());

    const checkAuth = async () => {
      // 1. Skip check on the login route to avoid infinite redirect loop
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      const configured = isSupabaseConfigured();
      if (configured && supabase) {
        // Supabase Auth Check
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/admin/login');
        } else {
          setAuthenticated(true);
        }
      } else {
        // Sandbox localStorage Session Check
        const isSessionActive = localStorage.getItem('nls_admin_session') === 'true';
        if (!isSessionActive) {
          router.replace('/admin/login');
        } else {
          setAuthenticated(true);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    if (sbConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('nls_admin_session');
    router.replace('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Games', href: '/admin/games', icon: ShoppingBag },
    { name: 'Manage Categories', href: '/admin/categories', icon: FolderLock },
    { name: 'Invoice Builder', href: '/admin/invoices', icon: FileText },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-transparent py-32 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
          <span className="text-sm text-purple-300/60 font-medium">Authorizing administrator panel...</span>
        </div>
      </div>
    );
  }

  // If we are on the login page, render only the children (login screen) without sidebar wrapper
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authenticated) return null;

  return (
    <div className="flex-grow flex flex-col md:flex-row bg-[#060414] min-h-[calc(100vh-64px)]">
      
      {/* 1. ADMIN SIDEBAR BAR */}
      <aside className="w-full md:w-64 shrink-0 bg-[#08051e]/85 backdrop-blur-md border-r border-purple-950/40 p-6 flex flex-col gap-6 shadow-xl">
        
        {/* Admin Card */}
        <div className="p-4 rounded-xl border border-purple-950/40 bg-purple-950/20 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white uppercase tracking-widest">Administrator</span>
            <span className="text-[10px] text-purple-400 font-mono mt-0.5 font-bold">
              {sbConfigured ? 'Live Supabase' : 'Sandbox Store'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isCurrent 
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-200' 
                    : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="flex-grow">{item.name}</span>
                {isCurrent && <ChevronRight className="h-4 w-4 text-purple-400 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Base Links */}
        <div className="flex flex-col gap-2 border-t border-purple-950/30 pt-4 mt-auto">
          <Link
            href="/"
            className="flex items-center gap-3 py-2 px-4 rounded-lg text-xs font-bold text-purple-400/60 hover:text-purple-300 transition-all uppercase tracking-widest cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold text-red-400/80 hover:bg-red-950/20 hover:text-red-400 transition-all uppercase tracking-widest border border-transparent cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 text-inherit" />
            Log Out Account
          </button>
        </div>

      </aside>

      {/* 2. ADMIN CONTAINER SECTION */}
      <section className="flex-grow p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {children}
      </section>

    </div>
  );
}
