'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, Mail, Shield, UserCheck, Lock, ChevronDown, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { PWAInstaller } from './PWAInstaller';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar with Contact Info & Portal Access */}
      <div className="bg-brand-navy-900 text-white text-xs py-2 px-4 md:px-8 border-b border-brand-navy-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 text-gray-200">
              <Phone className="w-3.5 h-3.5 text-brand-orange-500" />
              <span>+৮৮০ ১৭১২-৩৪৫৬৭৮</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-200">
              <Mail className="w-3.5 h-3.5 text-brand-orange-500" />
              <span>contact@bhaggounnayan.org</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstaller variant="nav" />
            <Link
              href="/statement"
              className="flex items-center gap-1.5 bg-brand-orange-500 hover:bg-brand-orange-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow-xs"
            >
              <FileText className="w-3 h-3" />
              <span>স্টেটমেন্ট</span>
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-300 font-medium">
                  স্বাগতম, <span className="text-brand-orange-500">{user.displayName}</span> ({user.role})
                </span>
                <Link
                  href={user.role === 'CEO' ? '/ceo/dashboard' : user.role === 'EMPLOYEE' ? '/employee/dashboard' : '/maintenance/dashboard'}
                  className="bg-brand-green-700 hover:bg-brand-green-800 text-white px-2.5 py-0.5 rounded text-xs transition"
                >
                  ড্যাশবোর্ড
                </Link>
                <button
                  onClick={() => logout()}
                  className="bg-red-700 hover:bg-red-800 text-white px-2 py-0.5 rounded text-xs transition"
                >
                  প্রস্থান
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-brand-green-800 hover:bg-brand-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition shadow-xs"
              >
                <Lock className="w-3 h-3 text-brand-orange-400" />
                <span>পোর্টাল লগইন</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-brand-green-800 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.jpg"
              alt="ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা লোগো"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-green-900 leading-tight tracking-tight">
              ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা
            </h1>
            <p className="text-xs md:text-sm text-brand-navy-900 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-brand-orange-500 inline-block animate-pulse"></span>
              "মানবতার সেবায়, উন্নয়নের প্রত্যয়ে"
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-brand-green-800 font-medium text-sm transition">
            হোম
          </Link>
          <Link href="/#about" className="text-gray-700 hover:text-brand-green-800 font-medium text-sm transition">
            আমাদের সম্পর্কে
          </Link>
          <Link href="/#mission" className="text-gray-700 hover:text-brand-green-800 font-medium text-sm transition">
            লক্ষ্য ও উদ্দেশ্য
          </Link>
          <Link href="/#activities" className="text-gray-700 hover:text-brand-green-800 font-medium text-sm transition">
            কার্যক্রম ও প্রকল্প
          </Link>
          <Link href="/#notices" className="text-gray-700 hover:text-brand-green-800 font-medium text-sm transition">
            নোটিশ বোর্ড
          </Link>
          <Link href="/statement" className="text-brand-orange-600 hover:text-brand-orange-700 font-bold text-sm transition flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>স্টেটমেন্ট</span>
          </Link>
          <Link href="/#contact" className="text-gray-700 hover:text-brand-green-800 font-medium text-sm transition">
            যোগাযোগ
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-brand-green-900 hover:bg-gray-100 focus:outline-none"
          aria-label="মোবাইল মেনু খুলুন"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-medium border-b border-gray-100"
          >
            হোম
          </Link>
          <Link
            href="/statement"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-brand-orange-600 font-bold border-b border-gray-100 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>সদস্য ব্যাংক স্টেটমেন্ট</span>
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-medium border-b border-gray-100"
          >
            আমাদের সম্পর্কে
          </Link>
          <Link
            href="/#mission"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-medium border-b border-gray-100"
          >
            লক্ষ্য ও উদ্দেশ্য
          </Link>
          <Link
            href="/#activities"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-medium border-b border-gray-100"
          >
            কার্যক্রম ও প্রকল্প
          </Link>
          <Link
            href="/#notices"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-medium border-b border-gray-100"
          >
            নোটিশ বোর্ড
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-medium border-b border-gray-100"
          >
            যোগাযোগ
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <PWAInstaller variant="button" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-brand-green-800 text-white py-2.5 rounded-lg text-center font-semibold text-sm"
            >
              পোর্টাল লগইন
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
