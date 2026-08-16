import { useQuery } from '@tanstack/react-query';
import {
  Activity, CalendarDays, ChevronDown, Files, Image, LayoutDashboard, LogOut, Mail, Menu,
  Settings, Shield, Tags, Users, UsersRound, X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { contactApi } from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
  badgeKey?: 'inbox';
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'সংক্ষিপ্ত',
    items: [{ to: '/', label: 'ড্যাশবোর্ড', icon: LayoutDashboard }],
  },
  {
    section: 'কমিটি',
    items: [
      { to: '/committees', label: 'কার্যনির্বাহী পরিষদ', icon: UsersRound },
      { to: '/people', label: 'সদস্য তালিকা', icon: Users },
      { to: '/designations', label: 'পদবি', icon: Tags },
      { to: '/advisors', label: 'উপদেষ্টামণ্ডলী', icon: Shield },
    ],
  },
  {
    section: 'কনটেন্ট',
    items: [
      { to: '/gallery', label: 'গ্যালারি', icon: Image },
      { to: '/events', label: 'ইভেন্টস', icon: CalendarDays },
      { to: '/posts', label: 'নোটিশ ও ব্লগ', icon: Files },
      { to: '/media', label: 'মিডিয়া লাইব্রেরি', icon: Image },
    ],
  },
  {
    section: 'ব্যবস্থাপনা',
    items: [
      { to: '/inbox', label: 'বার্তা', icon: Mail, roles: ['SUPER_ADMIN', 'ADMIN'], badgeKey: 'inbox' },
      { to: '/settings', label: 'সাইট সেটিংস', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { to: '/users', label: 'অ্যাডমিন ইউজার', icon: Users, roles: ['SUPER_ADMIN'] },
      { to: '/audit', label: 'কার্যক্রমের লগ', icon: Activity, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
];

export function AdminLayout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: unread } = useQuery({
    queryKey: ['inbox-unread'],
    queryFn: contactApi.unreadCount,
    enabled: can('SUPER_ADMIN', 'ADMIN'),
    refetchInterval: 120_000,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-brand text-white transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="text-xl font-bold">সময়ন</p>
            <p className="text-xs text-white/60">কনটেন্ট ম্যানেজমেন্ট</p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 pb-8">
          {NAV.map((group) => {
            const visible = group.items.filter((i) => !i.roles || can(...i.roles));
            if (!visible.length) return null;
            return (
              <div key={group.section} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  {group.section}
                </p>
                {visible.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                        isActive ? 'bg-white/15 font-semibold' : 'text-white/80 hover:bg-white/10',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badgeKey === 'inbox' && !!unread?.count && (
                      <span className="rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold">
                        {unread.count}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} type="button">
            <Menu className="h-6 w-6 text-slate-600" />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <a
              href={import.meta.env.VITE_PUBLIC_SITE_URL ?? 'https://somoyondu.netlify.app'}
              target="_blank"
              rel="noreferrer"
              className="hidden text-sm text-slate-500 hover:text-brand sm:block"
            >
              ওয়েবসাইট দেখুন ↗
            </a>
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {user?.name?.charAt(0) ?? '?'}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight">{user?.nameBn ?? user?.name}</p>
                  <p className="text-[11px] text-slate-500">{user?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                    onClick={() => { setMenuOpen(false); navigate('/change-password'); }}
                  >
                    পাসওয়ার্ড পরিবর্তন
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-brand-accent hover:bg-slate-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> লগ আউট
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
