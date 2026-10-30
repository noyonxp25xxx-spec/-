'use client';

import React, { useEffect } from 'react';
import { useAuth } from './context';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  loginRedirect?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  loginRedirect = '/login',
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(loginRedirect);
      } else if (!allowedRoles.includes(user.role)) {
        // Role mismatch: redirect to their own dashboard or login
        if (user.role === 'CEO') router.push('/ceo/dashboard');
        else if (user.role === 'EMPLOYEE') router.push('/employee/dashboard');
        else if (user.role === 'MAINTENANCE') router.push('/maintenance/dashboard');
        else router.push(loginRedirect);
      }
    }
  }, [user, loading, allowedRoles, loginRedirect, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <Loader2 className="w-10 h-10 animate-spin text-brand-green-700 mb-4" />
        <p className="font-bengali text-lg font-medium">নিরাপদ সংযোগ যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md border border-red-200 shadow-sm">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-red-600" />
          <h2 className="text-xl font-bold font-bengali mb-2">অননুমোদিত প্রবেশাধিকার</h2>
          <p className="font-bengali text-sm text-gray-600 mb-4">
            আপনার এই সেকশনে প্রবেশের অনুমতি নেই। অনুগ্রহ করে যথাযথ একাউন্টে সাইন ইন করুন।
          </p>
          <button
            onClick={() => router.push(loginRedirect)}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
          >
            লগইন পেজে যান
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
