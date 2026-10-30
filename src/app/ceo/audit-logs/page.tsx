'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatDateTimeBengali, toBengaliNumber } from '@/lib/utils';
import { AuditLog } from '@/types';
import { ShieldCheck, Search, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

export default function CeoAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLogs(store.getAuditLogs());
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.actionType.toLowerCase().includes(search.toLowerCase()) ||
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      (l.reason && l.reason.toLowerCase().includes(search.toLowerCase())) ||
      (l.targetId && l.targetId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <ProtectedRoute allowedRoles={['CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="CEO"
        title="নিরাপত্তা ও অপারেশনাল অডিট লগ"
        subtitle="সিস্টেমের প্রতিটি লগইন, কর্মী তৈরি, আর্থিক অনুমোদন ও পরিবর্তনের অপরিবর্তনীয় রেকর্ড"
      >
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="অ্যাকশন, কর্মী বা কারণ দিয়ে ফিল্টার..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
              />
            </div>

            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-xl border border-emerald-200 font-semibold">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>সার্ভার-সাইড টাইমস্ট্যাম্প ও অডিট সুরক্ষা সক্রিয়</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-700 uppercase font-bold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-5">সময় ও তারিখ</th>
                    <th className="py-3.5 px-5">কর্মকর্তা / সম্পাদনকারী</th>
                    <th className="py-3.5 px-5">অ্যাকশনের ধরণ</th>
                    <th className="py-3.5 px-5">টার্গেট সত্ত্বা</th>
                    <th className="py-3.5 px-5">ফলাফল</th>
                    <th className="py-3.5 px-5">কারণ ও বিবরণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5 whitespace-nowrap text-gray-500 font-medium">
                        {formatDateTimeBengali(log.timestamp)}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-gray-900">{log.actorName}</div>
                        <div className="text-[10px] text-gray-400">রোল: {log.actorRole}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-[10px] text-brand-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-gray-800">{log.targetEntity}</span>
                        {log.targetId && (
                          <span className="text-[10px] text-gray-400 block font-mono">
                            #{log.targetId}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {log.outcome}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-gray-700">
                        {log.reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
