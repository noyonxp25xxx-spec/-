'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { Employee, UserStatus } from '@/types';
import {
  UserCheck,
  UserPlus,
  Shield,
  Phone,
  Mail,
  MapPin,
  Clock,
  Ban,
  CheckCircle,
  X,
  Loader2,
  Lock
} from 'lucide-react';

export default function CeoEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'ফিল্ড অফিসার (মাঠ কর্মী)',
    assignedArea: 'এলাকা-০১',
    initialPassword: 'TempWorkerPass2026!'
  });
  const { user } = useAuth();

  const loadEmployees = async () => {
    try {
      const res = await fetch('/api/employee/list');
      const data = await res.json();
      if (data.success && Array.isArray(data.employees)) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/employee/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creatorUid: user?.uid
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          designation: 'ফিল্ড অফিসার (মাঠ কর্মী)',
          assignedArea: 'এলাকা-০১',
          initialPassword: 'TempWorkerPass2026!'
        });
        loadEmployees();
      } else {
        alert(data.error || 'কর্মী অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে।');
      }
    } catch {
      alert('সার্ভার ত্রুটি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp: Employee, newStatus: UserStatus) => {
    if (!confirm(`আপনি কি নিশ্চিত যে কর্মীর অ্যাকাউন্টটি '${newStatus}' করতে চান?`)) return;

    try {
      const res = await fetch('/api/employee/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          newStatus,
          creatorUid: user?.uid
        })
      });
      const data = await res.json();
      if (data.success) {
        loadEmployees();
      } else {
        alert(data.error);
      }
    } catch {
      alert('সার্ভার ত্রুটি।');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="CEO"
        title="কর্মী ও ফিল্ড অফিসার ব্যবস্থাপনা"
        subtitle="সংস্থার বিশ্বস্ত মাঠকর্মী নিয়োগ, ভূমিকা নির্ধারণ, স্থিতি পরিবর্তন ও কার্যকলাপ নিরীক্ষা"
      >
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                নিবন্ধিত কর্মী: {toBengaliNumber(employees.length)} জন
              </h3>
              <p className="text-xs text-gray-500">
                শুধুমাত্র সিইও মহোদয় নতুন কর্মী অনুমোদন বা স্থগিত করতে পারেন।
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-brand-orange-400" />
              <span>নতুন কর্মী নিয়োগ ও অ্যাকাউন্ট তৈরি</span>
            </button>
          </div>

          {/* Employees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-brand-green-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {emp.employeeId}
                      </span>
                      <h4 className="font-bold text-base text-gray-900 mt-1">{emp.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">{emp.designation}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : emp.status === 'SUSPENDED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.status === 'ACTIVE' ? 'সক্রিয়' : emp.status === 'SUSPENDED' ? 'স্থগিত' : 'বাতিল'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{emp.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>দায়িত্বপ্রাপ্ত এলাকা: {emp.assignedArea || 'সাধারণ'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">মোট কালেকশন</span>
                      <span className="font-bold text-brand-navy-900 font-bengali">
                        {formatBDT(emp.totalCollectedPoisha)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-semibold">দাখিলকৃত লেনদেন</span>
                      <span className="font-bold text-gray-900">
                        {toBengaliNumber(emp.totalTransactionsCount)} টি
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  {emp.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleToggleStatus(emp, 'SUSPENDED')}
                      className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>স্থগিত করুন</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(emp, 'ACTIVE')}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>পুনরায় সক্রিয় করুন</span>
                    </button>
                  )}

                  {emp.status !== 'REVOKED' && (
                    <button
                      onClick={() => handleToggleStatus(emp, 'REVOKED')}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      অ্যাক্সেস প্রত্যাহার
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Employee Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <form
                onSubmit={handleCreateEmployee}
                className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-lg text-gray-900">নতুন কর্মী অ্যাকাউন্ট তৈরি</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">কর্মীর পুরো নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="মোঃ কাওসার আহমেদ"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">অফিসিয়াল ইমেইল *</label>
                    <input
                      type="email"
                      required
                      placeholder="worker@bhaggounnayan.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    <label className="text-xs font-bold text-gray-700">পদবী *</label>
                    <input
                      type="text"
                      required
                      placeholder="ফিল্ড অফিসার (মাঠ কর্মী)"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">দায়িত্বপ্রাপ্ত এলাকা</label>
                    <input
                      type="text"
                      placeholder="এলাকা-০১ (উত্তর জোন)"
                      value={formData.assignedArea}
                      onChange={(e) => setFormData({ ...formData, assignedArea: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">অস্থায়ী পাসওয়ার্ড *</label>
                    <input
                      type="text"
                      required
                      value={formData.initialPassword}
                      onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-brand-green-700 font-mono"
                    />
                  </div>
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
                    <span>অ্যাকাউন্ট তৈরি করুন</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
