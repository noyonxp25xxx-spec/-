'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth/guard';
import { store } from '@/lib/services/data-store';
import { formatBDT, formatDateBengali, toBengaliNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { Employee } from '@/types';
import { User, Phone, Mail, MapPin, Calendar, Award, Shield, CheckCircle } from 'lucide-react';

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (user) {
      const emp = store.getEmployeeByUserId(user.uid) || store.getEmployees()[0];
      setEmployee(emp || null);
    }
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE', 'CEO']} loginRedirect="/login">
      <DashboardLayout
        portalType="EMPLOYEE"
        title="আমার কর্মী প্রোফাইল"
        subtitle="অফিসিয়াল কর্মবিবরণী, দায়িত্বপ্রাপ্ত অঞ্চল ও কর্মদক্ষতা"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="w-16 h-16 rounded-3xl bg-brand-green-800 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {user?.displayName ? user.displayName[0] : 'E'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user?.displayName || employee?.name}</h3>
                <p className="text-xs text-brand-green-800 font-semibold">{employee?.designation}</p>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-gray-500 font-bold mt-1 inline-block">
                  আইডি: {employee?.employeeId}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 font-semibold block">অফিসিয়াল ইমেইল</span>
                <span className="font-bold text-gray-900">{employee?.email || user?.email}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 font-semibold block">মোবাইল নম্বর</span>
                <span className="font-bold text-gray-900">{employee?.phone || user?.phoneNumber}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 font-semibold block">দায়িত্বপ্রাপ্ত এলাকা</span>
                <span className="font-bold text-gray-900">{employee?.assignedArea || 'সাধারণ দায়িত্ব'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 font-semibold block">যোগদানের তারিখ</span>
                <span className="font-bold text-gray-900">
                  {formatDateBengali(employee?.joiningDate || new Date().toISOString())}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-800 font-semibold block">আমার অনুমোদিত মোট কালেকশন:</span>
                <span className="text-2xl font-black text-emerald-950 font-bengali">
                  {formatBDT(employee?.totalCollectedPoisha || 0)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block">মোট দাখিলকৃত ট্রানজেকশন:</span>
                <span className="font-bold text-gray-900 text-sm">
                  {toBengaliNumber(employee?.totalTransactionsCount || 0)} টি
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-3">
              <Shield className="w-5 h-5 text-brand-green-700 flex-shrink-0 mt-0.5" />
              <span>
                কর্মী হিসেবে আপনার সকল কর্মকাণ্ড কেন্দ্রীয় অডিট লগে সার্ভার-সাইড টাইমস্ট্যাম্পসহ রেকর্ড করা হয়। পাসওয়ার্ড পরিবর্তন বা তথ্য হালনাগাদের জন্য সিইও মহোদয়ের সাথে যোগাযোগ করুন।
              </span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
