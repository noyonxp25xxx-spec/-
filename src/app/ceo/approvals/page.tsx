'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateTimeBengali, toBengaliNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { Transaction } from '@/types';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  User,
  ExternalLink,
  Loader2,
  Check,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CeoApprovalsPage() {
  const [pendingTxns, setPendingTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingTxn, setRejectingTxn] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmApproveTxn, setConfirmApproveTxn] = useState<Transaction | null>(null);
  const [txnToDelete, setTxnToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const { user } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transaction/list?status=PENDING');
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setPendingTxns(data.transactions);
      }
    } catch (err) {
      console.error('Failed to load pending transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (txn: Transaction) => {
    setApprovingId(txn.id);
    setActionMessage(null);

    try {
      const res = await fetch('/api/transaction/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: txn.id,
          reviewerUserId: user?.uid
        })
      });
      const data = await res.json();

      if (data.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
        setActionMessage({
          text: `লেনদেন #${txn.id} সফলভাবে অনুমোদিত হয়েছে এবং সদস্যের তহবিলে ${formatBDT(txn.amountPoisha)} সমন্বয় করা হয়েছে।`,
          type: 'success'
        });
        setConfirmApproveTxn(null);
        loadData();
      } else {
        setActionMessage({
          text: data.error || 'অনুমোদন ব্যর্থ হয়েছে।',
          type: 'error'
        });
      }
    } catch {
      setActionMessage({ text: 'সার্ভারে সংযোগ স্থাপন সম্ভব হয়নি।', type: 'error' });
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTxn) return;
    if (!rejectionReason.trim()) {
      setActionMessage({ text: 'প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।', type: 'error' });
      return;
    }

    setApprovingId(rejectingTxn.id);
    setActionMessage(null);

    try {
      const res = await fetch('/api/transaction/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: rejectingTxn.id,
          reviewerUserId: user?.uid,
          rejectionReason: rejectionReason.trim()
        })
      });
      const data = await res.json();

      if (data.success) {
        setActionMessage({
          text: `লেনদেন #${rejectingTxn.id} প্রত্যাখ্যাত হিসেবে চিহ্নিত করা হয়েছে। সদস্যের ব্যালেন্সে কোনো পরিবর্তন হয়নি।`,
          type: 'success'
        });
        setRejectingTxn(null);
        setRejectionReason('');
        loadData();
      } else {
        setActionMessage({ text: data.error || 'প্রত্যাখ্যান ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'সার্ভার ত্রুটি।', type: 'error' });
    } finally {
      setApprovingId(null);
    }
  };

  const confirmDeleteTxn = async () => {
    if (!txnToDelete) return;
    setIsDeleting(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/transaction/delete?id=${encodeURIComponent(txnToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'লেনদেন মুছে ফেলতে ব্যর্থ হয়েছে');
      }
      setActionMessage({
        text: `লেনদেন #${txnToDelete.id} ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে।`,
        type: 'success'
      });
      setTxnToDelete(null);
      loadData();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'মুছে ফেলার সময় সমস্যা হয়েছে', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="CEO"
        title="আর্থিক অনুমোদন নিয়ন্ত্রণ কেন্দ্র"
        subtitle="মাঠকর্মী ও কর্মকর্তাদের দাখিলকৃত লেনদেন যাচাই, অনুমোদন ও বাতিলকরণ"
        pendingCount={pendingTxns.length}
      >
        <div className="space-y-6">
          {/* Notification feedback */}
          {actionMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xs animate-in fade-in ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-red-50 text-red-900 border border-red-300'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* Pending Count Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-bengali">
                  অপেক্ষমাণ লেনদেন: {toBengaliNumber(pendingTxns.length)} টি
                </h3>
                <p className="text-xs text-gray-500">
                  সিইও অনুমোদন ছাড়া কোনো অর্থ সরাসরি সদস্য ব্যালেন্সে যুক্ত বা বিয়োগ হয় না।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
                <span>রিফ্রেশ</span>
              </button>
              <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>দ্বৈত অনুমোদন ও লেজার সুরক্ষা সক্রিয়</span>
              </div>
            </div>
          </div>

          {/* Pending Transactions List */}
          {pendingTxns.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">কোনো অপেক্ষমাণ লেনদেন নেই!</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                মাঠকর্মীদের দাখিলকৃত সকল আর্থিক জমা ও উত্তোলনের অনুমোদন সম্পন্ন হয়েছে। নতুন কালেকশন দাখিল হলে এখানে প্রদর্শিত হবে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {pendingTxns.map((txn) => (
                <div
                  key={txn.id}
                  className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm hover:shadow-md transition space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {txn.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        txn.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {txn.type === 'DEPOSIT' ? 'সঞ্চয় জমা' : 'উত্তোলন আবেদন'}
                      </span>
                      <span className="text-xs text-gray-500">
                        দাখিল: {formatDateTimeBengali(txn.submittedAt)}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-brand-navy-900 font-bengali">
                        {formatBDT(txn.amountPoisha)}
                      </div>
                      <div className="text-[10px] text-gray-500">পেমেন্ট মেথড: {txn.paymentMethod}</div>
                    </div>
                  </div>

                  {/* Transaction Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100 space-y-1">
                      <span className="text-gray-400 block font-semibold">সদস্যের তথ্য</span>
                      <div className="font-bold text-gray-900 text-sm">{txn.memberName}</div>
                      <div className="text-gray-600">আইডি: {txn.memberCode}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100 space-y-1">
                      <span className="text-gray-400 block font-semibold">দাখিলকারী কর্মী</span>
                      <div className="font-bold text-gray-900 text-sm">{txn.submittedByEmployeeName}</div>
                      <div className="text-gray-600">রেফারেন্স নং: {txn.referenceNumber || 'নেই'}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100 space-y-1">
                      <span className="text-gray-400 block font-semibold">কর্মী নোট / বিবরণ</span>
                      <div className="text-gray-800 italic">{txn.notes || 'কোনো মন্তব্য যুক্ত নেই'}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setTxnToDelete(txn)}
                      disabled={approvingId === txn.id || isDeleting}
                      title="লেনদেন মুছে ফেলুন"
                      className="w-full sm:w-auto p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setRejectingTxn(txn)}
                      disabled={approvingId === txn.id || isDeleting}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>প্রত্যাখ্যান করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmApproveTxn(txn)}
                      disabled={approvingId === txn.id || isDeleting}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      {approvingId === txn.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-300" />
                      )}
                      <span>অনুমোদন ও লেজারে লিপিবদ্ধ করুন</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Confirmation Modal for Approval */}
          {confirmApproveTxn && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-center text-lg font-bold text-gray-900">
                  আপনি কি এই লেনদেনটি অনুমোদন করতে চান?
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">সদস্যের নাম:</span>
                    <span className="font-bold text-gray-900">{confirmApproveTxn.memberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">অনুমোদনের পরিমাণ:</span>
                    <span className="font-black text-brand-green-800 text-sm">
                      {formatBDT(confirmApproveTxn.amountPoisha)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">লেনদেনের ধরণ:</span>
                    <span className="font-bold text-gray-900">
                      {confirmApproveTxn.type === 'DEPOSIT' ? 'সঞ্চয় জমা' : 'উত্তোলন'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  অনুমোদনের সাথে সাথে সদস্যের তহবিল ব্যালেন্স হালনাগাদ হবে এবং একটি অপরিবর্তনীয় অডিট লগ তৈরি হবে।
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setConfirmApproveTxn(null)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => handleApprove(confirmApproveTxn)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>হ্যাঁ, অনুমোদন করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Modal with Mandatory Reason */}
          {rejectingTxn && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <form onSubmit={handleReject} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-center text-lg font-bold text-gray-900">
                  লেনদেন প্রত্যাখ্যানের কারণ উল্লেখ করুন
                </h3>
                <p className="text-xs text-gray-500 text-center">
                  আইনগত ও আর্থিক নিরীক্ষার স্বার্থে প্রত্যাখ্যানের সুনির্দিষ্ট কারণ প্রদান বাধ্যতামূলক। মাঠকর্মী এই কারণটি দেখতে পারবেন।
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">প্রত্যাখ্যানের কারণ *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="উদাঃ ভাউচার রসিদের ছবির সাথে পরিমাণের অসঙ্গতি রয়েছে / সদস্যের স্বাক্ষর অনুপস্থিত"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-500"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingTxn(null);
                      setRejectionReason('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <span>প্রত্যাখ্যান নিশ্চিত করুন</span>
                  </button>
                </div>
              </form>
            </div>
          )}

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
                    <p className="text-xs text-gray-500">ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হবে</p>
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
                  আপনি কি নিশ্চিতভাবে এই অপেক্ষমাণ লেনদেনটি ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTxnToDelete(null)}
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
