'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { useAuth } from '@/lib/auth/context';
import {
  UserCog,
  KeyRound,
  UserPlus,
  ShieldCheck,
  Users,
  Wrench,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Trash2,
  RefreshCw,
  Power,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

interface SystemAccount {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  role: 'CEO' | 'EMPLOYEE' | 'MAINTENANCE';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLoginAt?: string;
  isMainAdmin?: boolean;
}

export default function AccountManagementPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SystemAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Own Password Form State
  const [ownCurrentPass, setOwnCurrentPass] = useState('');
  const [ownNewPass, setOwnNewPass] = useState('');
  const [ownConfirmPass, setOwnConfirmPass] = useState('');
  const [ownPassSubmitting, setOwnPassSubmitting] = useState(false);
  const [showOwnPass, setShowOwnPass] = useState(false);

  // New Account Form State
  const [newRole, setNewRole] = useState<'CEO' | 'EMPLOYEE' | 'MAINTENANCE'>('EMPLOYEE');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDesignation, setNewDesignation] = useState('ফিল্ড অফিসার (মাঠ কর্মী)');
  const [newArea, setNewArea] = useState('এলাকা-০১');
  const [newAccountSubmitting, setNewAccountSubmitting] = useState(false);
  const [showNewAccountPass, setShowNewAccountPass] = useState(false);

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<SystemAccount | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounts/list');
      const data = await res.json();
      if (data.success && data.users) {
        setAccounts(data.users);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle Admin Changing Own Password
  const handleOwnPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (ownNewPass !== ownConfirmPass) {
      setStatusMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।' });
      return;
    }

    if (ownNewPass.length < 4) {
      setStatusMessage({ type: 'error', text: 'পাসওয়ার্ড সর্বনিম্ন ৪ অক্ষরের হতে হবে।' });
      return;
    }

    setOwnPassSubmitting(true);
    try {
      const res = await fetch('/api/accounts/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: ownCurrentPass,
          newPassword: ownNewPass,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
        setOwnCurrentPass('');
        setOwnNewPass('');
        setOwnConfirmPass('');
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'সার্ভার যোগাযোগে সমস্যা হয়েছে।' });
    } finally {
      setOwnPassSubmitting(false);
    }
  };

  // Handle Create New Account
  const handleCreateNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!newName.trim() || !newPhone.trim() || !newPassword) {
      setStatusMessage({ type: 'error', text: 'অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন।' });
      return;
    }

    setNewAccountSubmitting(true);
    try {
      const res = await fetch('/api/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: newRole,
          name: newName,
          phone: newPhone,
          email: newEmail,
          password: newPassword,
          designation: newDesignation,
          assignedArea: newArea,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `নতুন ${newRole === 'CEO' ? 'অ্যাডমিন' : newRole === 'EMPLOYEE' ? 'কর্মী' : 'আইটি'} অ্যাকাউন্ট (আইডি: ${newPhone}) সফলভাবে তৈরি হয়েছে!`
        });
        setNewName('');
        setNewPhone('');
        setNewEmail('');
        setNewPassword('');
        fetchAccounts();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে।' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'সার্ভার যোগাযোগে সমস্যা হয়েছে।' });
    } finally {
      setNewAccountSubmitting(false);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (account: SystemAccount) => {
    if (account.isMainAdmin) {
      alert('মূল প্রধান অ্যাডমিন অ্যাকাউন্ট স্থগিত করা সম্ভব নয়।');
      return;
    }
    const confirmText = account.status === 'ACTIVE'
      ? `আপনি কি নিশ্চিতভাবে ${account.displayName}-এর অ্যাকাউন্ট সাময়িকভাবে স্থগিত করতে চান?`
      : `আপনি কি ${account.displayName}-এর অ্যাকাউন্ট পুনরায় সক্রিয় করতে চান?`;

    if (!confirm(confirmText)) return;

    try {
      const res = await fetch('/api/accounts/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: account.uid }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        fetchAccounts();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ।' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'সার্ভার যোগাযোগে সমস্যা।' });
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async (account: SystemAccount) => {
    if (account.isMainAdmin) {
      alert('মূল প্রধান অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যাবে না।');
      return;
    }

    if (!confirm(`আপনি কি স্থায়ীভাবে ${account.displayName} (${account.role})-এর অ্যাকাউন্ট মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/accounts/delete?uid=${account.uid}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        fetchAccounts();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'অ্যাকাউন্ট মোছা ব্যর্থ।' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'সার্ভার যোগাযোগে সমস্যা।' });
    }
  };

  // Handle Reset User Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !resetPasswordVal) return;

    setResetSubmitting(true);
    try {
      const res = await fetch('/api/accounts/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: resetModalUser.uid,
          newPassword: resetPasswordVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setResetModalUser(null);
        setResetPasswordVal('');
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'পাসওয়ার্ড রিসেট ব্যর্থ।' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'সার্ভার যোগাযোগে সমস্যা।' });
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="CEO"
        title="অ্যাকাউন্ট ও অ্যাক্সেস ব্যবস্থাপনা"
        subtitle="অ্যাডমিনের নিজস্ব পাসওয়ার্ড পরিবর্তন, নতুন সিইও/কর্মী/আইটি অ্যাকাউন্ট তৈরি ও নিয়ন্ত্রণ"
      >
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Notification Alert */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 border text-sm transition-all ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
          )}

          {/* Top Two Cards: Change Own Password & Create New Account */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Card 1: Change My Password (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">আমার পাসওয়ার্ড পরিবর্তন</h2>
                    <p className="text-xs text-gray-500">
                      লগইন আইডি: <span className="font-bold text-brand-navy-900">{user?.phoneNumber || '01706338181'}</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleOwnPasswordChange} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">বর্তমান পাসওয়ার্ড *</label>
                    <div className="mt-1 relative">
                      <input
                        type={showOwnPass ? 'text' : 'password'}
                        required
                        value={ownCurrentPass}
                        onChange={(e) => setOwnCurrentPass(e.target.value)}
                        placeholder="বর্তমান গোপন পাসওয়ার্ড"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-navy-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOwnPass(!showOwnPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showOwnPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">নতুন পাসওয়ার্ড *</label>
                    <div className="mt-1">
                      <input
                        type="password"
                        required
                        value={ownNewPass}
                        onChange={(e) => setOwnNewPass(e.target.value)}
                        placeholder="সর্বনিম্ন ৪ অক্ষরের নতুন পাসওয়ার্ড"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-navy-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
                    <div className="mt-1">
                      <input
                        type="password"
                        required
                        value={ownConfirmPass}
                        onChange={(e) => setOwnConfirmPass(e.target.value)}
                        placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-navy-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={ownPassSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-brand-navy-900 hover:bg-brand-navy-950 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                  >
                    {ownPassSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 text-brand-orange-400" />
                    )}
                    <span>পাসওয়ার্ড আপডেট করুন</span>
                  </button>
                </form>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-gray-600">
                💡 পাসওয়ার্ড পরিবর্তনের সাথে সাথে পূর্ববর্তী সেশন আপডেট হবে এবং আপনার দেওয়া নতুন পাসওয়ার্ড দিয়ে পরবর্তী সময়ে লগইন করতে পারবেন।
              </div>
            </div>

            {/* Card 2: Create New Account (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">নতুন অ্যাকাউন্ট তৈরি করুন</h2>
                  <p className="text-xs text-gray-500">সিইও, মাঠকর্মী বা আইটি স্টাফের জন্য নতুন আইডি ও পাসওয়ার্ড বরাদ্দ</p>
                </div>
              </div>

              <form onSubmit={handleCreateNewAccount} className="mt-5 space-y-4">
                {/* Role Selection Buttons */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">অ্যাকাউন্টের ভূমিকা (রোল) নির্বাচন করুন *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRole('CEO')}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        newRole === 'CEO'
                          ? 'border-brand-navy-900 bg-brand-navy-900 text-white shadow'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ShieldCheck className={`w-5 h-5 mb-1 ${newRole === 'CEO' ? 'text-brand-orange-400' : 'text-gray-500'}`} />
                      <div>
                        <div className="font-bold text-xs">সিইও / অ্যাডমিন</div>
                        <div className={`text-[10px] ${newRole === 'CEO' ? 'text-gray-300' : 'text-gray-500'}`}>আর্থিক অনুমোদন ও পূর্ণ ক্ষমতা</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewRole('EMPLOYEE')}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        newRole === 'EMPLOYEE'
                          ? 'border-emerald-700 bg-emerald-700 text-white shadow'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <UserCheck className={`w-5 h-5 mb-1 ${newRole === 'EMPLOYEE' ? 'text-emerald-200' : 'text-gray-500'}`} />
                      <div>
                        <div className="font-bold text-xs">মাঠ কর্মী (Employee)</div>
                        <div className={`text-[10px] ${newRole === 'EMPLOYEE' ? 'text-emerald-100' : 'text-gray-500'}`}>সঞ্চয় ও কালেকশন দাখিল</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewRole('MAINTENANCE')}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        newRole === 'MAINTENANCE'
                          ? 'border-blue-700 bg-blue-700 text-white shadow'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Wrench className={`w-5 h-5 mb-1 ${newRole === 'MAINTENANCE' ? 'text-blue-200' : 'text-gray-500'}`} />
                      <div>
                        <div className="font-bold text-xs">আইটি / মেইনটেনেন্স</div>
                        <div className={`text-[10px] ${newRole === 'MAINTENANCE' ? 'text-blue-100' : 'text-gray-500'}`}>ওয়েবসাইট নোটিশ ও ছবি</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">ব্যবহারকারীর পুরো নাম *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="যেমন: মোঃ কামরুল ইসলাম"
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">ইউজার আইডি / মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="যেমন: 01812345678"
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">অফিসিয়াল ইমেইল (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="খালি রাখলে স্বয়ংক্রিয় তৈরি হবে"
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">গোপন পাসওয়ার্ড *</label>
                    <div className="mt-1 relative">
                      <input
                        type={showNewAccountPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="লগইন পাসওয়ার্ড (যেমন: 123456)"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-emerald-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewAccountPass(!showNewAccountPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewAccountPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Extra fields if Employee */}
                {newRole === 'EMPLOYEE' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900">পদবি (Designation)</label>
                      <input
                        type="text"
                        value={newDesignation}
                        onChange={(e) => setNewDesignation(e.target.value)}
                        placeholder="ফিল্ড অফিসার / কালেকশন এজেন্ট"
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-900">দায়িত্বপ্রাপ্ত এলাকা / শাখা</label>
                      <input
                        type="text"
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        placeholder="যেমন: এলাকা-০১ (উত্তর জোন)"
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={newAccountSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {newAccountSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>নতুন অ্যাকাউন্ট তৈরি ও সংরক্ষণ করুন</span>
                </button>
              </form>
            </div>
          </div>

          {/* Section 3: All System Accounts Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-navy-100 flex items-center justify-center text-brand-navy-900">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">সিস্টেমের সক্রিয় অ্যাকাউন্টসমূহ</h2>
                  <p className="text-xs text-gray-500">
                    বর্তমানে মোট {accounts.length}টি অ্যাকাউন্ট সিস্টেমে নিবন্ধিত রয়েছে
                  </p>
                </div>
              </div>

              <button
                onClick={fetchAccounts}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>রিফ্রেশ করুন</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-navy-900" />
                <p className="text-xs">অ্যাকাউন্ট তালিকা লোড হচ্ছে...</p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs">
                কোনো অ্যাকাউন্ট পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200 text-gray-600">
                      <th className="py-3 px-4 font-bold">নাম ও পরিচয়</th>
                      <th className="py-3 px-4 font-bold">ইউজার আইডি / মোবাইল</th>
                      <th className="py-3 px-4 font-bold">ইমেইল</th>
                      <th className="py-3 px-4 font-bold">অ্যাকাউন্টের রোল</th>
                      <th className="py-3 px-4 font-bold">স্ট্যাটাস</th>
                      <th className="py-3 px-4 font-bold">তৈরির সময়</th>
                      <th className="py-3 px-4 font-bold text-right">কার্যক্রম (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {accounts.map((acc) => (
                      <tr key={acc.uid} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>{acc.displayName}</span>
                            {acc.isMainAdmin && (
                              <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-300">
                                প্রধান অ্যাডমিন
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-brand-navy-900">
                          {acc.phoneNumber || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">{acc.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              acc.role === 'CEO'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : acc.role === 'EMPLOYEE'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : 'bg-blue-50 text-blue-900 border-blue-300'
                            }`}
                          >
                            {acc.role === 'CEO'
                              ? '👑 সিইও / অ্যাডমিন'
                              : acc.role === 'EMPLOYEE'
                              ? '👔 মাঠকর্মী'
                              : '💻 আইটি স্টাফ'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              acc.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                acc.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-red-600'
                              }`}
                            />
                            <span>{acc.status === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {new Date(acc.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Reset Password Button */}
                            <button
                              onClick={() => {
                                setResetModalUser(acc);
                                setResetPasswordVal('');
                              }}
                              title="পাসওয়ার্ড রিসেট করুন"
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Status (Disabled for main admin) */}
                            {!acc.isMainAdmin && (
                              <button
                                onClick={() => handleToggleStatus(acc)}
                                title={acc.status === 'ACTIVE' ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
                                className={`p-1.5 rounded-lg border transition ${
                                  acc.status === 'ACTIVE'
                                    ? 'border-gray-200 text-gray-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200'
                                    : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete User (Disabled for main admin) */}
                            {!acc.isMainAdmin && (
                              <button
                                onClick={() => handleDeleteAccount(acc)}
                                title="স্থায়ীভাবে মুছে ফেলুন"
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reset Password Modal */}
        {resetModalUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 text-gray-900 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">পাসওয়ার্ড রিসেট করুন</h3>
                  <p className="text-xs text-gray-500">
                    ব্যবহারকারী: <span className="font-bold">{resetModalUser.displayName}</span> ({resetModalUser.phoneNumber || resetModalUser.email})
                  </p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700">নতুন পাসওয়ার্ড প্রদান করুন *</label>
                  <input
                    type="password"
                    required
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড (যেমন: 123456)"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {resetSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>পাসওয়ার্ড রিসেট সম্পন্ন করুন</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
