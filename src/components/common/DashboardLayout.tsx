'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckCircle,
  FileText,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  PlusCircle,
  Clock,
  Home,
  User,
  UserCog,
  Image as ImageIcon,
  Bell,
  ShieldCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  portalType: 'CEO' | 'EMPLOYEE' | 'MAINTENANCE';
  title: string;
  subtitle?: string;
  pendingCount?: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  portalType,
  title,
  subtitle,
  pendingCount = 0,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  interface NavLinkItem {
    href: string;
    label: string;
    icon: any;
    badge?: number;
  }

  // CEO Nav Links
  const ceoLinks: NavLinkItem[] = [
    { href: '/ceo/dashboard', label: 'ড্যাশবোর্ড ওভারভিউ', icon: LayoutDashboard },
    { href: '/ceo/approvals', label: 'আর্থিক অনুমোদন', icon: CheckCircle, badge: pendingCount > 0 ? pendingCount : undefined },
    { href: '/ceo/transactions', label: 'সকল লেনদেন ও লেজার', icon: CreditCard },
    { href: '/ceo/members', label: 'সদস্য ব্যবস্থাপনা', icon: Users },
    { href: '/ceo/employees', label: 'কর্মী ব্যবস্থাপনা', icon: UserCheck },
    { href: '/ceo/accounts', label: 'অ্যাকাউন্ট ব্যবস্থাপনা', icon: UserCog },
    { href: '/ceo/reports', label: 'আর্থিক অডিট রিপোর্ট', icon: FileText },
    { href: '/ceo/audit-logs', label: 'অডিট লগ হিস্ট্রি', icon: Shield },
    { href: '/ceo/settings', label: 'সিস্টেম সেটিংস', icon: Settings },
  ];

  // Employee Nav Links
  const employeeLinks: NavLinkItem[] = [
    { href: '/employee/dashboard', label: 'কর্মক্ষেত্র ওভারভিউ', icon: LayoutDashboard },
    { href: '/employee/collections', label: 'নতুন সঞ্চয় কালেকশন', icon: PlusCircle },
    { href: '/employee/transactions', label: 'আমার দাখিলকৃত লেনদেন', icon: Clock },
    { href: '/employee/members', label: 'সদস্য তালিকা ও খতিয়ান', icon: Users },
    { href: '/employee/profile', label: 'আমার প্রোফাইল', icon: User },
  ];

  // Maintenance Nav Links
  const maintenanceLinks: NavLinkItem[] = [
    { href: '/maintenance/dashboard', label: 'হোমপেজ কনটেন্ট পরিচালনা', icon: LayoutDashboard },
  ];

  const currentLinks =
    portalType === 'CEO'
      ? ceoLinks
      : portalType === 'EMPLOYEE'
      ? employeeLinks
      : maintenanceLinks;

  const roleTitle =
    portalType === 'CEO'
      ? 'সিইও ও সেন্ট্রাল অ্যাডমিন প্যানেল'
      : portalType === 'EMPLOYEE'
      ? 'মাঠকর্মী ও কালেকশন পোর্টাল'
      : 'ওয়েবসাইট রক্ষণাবেক্ষণ প্যানেল';

  const roleBadgeColor =
    portalType === 'CEO'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : portalType === 'EMPLOYEE'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : 'bg-blue-100 text-blue-900 border-blue-300';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-navy-950 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-brand-navy-800">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white">
            <Image src="/logo.jpg" alt="লোগো" fill className="object-cover" />
          </div>
          <span className="font-bold text-sm tracking-tight">ভাগ্য উন্নয়ন সমবায়</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-brand-navy-900 text-gray-200 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-72 bg-brand-navy-950 text-white flex flex-col border-r border-brand-navy-900 z-50 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand in Sidebar */}
        <div className="p-5 border-b border-brand-navy-900 flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-green-500 bg-white flex-shrink-0">
            <Image src="/logo.jpg" alt="লোগো" fill className="object-cover" />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm text-white truncate">ভাগ্য উন্নয়ন সমাজ কল্যাণ</h2>
            <div className="text-[11px] text-brand-orange-400 font-medium truncate">
              {roleTitle}
            </div>
          </div>
        </div>

        {/* Current User Card */}
        <div className="px-4 py-3 bg-brand-navy-900/60 border-b border-brand-navy-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-green-700 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              {user?.displayName ? user.displayName[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-gray-200 truncate">{user?.displayName || 'ব্যবহারকারী'}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadgeColor}`}>
            {portalType}
          </span>
        </div>

        {/* CEO All-Access Portal Switcher - Prominent at TOP of Sidebar */}
        {(user?.role === 'CEO' || portalType === 'CEO') && (
          <div className="mx-3 mt-3 p-3 bg-brand-navy-900 rounded-2xl border-2 border-brand-orange-500/50 shadow-lg">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className="text-[11px] font-black text-brand-orange-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-orange-400" />
                <span>সিইও অল-অ্যাক্সেস পোর্টাল:</span>
              </span>
              <span className="text-[9px] bg-brand-orange-500 text-brand-navy-950 font-black px-1.5 py-0.5 rounded">
                ALL ACCESS
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Link
                href="/ceo/dashboard"
                onClick={() => setSidebarOpen(false)}
                className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition flex flex-col items-center justify-center gap-0.5 ${
                  portalType === 'CEO'
                    ? 'bg-amber-500 text-white shadow-md ring-2 ring-white/50'
                    : 'bg-brand-navy-950 text-gray-300 hover:bg-brand-navy-800 hover:text-white border border-brand-navy-800'
                }`}
              >
                <span className="text-sm">👑</span>
                <span>সিইও</span>
              </Link>
              <Link
                href="/employee/dashboard"
                onClick={() => setSidebarOpen(false)}
                className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition flex flex-col items-center justify-center gap-0.5 ${
                  portalType === 'EMPLOYEE'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-white/50'
                    : 'bg-brand-navy-950 text-gray-300 hover:bg-brand-navy-800 hover:text-white border border-brand-navy-800'
                }`}
              >
                <span className="text-sm">💼</span>
                <span>কর্মী</span>
              </Link>
              <Link
                href="/maintenance/dashboard"
                onClick={() => setSidebarOpen(false)}
                className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition flex flex-col items-center justify-center gap-0.5 ${
                  portalType === 'MAINTENANCE'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-white/50'
                    : 'bg-brand-navy-950 text-gray-300 hover:bg-brand-navy-800 hover:text-white border border-brand-navy-800'
                }`}
              >
                <span className="text-sm">🛠️</span>
                <span>আইটি</span>
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {currentLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-brand-green-800 text-white shadow-md font-semibold'
                    : 'text-gray-300 hover:bg-brand-navy-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-orange-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-brand-navy-900 space-y-2">
          {user && (
            <div className="bg-brand-navy-900/80 p-2.5 rounded-xl border border-brand-navy-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white truncate">{user.displayName}</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                আইডি: {user.phoneNumber || user.email}
              </div>
            </div>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-2 py-1.5 transition"
          >
            <Home className="w-4 h-4 text-brand-orange-400" />
            <span>মূল ওয়েবসাইটে ফিরুন</span>
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 bg-red-900/60 hover:bg-red-800 text-red-100 px-3 py-2 rounded-lg text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-bengali leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 font-medium font-bengali mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* CEO Top Bar All-Access Switcher */}
            {(user?.role === 'CEO' || portalType === 'CEO') && (
              <div className="flex items-center gap-1 bg-brand-navy-950 p-1.5 rounded-2xl shadow-sm border border-brand-navy-800">
                <span className="text-[10px] font-bold text-brand-orange-400 px-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-orange-400" />
                  <span className="hidden sm:inline">অল-অ্যাক্সেস:</span>
                </span>
                <Link
                  href="/ceo/dashboard"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    portalType === 'CEO'
                      ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                      : 'text-gray-300 hover:text-white hover:bg-brand-navy-900'
                  }`}
                  title="সিইও কেন্দ্রীয় ড্যাশবোর্ড"
                >
                  <span>👑 সিইও</span>
                </Link>
                <Link
                  href="/employee/dashboard"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    portalType === 'EMPLOYEE'
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                      : 'text-gray-300 hover:text-white hover:bg-brand-navy-900'
                  }`}
                  title="মাঠকর্মী ও কালেকশন পোর্টাল"
                >
                  <span>💼 কর্মী</span>
                </Link>
                <Link
                  href="/maintenance/dashboard"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    portalType === 'MAINTENANCE'
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                      : 'text-gray-300 hover:text-white hover:bg-brand-navy-900'
                  }`}
                  title="হোমপেজ ও আইটি রক্ষণাবেক্ষণ"
                >
                  <span>🛠️ আইটি</span>
                </Link>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>ডাটাবেস স্ট্যাটাস: সুরক্ষিত ও সক্রিয়</span>
            </div>
            <Link
              href="/"
              className="text-xs font-medium text-brand-green-800 hover:underline flex items-center gap-1 px-2 py-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>ওয়েবসাইট</span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
