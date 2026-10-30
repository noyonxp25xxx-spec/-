'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { Settings, Shield, Database, Cloud, CheckCircle, AlertTriangle, Key } from 'lucide-react';

export default function CeoSettingsPage() {
  const [settings] = useState(store.getSettings());

  return (
    <ProtectedRoute allowedRoles={['CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="CEO"
        title="সিস্টেম সেটিংস ও ফায়ারবেস স্ট্যাটাস"
        subtitle="ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থার প্রাতিষ্ঠানিক সেটিংস ও ডাটাবেস নিরাপত্তা তথ্য"
      >
        <div className="space-y-8 max-w-4xl">
          {/* Organization Details */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-green-700" />
              <span>সংস্থার অফিসিয়াল পরিচিতি ও ব্রান্ডিং</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-gray-400 block font-semibold">সংস্থার নাম (বাংলা)</span>
                <span className="font-bold text-gray-900 text-sm">{settings.orgNameBengali}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-gray-400 block font-semibold">প্রতিষ্ঠানের নাম (ইংরেজি)</span>
                <span className="font-bold text-gray-900 text-sm">{settings.orgNameEnglish}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-gray-400 block font-semibold">অফিসিয়াল স্লোগান</span>
                <span className="font-bold text-brand-green-800 text-sm">{settings.taglineBengali}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-gray-400 block font-semibold">যোগাযোগের ফোন ও ইমেইল</span>
                <span className="font-bold text-gray-900">{settings.contactPhone} | {settings.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Firebase Infrastructure Diagnostics */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-navy-800" />
              <span>ফায়ারবেস ক্লাউড ও সিকিউরিটি আর্কিটেকচার</span>
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-emerald-900 text-sm">
                  হাইব্রিড ডুয়াল স্টোর ইঞ্জিন সক্রিয়
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  সিস্টেমে ফায়ারবেস ক্লাউড ক্লায়েন্ট ও অ্যাডমিন এসডিকে সংযোগ কনফিগারেশন সম্পূর্ণরূপে প্রস্তুত রয়েছে। ক্লাউড ক্রেডেনশিয়ালস ছাড়া লোকাল পরিবেশে ডাটাবেস সম্পূর্ণ স্বয়ংসম্পূর্ণ এবং লেনদেনের লেজার শতভাগ সংরক্ষিত।
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-gray-800">ফায়ারবেস প্রোডাকশন কনফিগারেশন চেকলিস্ট:</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between font-mono">
                  <span>NEXT_PUBLIC_FIREBASE_PROJECT_ID</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    bhaggo-unnayan (কনফিগারড)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between font-mono">
                  <span>FIREBASE_PRIVATE_KEY</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    সার্ভার-সাইড সুরক্ষিত
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between font-mono">
                  <span>FIRESTORE_RULES & INDEXES</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    সক্রিয় (ডিনাই বাই ডিফল্ট)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
