'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, toBengaliNumber, toEnglishNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { Member, PaymentMethod, TransactionType } from '@/types';
import {
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  X,
  Wallet,
  FileText,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmployeeCollectionsPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('DEPOSIT');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/member/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.members)) {
          const mems = data.members.filter((m: Member) => m.status === 'ACTIVE');
          setMembers(mems);
        }
      })
      .catch((err) => console.error('Error fetching members:', err));
  }, []);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!selectedMemberId) {
      setErrorMessage('কালেকশন দাখিল করতে প্রথমে সার্চ করে একজন নির্দিষ্ট সদস্য নির্বাচন করুন।');
      setIsSubmitting(false);
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('সঠিক আর্থিক পরিমাণ (টাকা) প্রদান করুন।');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/transaction/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          amount: numericAmount,
          type,
          paymentMethod,
          referenceNumber,
          notes,
          submittedByUserId: user?.uid,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        setSuccessMessage(`লেনদেন সফলভাবে দাখিল হয়েছে! সিইও মহোদয়ের অনুমোদনের পর এটি সদস্যের ব্যালেন্সে কার্যকর হবে।`);
        setAmount('');
        setReferenceNumber('');
        setNotes('');
      } else {
        setErrorMessage(data.error || 'দাখিল ব্যর্থ হয়েছে।');
      }
    } catch {
      setErrorMessage('সার্ভারে সংযোগ স্থাপন সম্ভব হয়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE', 'CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="EMPLOYEE"
        title="নতুন সঞ্চয় কালেকশন এন্ট্রি"
        subtitle="সদস্যের কাছ থেকে সংগৃহীত সাপ্তাহিক/মাসিক সঞ্চয় এন্ট্রি ও অনুমোদনের জন্য দাখিল"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-green-100 text-brand-green-800 flex items-center justify-center">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">কালেকশন দাখিল ফরম</h3>
                <p className="text-xs text-gray-500">সকল তথ্য নির্ভুলভাবে পূরণ করে দাখিল করুন</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Member Search Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>সদস্য অনুসন্ধান করুন (সদস্য আইডি / NID / মোবাইল নম্বর) *</span>
                  <span className="text-[10px] text-brand-green-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    একই আইডির একাধিক সদস্য সাপোর্ট করে
                  </span>
                </label>

                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="সদস্য আইডি, NID বা মোবাইল নম্বর লিখুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Matching Results: ONLY shown when user types search query */}
                {(() => {
                  const rawQuery = searchQuery.trim();
                  if (!rawQuery) {
                    return !selectedMember ? (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                        🔍 সদস্য নির্বাচন করতে উপরে সদস্যের সদস্য আইডি, মোবাইল নম্বর বা NID লিখুন
                      </div>
                    ) : null;
                  }

                  const normQuery = toEnglishNumber(rawQuery).toLowerCase().trim();
                  const isPureNumeric = /^[0-9]+$/.test(normQuery);

                  const matched = members.filter((m) => {
                    const mId = toEnglishNumber(m.memberId || '').toLowerCase().trim();
                    const mPhone = toEnglishNumber(m.phone || '').replace(/\D/g, '');
                    const mNid = toEnglishNumber(m.nid || '').replace(/\D/g, '');
                    const mName = (m.name || '').toLowerCase().trim();

                    // 1. Exact Member ID Match (e.g. searching '1' only returns member(s) with ID 1, not 11 or 111)
                    if (mId === normQuery) {
                      return true;
                    }

                    // 2. Mobile Number match (exact full mobile or typed mobile digits)
                    if (mPhone === normQuery || (normQuery.length >= 7 && mPhone.endsWith(normQuery))) {
                      return true;
                    }

                    // 3. NID match (exact NID number or full typed NID)
                    if (mNid === normQuery || (normQuery.length >= 6 && mNid === normQuery)) {
                      return true;
                    }

                    // 4. Name match (only if user did NOT search by a short number like 1, 2)
                    if (!isPureNumeric && mName.includes(normQuery)) {
                      return true;
                    }

                    return false;
                  });

                  return (
                    <div className="space-y-2 pt-1 animate-in fade-in">
                      {matched.length === 0 ? (
                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center text-xs text-amber-800">
                          &ldquo;{searchQuery}&rdquo; এর বিপরীতে কোনো সদস্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি বা নম্বর লিখুন।
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          <div className="text-[11px] font-semibold text-gray-500 px-1">
                            পাওয়া গেছে: {matched.length} জন সদস্য (নির্দিষ্ট সদস্যে ক্লিক করে সিলেক্ট করুন)
                          </div>
                          {matched.map((m) => {
                            const isSelected = selectedMemberId === m.id;
                            return (
                              <div
                                key={m.id}
                                onClick={() => {
                                  setSelectedMemberId(m.id);
                                  setErrorMessage(null);
                                }}
                                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                  isSelected
                                    ? 'bg-emerald-50/90 border-brand-green-600 shadow-xs ring-1 ring-brand-green-600'
                                    : 'bg-white border-gray-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 text-xs font-bengali">{m.name}</span>
                                    <span className="font-mono text-[10px] font-bold text-brand-green-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                      আইডি: {m.memberId}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-gray-500 flex items-center gap-2 flex-wrap">
                                    <span>মোবাইল: <strong>{m.phone}</strong></span>
                                    {m.nid && <span>• NID: <strong className="font-mono">{m.nid}</strong></span>}
                                    {m.address && <span>• ঠিকানা: {m.address}</span>}
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <div className="text-[10px] text-gray-400">বর্তমান ব্যালেন্স</div>
                                  <div className="font-black text-brand-green-900 text-xs font-bengali">
                                    {formatBDT(m.currentBalancePoisha)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Currently Selected Member Card */}
                {selectedMember ? (
                  <div className="p-3.5 rounded-2xl bg-brand-green-900 text-white text-xs flex justify-between items-center shadow-xs">
                    <div>
                      <span className="text-[10px] text-brand-orange-300 font-semibold block">নির্বাচিত সদস্য:</span>
                      <strong className="text-sm font-bengali">{selectedMember.name}</strong>
                      <span className="ml-2 font-mono text-emerald-200 text-xs">(আইডি: {selectedMember.memberId})</span>
                      <div className="text-[11px] text-emerald-100/80">মোবাইল: {selectedMember.phone}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-gray-200 block">বর্তমান সঞ্চয় স্থিতি:</span>
                      <span className="font-black text-white text-sm font-bengali block">
                        {formatBDT(selectedMember.currentBalancePoisha)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedMemberId('')}
                        className="text-[10px] text-red-200 hover:text-white underline font-semibold"
                      >
                        পরিবর্তন / বাতিল
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Transaction Type */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">লেনদেনের ধরণ *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                  >
                    <option value="DEPOSIT">নিয়মিত সঞ্চয় জমা (DEPOSIT)</option>
                    <option value="WITHDRAWAL">সঞ্চয় উত্তোলন (WITHDRAWAL)</option>
                  </select>
                </div>

                {/* Amount in BDT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">পরিমাণ (টাকা - BDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="উদাঃ ৫০০"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700 font-bold"
                  />
                </div>
              </div>

              {/* Payment Method & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">পরিশোধের মাধ্যম *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                  >
                    <option value="CASH">নগদ গ্রহণ (CASH)</option>
                    <option value="BKASH">বিকাশ (BKASH)</option>
                    <option value="NAGAD">নগদ (NAGAD)</option>
                    <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">রসিদ / ট্রানজেকশন আইডি নং</label>
                  <input
                    type="text"
                    placeholder="REC-1092 / TrxID"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">মন্তব্য / বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="উদাঃ অক্টোবর মাসের ২য় সপ্তাহের নিয়মিত কিস্তি সঞ্চয়"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                <strong>মনোযোগ দিন:</strong> মাঠকর্মী সরাসরি কোনো সদস্যের ব্যালেন্স পরিবর্তন করতে পারেন না। আপনার দাখিলকৃত তথ্য সিইও মহোদয়ের অনুমোদন সাপেক্ষে লেজারে যুক্ত হবে।
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                <span>সিইও অনুমোদনের জন্য দাখিল করুন</span>
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
