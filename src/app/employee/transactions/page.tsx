'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { Transaction } from '@/types';
import { Clock, Search, AlertCircle, CheckCircle, XCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function EmployeeTransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [txnToDelete, setTxnToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchTransactions = () => {
    if (user) {
      fetch('/api/transaction/list')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.transactions)) {
            const my = data.transactions.filter(
              (t: Transaction) => t.submittedByUserId === user.uid || t.submittedByUserId === user.phoneNumber
            );
            setTransactions(my.length > 0 ? my : data.transactions);
          }
        })
        .catch((err) => console.error('Error fetching employee transactions:', err));
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const confirmDeleteTxn = async () => {
    if (!txnToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/transaction/delete?id=${encodeURIComponent(txnToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'লেনদেন মুছে ফেলতে ব্যর্থ হয়েছে');
      }
      setTransactions((prev) => prev.filter((t) => t.id !== txnToDelete.id));
      setTxnToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || 'ডাটাবেজ থেকে মুছে ফেলার সময় ত্রুটি ঘটেছে');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      (t?.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (t?.memberName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t?.memberCode || '').toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'ALL' || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE', 'CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="EMPLOYEE"
        title="আমার দাখিলকৃত সকল লেনদেন"
        subtitle="সিইও মহোদয়ের অনুমোদনের স্থিতি, গৃহীত ও প্রত্যাখ্যাত লেনদেনের তালিকা"
      >
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="আইডি বা সদস্যের নাম দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filter === st
                      ? 'bg-brand-green-800 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {st === 'ALL'
                    ? 'সকল লেনদেন'
                    : st === 'PENDING'
                    ? 'অপেক্ষমাণ'
                    : st === 'APPROVED'
                    ? 'অনুমোদিত'
                    : 'প্রত্যাখ্যাত'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-700 uppercase font-bold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-5">লেনদেন আইডি</th>
                    <th className="py-3.5 px-5">সদস্যের নাম ও কোড</th>
                    <th className="py-3.5 px-5">পরিমাণ</th>
                    <th className="py-3.5 px-5">ধরণ</th>
                    <th className="py-3.5 px-5">পেমেন্ট মেথড ও রেফ</th>
                    <th className="py-3.5 px-5">স্ট্যাটাস</th>
                    <th className="py-3.5 px-5">সিইও পর্যালোচনা ও কারণ</th>
                    <th className="py-3.5 px-5">দাখিলের তারিখ</th>
                    <th className="py-3.5 px-5 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400">
                        কোনো লেনদেন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{t.id}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-gray-900">{t.memberName}</div>
                          <div className="text-[10px] text-gray-500">{t.memberCode}</div>
                        </td>
                        <td className="py-3.5 px-5 font-black text-gray-900 text-sm">
                          {formatBDT(t.amountPoisha)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                            t.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {t.type === 'DEPOSIT' ? 'সঞ্চয় জমা' : 'উত্তোলন'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div>{t.paymentMethod}</div>
                          {t.referenceNumber && <span className="text-[10px] text-gray-400">রেফ: {t.referenceNumber}</span>}
                        </td>
                        <td className="py-3.5 px-5">
                          {t.status === 'APPROVED' ? (
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>অনুমোদিত</span>
                            </span>
                          ) : t.status === 'PENDING' ? (
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>অপেক্ষমাণ</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>প্রত্যাখ্যাত</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {t.status === 'REJECTED' && t.rejectionReason ? (
                            <div className="p-2 rounded-lg bg-red-50 text-red-700 text-[11px] font-medium border border-red-200 max-w-xs">
                              <span className="font-bold block text-red-800">প্রত্যাখ্যানের কারণ:</span>
                              {t.rejectionReason}
                            </div>
                          ) : t.status === 'APPROVED' ? (
                            <span className="text-[11px] text-emerald-700 font-medium">সিইও মহোদয় কর্তৃক অনুমোদিত</span>
                          ) : (
                            <span className="text-[11px] text-gray-400">পর্যালোচনা চলছে</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-gray-500 whitespace-nowrap">
                          {formatDateBengali(t.createdAt)}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {t.status === 'PENDING' ? (
                            <button
                              onClick={() => {
                                setDeleteError(null);
                                setTxnToDelete(t);
                              }}
                              title="অপেক্ষমাণ লেনদেন মুছে ফেলুন"
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Transaction Confirmation Modal */}
          {txnToDelete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">লেনদেন মুছে ফেলার নিশ্চিতকরণ</h3>
                    <p className="text-xs text-gray-500">ডাটাবেজ থেকে এন্ট্রি মুছে ফেলা হবে</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-600">
                    <span>লেনদেন আইডি:</span>
                    <span className="font-mono font-bold text-gray-900">{txnToDelete.id}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>সদস্য:</span>
                    <span className="font-bold text-gray-900">{txnToDelete.memberName} ({txnToDelete.memberCode})</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>পরিমাণ:</span>
                    <span className="font-bold text-brand-green-800">{formatBDT(txnToDelete.amountPoisha)}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে এই দাখিলকৃত লেনদেনটি মুছে ফেলতে চান?
                </p>

                {deleteError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {deleteError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxnToDelete(null);
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteTxn}
                    disabled={isDeleting}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                  >
                    {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>স্থায়ীভাবে মুছে ফেলুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
