'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import {
  Search,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Phone,
  User,
  CreditCard,
  Download,
  Loader2,
  Sparkles,
  Building2
} from 'lucide-react';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';

interface StatementMember {
  id: string;
  memberId: string;
  name: string;
  fatherName: string;
  motherName: string;
  nid: string;
  phone: string;
  address: string;
  joiningDate: string;
  status: string;
  currentBalancePoisha: number;
  totalDepositedPoisha: number;
  totalWithdrawnPoisha: number;
}

interface StatementEntry {
  sl: number;
  id: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  particulars: string;
  method: string;
  referenceNumber: string;
  debitPoisha: number;
  creditPoisha: number;
  amountPoisha: number;
  runningBalancePoisha: number;
  notes: string;
  approvedBy: string;
}

export default function StatementPage() {
  const [nidQuery, setNidQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<StatementMember | null>(null);
  const [statementEntries, setStatementEntries] = useState<StatementEntry[]>([]);
  const [summary, setSummary] = useState<{
    totalDepositedPoisha: number;
    totalWithdrawnPoisha: number;
    currentBalancePoisha: number;
    totalTransactions: number;
  } | null>(null);

  // Check URL query on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('nid') || params.get('query');
    if (q) {
      setNidQuery(q);
      performSearch(q);
    }
  }, []);

  const performSearch = async (queryToSearch: string) => {
    const cleanQuery = queryToSearch.trim();
    if (!cleanQuery) {
      setError('অনুগ্রহ করে আপনার জাতীয় পরিচয়পত্র (NID) নম্বর লিখুন।');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/statement?nid=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();

      if (data.success && data.member) {
        setMember(data.member);
        setStatementEntries(data.statementEntries || []);
        setSummary(data.summary || null);
      } else {
        setMember(null);
        setStatementEntries([]);
        setSummary(null);
        setError(data.error || 'প্রদত্ত NID-এর বিপরীতে কোনো সদস্যের তথ্য খুঁজে পাওয়া যায়নি।');
      }
    } catch {
      setError('সার্ভারে যোগাযোগ করা সম্ভব হয়নি। কিছুক্ষণ পর পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(nidQuery);
  };

  const handlePrint = () => {
    window.print();
  };

  const issueDateBengali = formatDateBengali(new Date().toISOString());
  const issueTimeBengali = new Date().toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800">
      {/* Hide Navbar during print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full print:p-0 print:m-0 print:max-w-none">
        {/* Breadcrumb & Navigation (Hidden on print) */}
        <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-green-800 hover:text-brand-green-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মূল পাতায় ফিরে যান</span>
          </Link>

          {member && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-brand-orange-400" />
              <span>স্টেটমেন্ট প্রিন্ট / PDF সেভ করুন</span>
            </button>
          )}
        </div>

        {/* Search Hero Section (Hidden on print) */}
        <div className="bg-gradient-to-br from-brand-green-950 via-brand-green-900 to-brand-navy-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl mb-8 print:hidden relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-orange-300 text-xs font-semibold mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>অনলাইন ডিজিটাল সদস্য ব্যাংকিং সেবা</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-bengali leading-tight">
              সদস্য সঞ্চয় ও সার্বিক আর্থিক স্টেটমেন্ট অনুসন্ধান
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-2 leading-relaxed">
              আপনার জাতীয় পরিচয়পত্র (NID) নম্বর দিয়ে আপনার মোট সঞ্চয় জমা, উত্তোলন ও বর্তমান স্থিতি সম্বলিত প্রাতিষ্ঠানিক ব্যাংক স্টেটমেন্ট দেখুন এবং প্রিন্ট করুন।
            </p>

            {/* Search Input Box */}
            <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="আপনার জাতীয় পরিচয়পত্র (NID) নম্বর লিখুন..."
                  value={nidQuery}
                  onChange={(e) => setNidQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange-400 shadow-md"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-2xl bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-sm shadow-lg shadow-brand-orange-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>স্টেটমেন্ট দেখুন</span>
              </button>
            </form>

            {/* Quick Helper Badge */}
            <div className="mt-4 flex items-center gap-2 flex-wrap text-xs text-gray-300">
              <span>টেস্ট করার জন্য ক্লিক করুন:</span>
              <button
                type="button"
                onClick={() => {
                  setNidQuery('2411163252');
                  performSearch('2411163252');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-brand-orange-300 font-mono font-bold transition border border-white/20"
              >
                2411163252 (সদস্য: SAON)
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-start gap-3 mb-8 print:hidden">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">তথ্য পাওয়া যায়নি</h4>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OFFICIAL STATEMENT PAD (Printed like Bank Statement Letterhead) */}
        {/* ========================================================================= */}
        {member && summary && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
            {/* Top Print Action Bar (Hidden on print) */}
            <div className="bg-slate-100 px-6 py-3.5 border-b border-gray-200 flex items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>সদস্যের স্টেটমেন্ট সফলভাবে লোড হয়েছে</span>
              </div>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-brand-orange-400" />
                <span>প্রিন্ট করুন (Print Pad)</span>
              </button>
            </div>

            {/* The Actual Letterhead Pad */}
            <div className="p-8 sm:p-12 print:p-6 print:m-0 space-y-6">
              {/* Pad Header: Logo, Organization Name, Motto, Address */}
              <div className="border-b-2 border-brand-green-900 pb-5">
                <div className="flex items-center justify-between gap-6">
                  {/* Left: Organization Logo */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-brand-green-900 shadow-sm shrink-0">
                    <Image
                      src="/logo.jpg"
                      alt="ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Center: Official Title and Details */}
                  <div className="text-center flex-1 space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-green-950 font-bengali tracking-tight">
                      ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-brand-orange-600 font-bengali">
                      &ldquo;মানবতার সেবায়, উন্নয়নের প্রত্যয়ে&rdquo;
                    </p>
                    <p className="text-[11px] text-gray-600 font-medium">
                      গণপ্রজাতন্ত্রী বাংলাদেশ সরকার কর্তৃক অনুমোদিত ও নিবন্ধিত আর্থিক সমবায় প্রতিষ্ঠান
                    </p>
                    <div className="text-[10px] text-gray-500 flex items-center justify-center gap-3 flex-wrap pt-0.5">
                      <span><strong>ঠিকানা:</strong> ঘাটাইল, টাঙ্গাইল, ঢাকা, বাংলাদেশ</span>
                      <span>•</span>
                      <span><strong>মোবাইল:</strong> +৮৮০ ১৭১৫-৮৯৩৪৯৭, +৮৮০ ১৭১২-৩৪৫৬৭৮</span>
                      <span>•</span>
                      <span><strong>ইমেইল:</strong> contact@bhaggounnayan.org</span>
                    </div>
                  </div>

                  {/* Right: Official Certified Seal Badge */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-24 h-24 rounded-2xl border border-brand-green-300 bg-brand-green-50/50 p-2 text-center text-brand-green-900 shrink-0">
                    <ShieldCheck className="w-8 h-8 text-brand-green-800 mb-1" />
                    <span className="text-[9px] font-bold leading-tight">ভেরিফাইড<br />অ্যাকাউন্ট</span>
                  </div>
                </div>

                {/* Decorative Two-tone Bar */}
                <div className="mt-4 h-1.5 w-full bg-gradient-to-r from-brand-green-800 via-brand-orange-500 to-brand-navy-900 rounded-full"></div>
              </div>

              {/* Statement Document Sub-Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3 text-xs">
                <div>
                  <span className="font-extrabold text-sm sm:text-base text-gray-900 font-bengali bg-slate-100 px-3 py-1 rounded-lg border border-gray-200">
                    সদস্য সঞ্চয় ও হিসাব বিবরণী (MEMBER ACCOUNT STATEMENT)
                  </span>
                </div>
                <div className="text-right text-[11px] text-gray-500 font-mono">
                  <span>ইস্যুর তারিখ: <strong>{issueDateBengali}</strong></span>
                  <span className="ml-2">সময়: {issueTimeBengali}</span>
                </div>
              </div>

              {/* Member Profile Grid (Bank Passbook Style) */}
              <div className="bg-slate-50/80 rounded-2xl border border-gray-200 p-4 sm:p-5">
                <h3 className="font-bold text-xs text-brand-green-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span>হিসাবধারীর পরিচিতি ও বিবরণ</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <span className="text-gray-500 text-[10px] block font-medium">সদস্যের নাম:</span>
                    <strong className="text-gray-900 text-sm font-bengali">{member.name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block font-medium">সদস্য কোড / হিসাব নং:</span>
                    <strong className="font-mono text-gray-900 font-bold text-sm">{member.memberId}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block font-medium">জাতীয় পরিচয়পত্র (NID) নং:</span>
                    <strong className="font-mono text-gray-900 font-bold">{member.nid}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block font-medium">মোবাইল নম্বর:</span>
                    <strong className="font-mono text-gray-900">{member.phone}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block font-medium">পিতার নাম:</span>
                    <span className="text-gray-800 font-medium">{member.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block font-medium">মাতার নাম:</span>
                    <span className="text-gray-800 font-medium">{member.motherName}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 text-[10px] block font-medium">বর্তমান ঠিকানা:</span>
                    <span className="text-gray-800 font-medium">{member.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block font-medium">যোগদানের তারিখ:</span>
                    <span className="text-gray-800 font-medium">{formatDateBengali(member.joiningDate)}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary Cards (Bank Balance Overview) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">মোট সঞ্চয় জমা</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-900 font-bengali mt-1">
                    {formatBDT(summary.totalDepositedPoisha)}
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">সর্বমোট কিস্তি জমা</span>
                </div>

                <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-orange-800 uppercase block">মোট উত্তোলন</span>
                  <div className="text-xl sm:text-2xl font-black text-orange-900 font-bengali mt-1">
                    {formatBDT(summary.totalWithdrawnPoisha)}
                  </div>
                  <span className="text-[10px] text-orange-700 mt-0.5 block">অনুমোদিত সঞ্চয় প্রত্যাহার</span>
                </div>

                <div className="bg-brand-green-900 text-white rounded-2xl p-4 text-center shadow-sm">
                  <span className="text-[11px] font-bold text-brand-orange-300 uppercase block">বর্তমান নিট স্থিতি (ব্যালেন্স)</span>
                  <div className="text-2xl sm:text-3xl font-black text-white font-bengali mt-1">
                    {formatBDT(summary.currentBalancePoisha)}
                  </div>
                  <span className="text-[10px] text-gray-200 mt-0.5 block">হিসাবে অবশিষ্ট কার্যকরী ব্যালেন্স</span>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-brand-green-800" />
                    <span>লেনদেন বিবরণী খতিয়ান (সর্বমোট {toBengaliNumber(statementEntries.length)} টি লেনদেন)</span>
                  </h3>
                  <span className="text-[11px] text-gray-500 font-medium">মুদ্রা: বাংলাদেশী টাকা (BDT)</span>
                </div>

                <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs text-gray-700 border-collapse">
                    <thead className="bg-slate-100 text-gray-800 uppercase font-bold text-[10px] border-b border-gray-300">
                      <tr>
                        <th className="py-2.5 px-3 text-center border-r border-gray-200 w-12">ক্র.নং</th>
                        <th className="py-2.5 px-3 border-r border-gray-200">তারিখ</th>
                        <th className="py-2.5 px-3 border-r border-gray-200">লেনদেন আইডি ও বিবরণী</th>
                        <th className="py-2.5 px-3 border-r border-gray-200">পদ্ধতি ও রেফ</th>
                        <th className="py-2.5 px-3 border-r border-gray-200 text-right text-emerald-800">জমা (Cr.)</th>
                        <th className="py-2.5 px-3 border-r border-gray-200 text-right text-orange-800">উত্তোলন (Dr.)</th>
                        <th className="py-2.5 px-3 text-right font-black text-gray-900">স্থিতি (Balance)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-[11px]">
                      {statementEntries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            এখনো কোনো অনুমোদিত আর্থিক লেনদেন সম্পন্ন হয়নি।
                          </td>
                        </tr>
                      ) : (
                        statementEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                            <td className="py-2.5 px-3 text-center font-mono text-gray-500 border-r border-gray-200">
                              {toBengaliNumber(entry.sl)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-gray-800 border-r border-gray-200 whitespace-nowrap">
                              {formatDateBengali(entry.date)}
                            </td>
                            <td className="py-2.5 px-3 border-r border-gray-200">
                              <div className="font-bold text-gray-900">{entry.particulars}</div>
                              <div className="font-mono text-[10px] text-gray-400">#{entry.id}</div>
                            </td>
                            <td className="py-2.5 px-3 border-r border-gray-200 font-mono text-gray-600">
                              <span>{entry.method}</span>
                              {entry.referenceNumber && (
                                <span className="block text-[9px] text-gray-400 truncate max-w-xs">
                                  রেফ: {entry.referenceNumber}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-800 border-r border-gray-200 font-mono">
                              {entry.type === 'DEPOSIT' ? formatBDT(entry.amountPoisha) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-orange-800 border-r border-gray-200 font-mono">
                              {entry.type === 'WITHDRAWAL' ? formatBDT(entry.amountPoisha) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-gray-900 font-mono bg-slate-50/60">
                              {formatBDT(entry.runningBalancePoisha)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-right text-gray-700 font-bengali">
                          সর্বমোট সর্বমোট যোগফল:
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-900 font-mono">
                          {formatBDT(summary.totalDepositedPoisha)}
                        </td>
                        <td className="py-3 px-3 text-right text-orange-900 font-mono">
                          {formatBDT(summary.totalWithdrawnPoisha)}
                        </td>
                        <td className="py-3 px-3 text-right text-brand-green-950 font-black font-mono">
                          {formatBDT(summary.currentBalancePoisha)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Official Seal and Signatures Footer Pad */}
              <div className="pt-8 mt-6 border-t border-gray-200 space-y-8">
                {/* Statutory Disclaimer */}
                <p className="text-[10px] text-gray-500 text-center leading-relaxed max-w-2xl mx-auto italic">
                  * এই স্টেটমেন্টটি ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থার অনুমোদিত কেন্দ্রীয় সার্ভার ও অনলাইন ডাটাবেজ দ্বারা স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত। যেকোনো আর্থিক তথ্যের অসঙ্গতি পরিলক্ষিত হলে অবিলম্বে প্রধান কার্যালয়ে যোগাযোগ করার অনুরোধ করা যাচ্ছে।
                </p>

                {/* 3 Signature Boxes */}
                <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
                  <div>
                    <div className="border-t border-gray-400 w-3/4 mx-auto pt-2">
                      <span className="font-bold text-gray-800 block font-bengali">প্রস্তুতকারকের স্বাক্ষর</span>
                      <span className="text-[10px] text-gray-500">কম্পিউটার অপারেটর</span>
                    </div>
                  </div>

                  <div>
                    <div className="border-t border-gray-400 w-3/4 mx-auto pt-2">
                      <span className="font-bold text-gray-800 block font-bengali">হিসাব নিরীক্ষক</span>
                      <span className="text-[10px] text-gray-500">অডিট ও একাউন্টস সেল</span>
                    </div>
                  </div>

                  <div>
                    <div className="border-t border-brand-green-800 w-3/4 mx-auto pt-2">
                      <span className="font-bold text-brand-green-900 block font-bengali">প্রধান নির্বাহী কর্মকর্তা (CEO)</span>
                      <span className="text-[10px] text-gray-600 font-semibold">অনুমোদিত স্বাক্ষর ও সিলমোহর</span>
                    </div>
                  </div>
                </div>

                {/* Pad Footer bottom line */}
                <div className="text-[10px] text-gray-400 text-center pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span>ওয়েবসাইট: www.bhaggounnayan.org</span>
                  <span>ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা — সেবায় ও উন্নয়নে অঙ্গীকারবদ্ধ</span>
                  <span>পৃষ্ঠা: ১/১</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hide Footer during print */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
