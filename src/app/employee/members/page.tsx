'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';
import { Member, LedgerEntry } from '@/types';
import { Users, Search, Phone, MapPin, Wallet, Calendar, X, Eye } from 'lucide-react';

export default function EmployeeMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberLedger, setMemberLedger] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    fetch('/api/member/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.members)) {
          setMembers(data.members);
        }
      })
      .catch((err) => console.error('Error fetching members:', err));
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      (m?.name || '').toLowerCase().includes((search || '').toLowerCase()) ||
      (m?.memberId || '').toLowerCase().includes((search || '').toLowerCase()) ||
      (m?.phone || '').includes(search || '')
  );

  const handleViewLedger = (m: Member) => {
    setSelectedMember(m);
    setMemberLedger(store.getLedgerEntriesByMemberId(m.id));
  };

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE', 'CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="EMPLOYEE"
        title="সদস্য তালিকা ও খতিয়ান নিরীক্ষা"
        subtitle="অনুমোদিত সদস্য তালিকা, বর্তমান সঞ্চয় ব্যালেন্স ও লেনদেন রেকর্ড"
      >
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="সদস্যের নাম, আইডি বা ফোন দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              অনুমোদিত সদস্য: {toBengaliNumber(filteredMembers.length)} জন
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-brand-green-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {m.memberId}
                      </span>
                      <h4 className="font-bold text-base text-gray-900 mt-1">{m.name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      সক্রিয়
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{m.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{m.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>যোগদান: {formatDateBengali(m.joiningDate)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-semibold">বর্তমান সঞ্চয় স্থিতি:</span>
                    <span className="font-black text-emerald-950 font-bengali text-sm">
                      {formatBDT(m.currentBalancePoisha)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewLedger(m)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-brand-green-100 text-brand-green-900 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লেজার বিবরণী দেখুন</span>
                </button>
              </div>
            ))}
          </div>

          {/* Member Ledger Modal */}
          {selectedMember && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[85vh] flex flex-col">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-gray-900">
                      সদস্য খতিয়ান: {selectedMember.name}
                    </h3>
                    <p className="text-xs text-gray-500">আইডি: {selectedMember.memberId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl text-xs flex justify-between items-center">
                  <span className="font-semibold text-emerald-800">অনুমোদিত ব্যালেন্স:</span>
                  <span className="font-bold text-emerald-950 text-sm font-bengali">
                    {formatBDT(selectedMember.currentBalancePoisha)}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">
                    অনুমোদিত লেনদেনের ইতিহাস:
                  </span>
                  {memberLedger.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400">কোনো লেজার রেকর্ড নেই।</div>
                  ) : (
                    memberLedger.map((l) => (
                      <div
                        key={l.id}
                        className="p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">{l.description}</div>
                          <div className="text-[10px] text-gray-400">{formatDateBengali(l.timestamp)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">+{formatBDT(l.debitPoisha)}</div>
                          <div className="text-[10px] text-gray-500">জের: {formatBDT(l.balanceAfterPoisha)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold"
                  >
                    বন্ধ করুন
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
