'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';
import { Transaction, Member, Employee } from '@/types';
import { FileText, Download, Printer, Filter, Calendar, TrendingUp } from 'lucide-react';

export default function CeoReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reportType, setReportType] = useState<'OVERVIEW' | 'MEMBERS' | 'EMPLOYEES'>('OVERVIEW');

  useEffect(() => {
    setTransactions(store.getTransactions());
    setEmployees(store.getEmployees());
    fetch('/api/member/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.members)) {
          setMembers(data.members);
        } else {
          setMembers(store.getMembers());
        }
      })
      .catch(() => setMembers(store.getMembers()));
  }, []);

  const approvedDeposits = transactions
    .filter((t) => t.status === 'APPROVED' && t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amountPoisha, 0);

  const approvedWithdrawals = transactions
    .filter((t) => t.status === 'APPROVED' && t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amountPoisha, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amountPoisha, 0);

  const totalBalance = members.reduce((sum, m) => sum + m.currentBalancePoisha, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers = '';
    let rows: string[] = [];

    if (reportType === 'OVERVIEW') {
      headers = 'Transaction ID,Member,Employee,Type,Amount (BDT),Status,Date\n';
      rows = transactions.map((t) =>
        `"${t.id}","${t.memberName}","${t.submittedByEmployeeName}","${t.type}","${(t.amountPoisha / 100).toFixed(2)}","${t.status}","${t.createdAt}"`
      );
    } else if (reportType === 'MEMBERS') {
      headers = 'Member ID,Name,Phone,Current Balance (BDT),Total Deposited (BDT),Status\n';
      rows = members.map((m) =>
        `"${m.memberId}","${m.name}","${m.phone}","${(m.currentBalancePoisha / 100).toFixed(2)}","${(m.totalDepositedPoisha / 100).toFixed(2)}","${m.status}"`
      );
    } else {
      headers = 'Employee ID,Name,Phone,Designation,Total Collected (BDT),Transactions Count\n';
      rows = employees.map((e) =>
        `"${e.employeeId}","${e.name}","${e.phone}","${e.designation}","${(e.totalCollectedPoisha / 100).toFixed(2)}","${e.totalTransactionsCount}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bhaggo-unnayan-report-${reportType.toLowerCase()}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute allowedRoles={['CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="CEO"
        title="আর্থিক অডিট ও কার্যবিবরণী রিপোর্ট"
        subtitle="ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থার প্রাতিষ্ঠানিক হিসাব বিবরণী, ক্যাশ ফ্লো এবং এক্সপোর্ট"
      >
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="no-print bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportType('OVERVIEW')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  reportType === 'OVERVIEW'
                    ? 'bg-brand-green-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                সার্বিক আয়-ব্যয় খতিয়ান
              </button>
              <button
                onClick={() => setReportType('MEMBERS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  reportType === 'MEMBERS'
                    ? 'bg-brand-green-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                সদস্য-ভিত্তিক লেজার
              </button>
              <button
                onClick={() => setReportType('EMPLOYEES')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  reportType === 'EMPLOYEES'
                    ? 'bg-brand-green-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                কর্মীভিত্তিক কালেকশন
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold text-xs border border-gray-200 transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span>CSV ডাউনলোড</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-brand-navy-900 hover:bg-brand-navy-950 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-brand-orange-400" />
                <span>প্রিন্ট / PDF সংরক্ষণ</span>
              </button>
            </div>
          </div>

          {/* Printable Report Sheet */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-8">
            {/* Report Header */}
            <div className="text-center border-b border-gray-200 pb-6 space-y-1">
              <h2 className="text-2xl font-extrabold text-brand-green-900">
                ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা
              </h2>
              <p className="text-xs text-brand-navy-900 font-bold">
                "মানবতার সেবায়, উন্নয়নের প্রত্যয়ে"
              </p>
              <p className="text-xs text-gray-500">
                কেন্দ্রীয় আর্থিক নিরীক্ষা ও ক্যাশ ফ্লো বিবরণী | প্রতিবেদন তৈরির তারিখ: {formatDateBengali(new Date())}
              </p>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">অনুমোদিত মোট সঞ্চয় জমা</span>
                <span className="text-xl font-black text-emerald-950 font-bengali">
                  {formatBDT(approvedDeposits)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-center">
                <span className="text-[10px] uppercase font-bold text-orange-800 block">অনুমোদিত মোট উত্তোলন</span>
                <span className="text-xl font-black text-orange-950 font-bengali">
                  {formatBDT(approvedWithdrawals)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">বর্তমান কার্যকর সদস্য তহবিল</span>
                <span className="text-xl font-black text-blue-950 font-bengali">
                  {formatBDT(totalBalance)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">অপেক্ষমাণ লেনদেন পরিমাণ</span>
                <span className="text-xl font-black text-amber-950 font-bengali">
                  {formatBDT(pendingAmount)}
                </span>
              </div>
            </div>

            {/* Report Table View */}
            {reportType === 'OVERVIEW' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-800 border-l-4 border-brand-green-800 pl-2">
                  সর্বশেষ অনুমোদিত ও প্রক্রিয়াকৃত লেনদেন বিবরণী
                </h4>
                <table className="w-full text-left text-xs text-gray-700 border-collapse border border-gray-200">
                  <thead className="bg-slate-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-2 border border-gray-200">আইডি</th>
                      <th className="p-2 border border-gray-200">সদস্য</th>
                      <th className="p-2 border border-gray-200">কর্মী</th>
                      <th className="p-2 border border-gray-200">পরিমাণ</th>
                      <th className="p-2 border border-gray-200">ধরণ</th>
                      <th className="p-2 border border-gray-200">স্ট্যাটাস</th>
                      <th className="p-2 border border-gray-200">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-gray-200">
                        <td className="p-2 font-mono border border-gray-200">{t.id}</td>
                        <td className="p-2 font-semibold border border-gray-200">{t.memberName}</td>
                        <td className="p-2 border border-gray-200">{t.submittedByEmployeeName}</td>
                        <td className="p-2 font-bold border border-gray-200">{formatBDT(t.amountPoisha)}</td>
                        <td className="p-2 border border-gray-200">{t.type}</td>
                        <td className="p-2 font-bold border border-gray-200">{t.status}</td>
                        <td className="p-2 border border-gray-200">{formatDateBengali(t.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'MEMBERS' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-800 border-l-4 border-brand-green-800 pl-2">
                  সদস্যভিত্তিক তহবিল ও ব্যালেন্স বিবরণী
                </h4>
                <table className="w-full text-left text-xs text-gray-700 border-collapse border border-gray-200">
                  <thead className="bg-slate-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-2 border border-gray-200">সদস্য আইডি</th>
                      <th className="p-2 border border-gray-200">নাম</th>
                      <th className="p-2 border border-gray-200">মোবাইল</th>
                      <th className="p-2 border border-gray-200">বর্তমান ব্যালেন্স</th>
                      <th className="p-2 border border-gray-200">মোট জমা</th>
                      <th className="p-2 border border-gray-200">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b border-gray-200">
                        <td className="p-2 font-mono border border-gray-200">{m.memberId}</td>
                        <td className="p-2 font-semibold border border-gray-200">{m.name}</td>
                        <td className="p-2 border border-gray-200">{m.phone}</td>
                        <td className="p-2 font-bold text-emerald-800 border border-gray-200">{formatBDT(m.currentBalancePoisha)}</td>
                        <td className="p-2 border border-gray-200">{formatBDT(m.totalDepositedPoisha)}</td>
                        <td className="p-2 font-bold border border-gray-200">{m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'EMPLOYEES' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-800 border-l-4 border-brand-green-800 pl-2">
                  কর্মীভিত্তিক কালেকশন ও কর্মদক্ষতা বিবরণী
                </h4>
                <table className="w-full text-left text-xs text-gray-700 border-collapse border border-gray-200">
                  <thead className="bg-slate-100 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-2 border border-gray-200">কর্মী আইডি</th>
                      <th className="p-2 border border-gray-200">নাম</th>
                      <th className="p-2 border border-gray-200">পদবী</th>
                      <th className="p-2 border border-gray-200">মোট কালেকশন</th>
                      <th className="p-2 border border-gray-200">দাখিলকৃত লেনদেন</th>
                      <th className="p-2 border border-gray-200">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((e) => (
                      <tr key={e.id} className="border-b border-gray-200">
                        <td className="p-2 font-mono border border-gray-200">{e.employeeId}</td>
                        <td className="p-2 font-semibold border border-gray-200">{e.name}</td>
                        <td className="p-2 border border-gray-200">{e.designation}</td>
                        <td className="p-2 font-bold text-emerald-800 border border-gray-200">{formatBDT(e.totalCollectedPoisha)}</td>
                        <td className="p-2 font-bold border border-gray-200">{toBengaliNumber(e.totalTransactionsCount)} টি</td>
                        <td className="p-2 border border-gray-200">{e.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signature Area for Print */}
            <div className="pt-16 grid grid-cols-2 gap-8 text-center text-xs text-gray-600 print-only">
              <div className="border-t border-gray-400 pt-2">
                হিসাব নিরীক্ষক কর্মকর্তা (অডিটর)
              </div>
              <div className="border-t border-gray-400 pt-2 font-bold">
                প্রধান নির্বাহী কর্মকর্তা (সিইও)
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
