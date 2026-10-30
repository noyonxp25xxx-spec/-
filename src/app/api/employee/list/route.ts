import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { Employee } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const employeeMap = new Map<string, Employee>();

    // 1. Fetch from Firestore employees collection
    try {
      const snap = await adminDb.collection('employees').get();
      for (const doc of snap.docs) {
        const emp = doc.data() as Employee;
        const id = doc.id || emp.id;
        employeeMap.set(id, { ...emp, id });
      }
    } catch (dbErr) {
      console.warn('Firestore fetch employees error:', dbErr);
    }

    // 2. Also check Firestore users collection for any EMPLOYEE not in employees collection
    try {
      const uSnap = await adminDb.collection('users').where('role', '==', 'EMPLOYEE').get();
      for (const doc of uSnap.docs) {
        const u = doc.data();
        const hasEmp = Array.from(employeeMap.values()).some((e) => e.userId === doc.id || e.phone === u.phoneNumber);
        if (!hasEmp) {
          const empId = `EMP-${doc.id.slice(-6)}`;
          const autoEmp: Employee = {
            id: `emp-${doc.id}`,
            userId: doc.id,
            employeeId: empId,
            name: u.displayName || 'মাঠ কর্মী',
            phone: u.phoneNumber || '',
            email: u.email || '',
            designation: 'ফিল্ড অফিসার (মাঠ কর্মী)',
            role: 'EMPLOYEE',
            status: u.status || 'ACTIVE',
            joiningDate: (u.createdAt || new Date().toISOString()).split('T')[0],
            assignedArea: 'সাধারণ দায়িত্ব',
            totalCollectedPoisha: 0,
            totalTransactionsCount: 0,
            createdAt: u.createdAt || new Date().toISOString(),
            updatedAt: u.createdAt || new Date().toISOString()
          };
          employeeMap.set(autoEmp.id, autoEmp);
        }
      }
    } catch (uErr) {
      console.warn('Firestore users employee query warning:', uErr);
    }

    // 3. Merge with store
    const storeEmps = store.getEmployees();
    for (const se of storeEmps) {
      if (!employeeMap.has(se.id)) {
        employeeMap.set(se.id, se);
      }
    }

    const employees = Array.from(employeeMap.values());
    employees.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({
      success: true,
      employees,
      count: employees.length
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
