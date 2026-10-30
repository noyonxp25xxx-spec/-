'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { Member, LedgerEntry } from '@/types';
import {
  Users,
  UserPlus,
  Search,
  Wallet,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  X,
  CheckCircle,
  Loader2,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function CeoMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberLedger, setMemberLedger] = useState<LedgerEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    phone: '',
    fatherName: '',
    motherName: '',
    nid: '',
    address: '',
  });
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/member/delete?id=${memberToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMemberToDelete(null);
        await loadMembers();
        alert(data.message || 'সদস্যের তথ্য ডাটাবেজ থেকে মুছে ফেলা হয়েছে।');
      } else {
        alert(data.error || 'সদস্য মুছে ফেলা সম্ভব হয়নি।');
      }
    } catch {
      alert('সার্ভারে যোগাযোগে সমস্যা হয়েছে।');
    } finally {
      setIsDeleting(false);
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/member/list');
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      (m?.name || '').toLowerCase().includes((search || '').toLowerCase()) ||
      (m?.memberId || '').toLowerCase().includes((search || '').toLowerCase()) ||
      (m?.phone || '').includes(search || '')
  );

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/member/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          registeredByUserId: user?.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({ memberId: '', name: '', phone: '', fatherName: '', motherName: '', nid: '', address: '' });
        await loadMembers();
        alert(data.message || 'নতুন সদস্য সফলভাবে নিবন্ধিত হয়েছে!');
      } else {
        alert(data.error || 'সদস্য নিবন্ধন ব্যর্থ হয়েছে।');
      }
    } catch {
      alert('সার্ভার ত্রুটি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewLedger = (m: Member) => {
    setSelectedMember(m);
    const ledger = store.getLedgerEntriesByMemberId(m.id);
    setMemberLedger(ledger);
  };

  return (
    <ProtectedRoute allowedRoles={['CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="CEO"
        title="সদস্য খতিয়ান ও ব্যবস্থাপনা"
        subtitle="ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থার সকল সম্মানিত সদস্যের তথ্য ও আর্থিক খতিয়ান"
      >
        <div className="space-y-6">
          {/* Top Actions Bar */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="সদস্যের নাম, আইডি বা মোবাইল নং দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs text-gray-500 hidden sm:inline">
                মোট সদস্য: <strong className="text-gray-900">{toBengaliNumber(members.length)}</strong> জন
              </span>
              <button
                onClick={loadMembers}
                disabled={loading}
                title="তালিকা রিফ্রেশ করুন"
                className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-green-800' : ''}`} />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-brand-orange-400" />
                <span>নতুন সদস্য নিবন্ধন</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 text-gray-700 uppercase font-bold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-5">সদস্য আইডি</th>
                    <th className="py-3.5 px-5">নাম ও ঠিকানা</th>
                    <th className="py-3.5 px-5">মোবাইল নম্বর</th>
                    <th className="py-3.5 px-5">বর্তমান স্থিতি (ব্যালেন্স)</th>
                    <th className="py-3.5 px-5">মোট জমা</th>
                    <th className="py-3.5 px-5">যোগদানের তারিখ</th>
                    <th className="py-3.5 px-5">স্ট্যাটাস</th>
                    <th className="py-3.5 px-5 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-green-800" />
                        <span>ডাটাবেজ থেকে সদস্য তালিকা লোড হচ্ছে...</span>
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        কোনো সদস্যের তথ্য পাওয়া যায়নি। &ldquo;নতুন সদস্য নিবন্ধন&rdquo; বোতামে ক্লিক করে নতুন সদস্য যোগ করুন।
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-5 font-mono font-bold text-gray-900">
                          {m.memberId}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-gray-900 text-sm">{m.name}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-xs">{m.address}</div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-gray-800">{m.phone}</td>
                        <td className="py-3.5 px-5 font-bold text-brand-green-900 text-sm">
                          {formatBDT(m.currentBalancePoisha)}
                        </td>
                        <td className="py-3.5 px-5 text-gray-600">
                          {formatBDT(m.totalDepositedPoisha)}
                        </td>
                        <td className="py-3.5 px-5 text-gray-500">
                          {formatDateBengali(m.joiningDate)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                            {m.status === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleViewLedger(m)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-green-100 text-brand-green-900 font-semibold text-xs transition"
                            >
                              লেজার বিবরণী
                            </button>
                            <button
                              onClick={() => setMemberToDelete(m)}
                              title="সদস্য মুছে ফেলুন"
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Member Ledger Modal */}
          {selectedMember && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] flex flex-col">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      সদস্য খতিয়ান বিবরণী: {selectedMember.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      সদস্য আইডি: {selectedMember.memberId} | মোবাইল: {selectedMember.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-800 font-semibold block">বর্তমান কার্যকরী ব্যালেন্স</span>
                    <span className="text-2xl font-black text-emerald-950 font-bengali">
                      {formatBDT(selectedMember.currentBalancePoisha)}
                    </span>
                  </div>
                  <div className="text-right text-gray-600">
                    <div>মোট জমাকৃত: {formatBDT(selectedMember.totalDepositedPoisha)}</div>
                    <div>মোট উত্তোলিত: {formatBDT(selectedMember.totalWithdrawnPoisha)}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  <h4 className="font-bold text-xs text-gray-700 uppercase">অনুমোদিত লেজার রেকর্ডসমূহ:</h4>
                  {memberLedger.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      কোনো অনুমোদিত লেজার রেকর্ড নেই।
                    </div>
                  ) : (
                    memberLedger.map((l) => (
                      <div
                        key={l.id}
                        className="p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-gray-900">{l.description}</div>
                          <div className="text-[10px] text-gray-500">{formatDateBengali(l.timestamp)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${l.debitPoisha > 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                            {l.debitPoisha > 0 ? `+${formatBDT(l.debitPoisha)}` : `-${formatBDT(l.creditPoisha)}`}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            স্থিতি: {formatBDT(l.balanceAfterPoisha)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <form
                onSubmit={handleRegisterMember}
                className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-lg text-gray-900">নতুন সমবায় সদস্য নিবন্ধন</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>সদস্য আইডি (Member ID) *</span>
                      <span className="text-[10px] text-brand-green-800 font-normal">একই আইডি একাধিক সদস্যে রাখা সম্ভব</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: MEM-2026-002 বা নিজস্ব হিসাব নম্বর"
                      value={formData.memberId}
                      onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-brand-green-950 focus:outline-none focus:border-brand-green-700 bg-emerald-50/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">সদস্যের নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="মোছাঃ রহিমা বেগম"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      placeholder="০১৭১২-৩৪৫৬৭৮"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">পিতার নাম</label>
                    <input
                      type="text"
                      placeholder="পিতার নাম"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">মাতার নাম</label>
                    <input
                      type="text"
                      placeholder="মাতার নাম"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">জাতীয় পরিচয়পত্র / জন্মনিবন্ধন নং</label>
                  <input
                    type="text"
                    placeholder="১৯৮৭৫৪১..."
                    value={formData.nid}
                    onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">বর্তমান ঠিকানা *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>নিবন্ধন সম্পন্ন করুন</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Member Confirmation Modal */}
          {memberToDelete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">সদস্য মুছে ফেলার নিশ্চিতকরণ</h3>
                    <p className="text-xs text-gray-500">ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হবে</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে সদস্য <strong className="text-gray-900">{memberToDelete.name}</strong> (আইডি: <strong className="text-gray-900">{memberToDelete.memberId}</strong>)-এর সমস্ত তথ্য ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMemberToDelete(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteMember}
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
