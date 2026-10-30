'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { Transaction, Employee } from '@/types';
import Link from 'next/link';
import {
  Wallet,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      fetch('/api/transaction/list')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.transactions)) {
            const myTxns = data.transactions.filter(
              (t: Transaction) => t.submittedByUserId === user.uid || t.submittedByUserId === user.phoneNumber
            );
            setMyTransactions(myTxns.length > 0 ? myTxns : data.transactions);
          }
        })
        .catch((err) => console.error('Error fetching employee transactions:', err));

      fetch('/api/employee/list')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.employees)) {
            const emp = data.employees.find((e: Employee) => e.userId === user.uid || e.phone === user.phoneNumber);
            if (emp) setEmployee(emp);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const pendingCount = myTransactions.filter((t) => t.status === 'PENDING').length;
  const approvedCount = myTransactions.filter((t) => t.status === 'APPROVED').length;
  const rejectedCount = myTransactions.filter((t) => t.status === 'REJECTED').length;

  const totalCollected = myTransactions
    .filter((t) => t.status === 'APPROVED' && t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amountPoisha, 0);

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE', 'CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="EMPLOYEE"
        title="মাঠকর্মী কর্মক্ষেত্র ওভারভিউ"
        subtitle="সদস্যদের সঞ্চয় সংগ্রহ, নতুন লেনদেন দাখিল ও অনুমোদনের স্থিতি পর্যবেক্ষণ"
      >
        <div className="space-y-8">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-brand-green-900 via-brand-green-800 to-brand-navy-900 rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-orange-400 uppercase tracking-wide">
                মাঠকর্মী পোর্টাল | দায়িত্বপ্রাপ্ত এলাকা: {employee?.assignedArea || 'সাধারণ জোন'}
              </span>
              <h2 className="text-2xl font-bold font-bengali">
                স্বাগতম, {user?.displayName || employee?.name || 'মাঠকর্মী'}
              </h2>
              <p className="text-xs text-emerald-100 max-w-xl">
                সদস্যদের কাছ থেকে সংগৃহীত সঞ্চয় সঠিক রসিদ ও রেফারেন্সসহ সাবমিট করুন। সিইও মহোদয়ের অনুমোদনের পর তা স্বয়ংক্রিয়ভাবে সদস্যের স্থায়ী লেজারে যুক্ত হবে।
              </p>
            </div>

            <Link
              href="/employee/collections"
              className="px-6 py-3.5 rounded-2xl bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন সঞ্চয় কালেকশন জমা দিন</span>
            </Link>
          </div>

          {/* Stats Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase">আমার অনুমোদিত মোট কালেকশন</span>
              <div className="text-2xl font-black text-brand-green-900 font-bengali">
                {formatBDT(totalCollected)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">সিইও কর্তৃক যাচাইকৃত</div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase">অনুমোদনের অপেক্ষায় (পেন্ডিং)</span>
              <div className="text-2xl font-black text-amber-600 font-bengali">
                {toBengaliNumber(pendingCount)} টি
              </div>
              <div className="text-[11px] text-amber-700 font-medium">সিইও পর্যালোচনায় রয়েছে</div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase">অনুমোদিত লেনদেন</span>
              <div className="text-2xl font-black text-emerald-700 font-bengali">
                {toBengaliNumber(approvedCount)} টি
              </div>
              <div className="text-[11px] text-gray-500">লেজারে সফলভাবে লিপিবদ্ধ</div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase">প্রত্যাখ্যাত লেনদেন</span>
              <div className="text-2xl font-black text-red-600 font-bengali">
                {toBengaliNumber(rejectedCount)} টি
              </div>
              <div className="text-[11px] text-red-700 font-medium">সংশোধন করে পুনরায় দাখিলযোগ্য</div>
            </div>
          </div>

          {/* Recent Submitted Transactions */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">আমার সর্বশেষ দাখিলকৃত লেনদেন</h3>
                <p className="text-xs text-gray-500 mt-0.5">আপনার সাম্প্রতিক জমা ও কালেকশন এন্ট্রি</p>
              </div>
              <Link
                href="/employee/transactions"
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
                    <th className="py-3 px-5">সদস্যের নাম</th>
                    <th className="py-3 px-5">পরিমাণ</th>
                    <th className="py-3 px-5">পেমেন্ট মেথড ও রেফ</th>
                    <th className="py-3 px-5">স্ট্যাটাস</th>
                    <th className="py-3 px-5">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myTransactions.slice(0, 5).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{t.id}</td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-gray-900">{t.memberName}</div>
                        <div className="text-[10px] text-gray-500">{t.memberCode}</div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-gray-900 text-sm">
                        {formatBDT(t.amountPoisha)}
                      </td>
                      <td className="py-3.5 px-5">
                        <div>{t.paymentMethod}</div>
                        {t.referenceNumber && <span className="text-[10px] text-gray-400">রেফ: {t.referenceNumber}</span>}
                      </td>
                      <td className="py-3.5 px-5">
                        {t.status === 'APPROVED' ? (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            অনুমোদিত
                          </span>
                        ) : t.status === 'PENDING' ? (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                            অপেক্ষমাণ
                          </span>
                        ) : (
                          <div>
                            <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[10px]">
                              প্রত্যাখ্যাত
                            </span>
                            {t.rejectionReason && (
                              <span className="text-[10px] text-red-600 block mt-0.5">
                                কারণ: {t.rejectionReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-gray-500">{formatDateBengali(t.createdAt)}</td>
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
