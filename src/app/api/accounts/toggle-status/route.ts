import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('bhaggo_session_token')?.value ||
                         cookies().get('bhaggo_session_token')?.value ||
                         req.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'অনুগ্রহ করে প্রথমে লগইন করুন।' }, { status: 401 });
    }

    let currentUser = store.getUserById(sessionToken);
    if (!currentUser) {
      try {
        const uDoc = await adminDb.collection('users').doc(sessionToken).get();
        if (uDoc.exists) {
          currentUser = uDoc.data() as UserProfile;
        }
      } catch {
        // Fallback
      }
    }

    const isCEO = currentUser?.role === 'CEO' || currentUser?.phoneNumber === '01706338181' || sessionToken === 'ceo-user-01706338181';
    if (!isCEO) {
      return NextResponse.json({ success: false, error: 'শুধুমাত্র সিইও/প্রধান অ্যাডমিন অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন করতে পারেন।' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId } = body;

    let targetUser = store.getUserById(targetUserId);
    if (!targetUser) {
      try {
        const doc = await adminDb.collection('users').doc(targetUserId).get();
        if (doc.exists) {
          targetUser = doc.data() as UserProfile;
        }
      } catch {}
    }

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    if (targetUser.phoneNumber === '01706338181' || targetUserId === 'ceo-user-01706338181') {
      return NextResponse.json({ success: false, error: 'মূল সিইও/প্রধান অ্যাডমিন অ্যাকাউন্ট স্থগিত করা যাবে না।' }, { status: 400 });
    }

    const newStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    // 1. Update in store
    store.updateUser(targetUser.uid, { status: newStatus });
    const emp = store.getEmployeeByUserId(targetUser.uid);
    if (emp) {
      store.updateEmployee(emp.id, { status: newStatus });
    }

    // 2. Update in Firestore users
    try {
      await adminDb.collection('users').doc(targetUser.uid).update({ status: newStatus });
    } catch (dbErr) {
      console.warn('Firestore toggle user status error:', dbErr);
    }

    // 3. Update in Firestore employees
    try {
      const empDocs = await adminDb.collection('employees').where('userId', '==', targetUser.uid).get();
      for (const doc of empDocs.docs) {
        await doc.ref.update({ status: newStatus });
      }
    } catch (empErr) {
      console.warn('Firestore toggle employee status error:', empErr);
    }

    // 4. Audit Log
    const auditLog = {
      id: `AUDIT-STATUS-${Date.now()}`,
      actorUserId: currentUser?.uid || sessionToken,
      actorName: currentUser?.displayName || 'প্রধান প্রশাসক',
      actorRole: currentUser?.role || 'CEO',
      actionType: 'EMPLOYEE_STATUS_CHANGED' as const,
      targetEntity: 'USER' as const,
      targetId: targetUser.uid,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS' as const,
      reason: `ব্যবহারকারী ${targetUser.displayName}-এর স্ট্যাটাস পরিবর্তন করে ${newStatus} করা হয়েছে`
    };

    try {
      await adminDb.collection('auditLogs').doc(auditLog.id).set(auditLog);
    } catch {}
    store.createAuditLog(auditLog);

    return NextResponse.json({
      success: true,
      message: `অ্যাকাউন্ট স্ট্যাটাস সফলভাবে ${newStatus === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।`,
      newStatus
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
