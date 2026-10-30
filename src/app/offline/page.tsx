'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-bengali text-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-gray-200 space-y-6">
        <div className="flex justify-center">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-green-800 shadow-md bg-white">
            <Image src="/logo.jpg" alt="লোগো" fill className="object-cover" priority />
          </div>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <WifiOff className="w-7 h-7 text-amber-700" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            ইন্টারনেট সংযোগ বিচ্ছিন্ন রয়েছে
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            আপনি বর্তমানে অফলাইনে রয়েছেন। আপনার ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs text-emerald-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>আর্থিক নিরাপত্তা বিজ্ঞপ্তি:</strong> সদস্যদের তহবিলের শতভাগ নিরাপত্তা ও নির্ভুল হিসাব নিশ্চিত রাখতে আর্থিক লেনদেন, ব্যালেন্স ও অনুমোদন অফলাইনে সংরক্ষণ করা হয় না।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReload}
            className="flex-1 py-3 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় চেষ্টা করুন</span>
          </button>
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>হোমে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
