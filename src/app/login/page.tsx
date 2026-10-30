'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { LogIn, Lock, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function UnifiedLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('অনুগ্রহ করে মোবাইল নম্বর, ইউজার আইডি অথবা ইমেইল প্রদান করুন।');
      return;
    }

    if (!password) {
      setError('অনুগ্রহ করে আপনার গোপন পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    const res = await login(cleanId, password);
    setIsSubmitting(false);

    if (res.success && res.user) {
      // Automatic routing to the correct portal based on role
      if (res.redirectUrl) {
        router.push(res.redirectUrl);
      } else if (res.user.role === 'CEO') {
        router.push('/ceo/dashboard');
      } else if (res.user.role === 'EMPLOYEE') {
        router.push('/employee/dashboard');
      } else if (res.user.role === 'MAINTENANCE') {
        router.push('/maintenance/dashboard');
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'ভুল ইউজার আইডি বা গোপন পাসওয়ার্ড। সঠিক তথ্য দিয়ে চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy-950 via-brand-navy-900 to-brand-green-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-orange-500 shadow-2xl bg-white hover:scale-105 transition-transform duration-200">
            <Image src="/logo.jpg" alt="লোগো" fill className="object-cover" priority />
          </div>
        </Link>
        <h2 className="text-center text-2xl font-extrabold text-white">
          অফিসিয়াল পোর্টাল লগইন
        </h2>
        <p className="mt-1 text-center text-xs text-brand-orange-300">
          ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা — মানবতার সেবায়, উন্নয়নের প্রত্যয়ে
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl border border-gray-100 sm:px-10 space-y-6 text-gray-900">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 flex items-start gap-2.5 text-xs text-gray-700">
            <ShieldCheck className="w-4 h-4 text-brand-green-700 flex-shrink-0 mt-0.5" />
            <span>
              সিইও, মাঠকর্মী বা আইটি স্টাফ—আপনার নির্ধারিত আইডি ও পাসওয়ার্ড দিলে সিস্টেম স্বয়ংক্রিয়ভাবে আপনার ড্যাশবোর্ডে প্রবেশ করাবে।
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700">
                মোবাইল নম্বর / ইউজার আইডি / ইমেইল *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-navy-900 focus:ring-1 focus:ring-brand-navy-900"
                  placeholder="যেমন: 01706338181 বা ইমেইল"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700">গোপন পাসওয়ার্ড *</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-navy-900 focus:ring-1 focus:ring-brand-navy-900"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-brand-navy-900 hover:bg-brand-navy-950 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 text-brand-orange-400" />
              )}
              <span>লগইন করুন</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy-900 transition font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল ওয়েবসাইটে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
