'use client';

import React, { useState } from 'react';
import { PublicNotice } from '@/types';
import { formatDateBengali } from '@/lib/utils';
import { Bell, AlertCircle, FileText, ChevronRight, X } from 'lucide-react';

interface NoticesProps {
  notices: PublicNotice[];
}

export const Notices: React.FC<NoticesProps> = ({ notices }) => {
  const [activeNotice, setActiveNotice] = useState<PublicNotice | null>(null);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'FINANCIAL':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">আর্থিক তথ্য</span>;
      case 'PROGRAM':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">কর্মসূচি</span>;
      case 'EMERGENCY':
        return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">জরুরী ঘোষণা</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">সাধারণ নোটিশ</span>;
    }
  };

  return (
    <section id="notices" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-brand-green-800 text-xs font-bold tracking-wide">
              <Bell className="w-3.5 h-3.5" />
              <span>বিজ্ঞপ্তি ও সার্কুলার</span>
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy-950">
              অফিসিয়াল নোটিশ বোর্ড
            </h2>
            <p className="text-sm text-gray-600">
              সংস্থার সাধারণ সভা, বার্ষিক হিসাব, কর্মসূচি ও গুরুত্বপূর্ণ প্রশাসনিক ঘোষণা
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => {
            const isHigh = notice.priority === 'HIGH';
            return (
              <div
                key={notice.id}
                onClick={() => setActiveNotice(notice)}
                className={`cursor-pointer rounded-2xl p-6 bg-white border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                  isHigh ? 'border-l-4 border-l-red-500 border-gray-200' : 'border-gray-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {getCategoryBadge(notice.category)}
                    {isHigh && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>জরুরি</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-2">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>প্রকাশ: {formatDateBengali(notice.publishedAt)}</span>
                  <span className="text-brand-green-700 font-semibold flex items-center gap-1">
                    <span>বিস্তারিত</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice Modal */}
        {activeNotice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(activeNotice.category)}
                    <span className="text-xs text-gray-500">
                      তারিখ: {formatDateBengali(activeNotice.publishedAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-snug">
                    {activeNotice.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveNotice(null)}
                  className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {activeNotice.content}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
                <span>বিজ্ঞপ্তি প্রদানকারী: {activeNotice.authorName}</span>
                <button
                  onClick={() => setActiveNotice(null)}
                  className="px-5 py-2 bg-brand-green-800 text-white rounded-xl text-xs font-semibold hover:bg-brand-green-900 transition"
                >
                  পড়া হয়েছে
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
