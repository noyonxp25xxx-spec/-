'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';
import {
  Users,
  UserCheck,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { Transaction, Member } from '@/types';

export default function CeoDashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/list').then((r) => r.json()).catch(() => ({ success: false })),
      fetch('/api/transaction/list').then((r) => r.json()).catch(() => ({ success: false }))
    ]).then(([memData, txnData]) => {
      if (memData.success && Array.isArray(memData.members)) {
        setMembers(memData.members);
      }
      if (txnData.success && Array.isArray(txnData.transactions)) {
        setTransactions(txnData.transactions);
      }
    }).finally(() => setLoading(false));
  }, []);

  const totalMembers = members.length;
  const activeEmployeesCount = store.getEmployees().filter((e) => e.status === 'ACTIVE').length;

  const approvedDepositsPoisha = transactions
    .filter((t) => t.status === 'APPROVED' && t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amountPoisha, 0);

  const approvedWithdrawalsPoisha = transactions
    .filter((t) => t.status === 'APPROVED' && t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amountPoisha, 0);

  const totalAvailableBalancePoisha = members.reduce(
    (sum, m) => sum + m.currentBalancePoisha,
    0
  );

  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING');
  const recentTransactions = transactions.slice(0, 6);

  return (
    <ProtectedRoute allowedRoles={['CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="CEO"
        title="সিইও কেন্দ্রীয় ড্যাশবোর্ড ওভারভিউ"
        subtitle="ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থার সর্বিক আর্থিক চিত্র, সদস্য তহবিল ও লেনদেন পর্যবেক্ষণ"
        pendingCount={pendingTransactions.length}
      >
        <div className="space-y-8">
          {/* Urgent Pending Approvals Alert Banner */}
          {pendingTransactions.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-950">
                    {toBengaliNumber(pendingTransactions.length)}টি লেনদেন আপনার অনুমোদনের অপেক্ষায় রয়েছে!
                  </h4>
                  <p className="text-xs text-amber-800">
                    মাঠকর্মীদের দাখিলকৃত জমা ও উত্তোলনের অনুমোদন সম্পন্ন হলে তা সদস্যের লেজারে যোগ হবে।
                  </p>
                </div>
              </div>
              <Link
                href="/ceo/approvals"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>অনুমোদন প্যানেলে যান</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Balance */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">মোট সদস্য তহবিল ব্যালেন্স</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900 font-bengali">
                  {formatBDT(totalAvailableBalancePoisha)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>লেজার দ্বারা সমন্বিত প্রকৃত ব্যালেন্স</span>
                </div>
              </div>
            </div>

            {/* Total Approved Deposits */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">অনুমোদিত মোট জমা</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-blue-700" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-900 font-bengali">
                  {formatBDT(approvedDepositsPoisha)}
                </div>
                <div className="text-[11px] text-gray-500 font-medium mt-1">
                  সদস্যদের নিয়মিত ও মাসিক সঞ্চয়
                </div>
              </div>
            </div>

            {/* Total Approved Withdrawals */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">অনুমোদিত মোট উত্তোলন</span>
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-orange-700" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-orange-950 font-bengali">
                  {formatBDT(approvedWithdrawalsPoisha)}
                </div>
                <div className="text-[11px] text-gray-500 font-medium mt-1">
                  সদস্যদের পরিশোধিত সঞ্চয়
                </div>
              </div>
            </div>

            {/* Members & Staff Counts */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">সদস্য ও কর্মী সংখ্যা</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-700" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900 font-bengali">
                  {toBengaliNumber(totalMembers)} <span className="text-xs font-normal text-gray-500">জন সদস্য</span>
                </div>
                <div className="text-[11px] text-purple-700 font-semibold mt-1">
                  সক্রিয় কর্মী: {toBengaliNumber(activeEmployeesCount)} জন
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Management Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/ceo/approvals"
              className="p-6 rounded-3xl bg-gradient-to-br from-brand-navy-900 to-brand-navy-800 text-white shadow-md hover:shadow-xl transition-all group flex flex-col justify-between h-44"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-brand-orange-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  {pendingTransactions.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {toBengaliNumber(pendingTransactions.length)}টি পেন্ডিং
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base mt-4">আর্থিক লেনদেন অনুমোদন</h3>
                <p className="text-xs text-gray-300 mt-1">মাঠকর্মীদের দাখিলকৃত প্রতিটি জমা যাচাই ও অনুমোদন করুন</p>
              </div>
              <div className="text-xs font-bold text-brand-orange-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>অনুমোদন টেবিলে যান</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/ceo/members"
              className="p-6 rounded-3xl bg-gradient-to-br from-brand-green-900 to-brand-green-800 text-white shadow-md hover:shadow-xl transition-all group flex flex-col justify-between h-44"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base mt-4">সদস্য খতিয়ান ও তালিকা</h3>
                <p className="text-xs text-emerald-100 mt-1">নতুন সদস্য নিবন্ধন ও ব্যালেন্স হিস্ট্রি পর্যবেক্ষণ</p>
              </div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>সদস্য প্যানেলে যান</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/ceo/reports"
              className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md hover:shadow-xl transition-all group flex flex-col justify-between h-44"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base mt-4">অডিট ও আর্থিক রিপোর্ট</h3>
                <p className="text-xs text-gray-300 mt-1">দৈনিক, মাসিক ও বার্ষিক ব্যালেন্স শিট এবং এক্সপোর্ট</p>
              </div>
              <div className="text-xs font-bold text-blue-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>রিপোর্ট তৈরি করুন</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Recent Financial Transactions Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900">সাম্প্রতিক আর্থিক লেনদেন ও স্থিতি</h3>
                <p className="text-xs text-gray-500 mt-0.5">সংস্থায় জমাকৃত ও অনুমোদিত সর্বশেষ আর্থিক কার্যক্রম</p>
              </div>
              <Link
                href="/ceo/transactions"
                className="text-xs font-bold text-brand-green-800 hover:underline flex items-center gap-1"
              >
                <span>সকল লেনদেন দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-700 uppercase font-bold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-5">লেনদেন আইডি</th>
                    <th className="py-3 px-5">সদস্যের নাম ও আইডি</th>
                    <th className="py-3 px-5">দাখিলকারী কর্মী</th>
                    <th className="py-3 px-5">পরিমাণ</th>
                    <th className="py-3 px-5">লেনদেনের ধরণ</th>
                    <th className="py-3 px-5">পেমেন্ট মেথড</th>
                    <th className="py-3 px-5">স্ট্যাটাস</th>
                    <th className="py-3 px-5">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm font-semibold text-gray-700">এখনও কোনো আর্থিক লেনদেন সম্পন্ন হয়নি।</p>
                        <p className="text-xs text-gray-400 mt-1">মাঠকর্মীদের মাধ্যমে সঞ্চয় জমা বা উত্তোলন দাখিল করা হলে এখানে প্রদর্শিত হবে।</p>
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{t.id}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-gray-900">{t.memberName}</div>
                          <div className="text-[10px] text-gray-500">{t.memberCode}</div>
                        </td>
                        <td className="py-3.5 px-5 text-gray-800">{t.submittedByEmployeeName}</td>
                        <td className="py-3.5 px-5 font-bold text-gray-900 text-sm">
                          {formatBDT(t.amountPoisha)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            t.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {t.type === 'DEPOSIT' ? 'সঞ্চয় জমা' : 'উত্তোলন'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">{t.paymentMethod}</td>
                        <td className="py-3.5 px-5">
                          {t.status === 'APPROVED' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                              অনুমোদিত
                            </span>
                          ) : t.status === 'PENDING' ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                              অপেক্ষমাণ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[10px]">
                              প্রত্যাখ্যাত
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-gray-500">
                          {formatDateBengali(t.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registered Members Table Section */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900">নিবন্ধিত সমবায় সদস্যবৃন্দ ({toBengaliNumber(members.length)} জন)</h3>
                <p className="text-xs text-gray-500 mt-0.5">ডাটাবেজে সংরক্ষিত সংস্থার সদস্যদের সংক্ষিপ্ত তালিকা</p>
              </div>
              <Link
                href="/ceo/members"
                className="text-xs font-bold text-brand-green-800 hover:underline flex items-center gap-1"
              >
                <span>সম্পূর্ণ সদস্য তালিকা ও খতিয়ান</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-700 uppercase font-bold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-5">সদস্য আইডি</th>
                    <th className="py-3.5 px-5">নাম ও ঠিকানা</th>
                    <th className="py-3.5 px-5">মোবাইল নম্বর</th>
                    <th className="py-3.5 px-5">বর্তমান ব্যালেন্স</th>
                    <th className="py-3.5 px-5">স্ট্যাটাস</th>
                    <th className="py-3.5 px-5 text-gray-500">যোগদান</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        এখনো কোনো সদস্য নিবন্ধিত হয়নি। &ldquo;সদস্য প্যানেল&rdquo;-এ গিয়ে নতুন সদস্য যোগ করুন।
                      </td>
                    </tr>
                  ) : (
                    members.slice(0, 6).map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{m.memberId}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-gray-900">{m.name}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-xs">{m.address}</div>
                        </td>
                        <td className="py-3.5 px-5 font-mono">{m.phone}</td>
                        <td className="py-3.5 px-5 font-bold text-brand-green-900">
                          {formatBDT(m.currentBalancePoisha || 0)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            {m.status === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-gray-500">{formatDateBengali(m.joiningDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
