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
      return NextResponse.json({ success: false, error: 'শুধুমাত্র সিইও/প্রধান অ্যাডমিন পাসওয়ার্ড পরিবর্তন করতে পারেন।' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, currentPassword, newPassword } = body;

    if (!newPassword || newPassword.toString().trim().length < 4) {
      return NextResponse.json({ success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' }, { status: 400 });
    }

    const trimmedNewPass = newPassword.toString().trim();

    // Case 1: Changing own password
    if (!targetUserId || targetUserId === currentUser?.uid || targetUserId === sessionToken) {
      const activeUid = currentUser?.uid || sessionToken;
      if (currentUser?.password && currentUser.password !== currentPassword?.toString().trim()) {
        return NextResponse.json({ success: false, error: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' }, { status: 400 });
      }

      // Update in store
      store.updateUser(activeUid, { password: trimmedNewPass });

      // Update in Firestore
      try {
        await adminDb.collection('users').doc(activeUid).update({ password: trimmedNewPass });
      } catch (dbErr) {
        console.warn('Firestore update password error:', dbErr);
      }

      const auditLog = {
        id: `AUDIT-PWD-${Date.now()}`,
        actorUserId: activeUid,
        actorName: currentUser?.displayName || 'প্রধান প্রশাসক',
        actorRole: currentUser?.role || 'CEO',
        actionType: 'EMPLOYEE_PASSWORD_RESET' as const,
        targetEntity: 'USER' as const,
        targetId: activeUid,
        timestamp: new Date().toISOString(),
        outcome: 'SUCCESS' as const,
        reason: 'প্রধান অ্যাডমিন সফলভাবে নিজের লগইন পাসওয়ার্ড পরিবর্তন করেছেন'
      };

      try {
        await adminDb.collection('auditLogs').doc(auditLog.id).set(auditLog);
      } catch {}
      store.createAuditLog(auditLog);

      return NextResponse.json({ success: true, message: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
    }

    // Case 2: Resetting another user's password
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
      return NextResponse.json({ success: false, error: 'নির্দিষ্ট ব্যবহারকারীকে খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    // Update in store
    store.updateUser(targetUser.uid, { password: trimmedNewPass });

    // Update in Firestore
    try {
      await adminDb.collection('users').doc(targetUser.uid).update({ password: trimmedNewPass });
    } catch (dbErr) {
      console.warn('Firestore target user update password error:', dbErr);
    }

    const auditLog = {
      id: `AUDIT-PWD-RESET-${Date.now()}`,
      actorUserId: currentUser?.uid || sessionToken,
      actorName: currentUser?.displayName || 'প্রধান প্রশাসক',
      actorRole: currentUser?.role || 'CEO',
      actionType: 'EMPLOYEE_PASSWORD_RESET' as const,
      targetEntity: 'USER' as const,
      targetId: targetUser.uid,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS' as const,
      reason: `প্রধান অ্যাডমিন ব্যবহারকারী ${targetUser.displayName} (${targetUser.phoneNumber || targetUser.email})-এর পাসওয়ার্ড রিসেট করেছেন`
    };

    try {
      await adminDb.collection('auditLogs').doc(auditLog.id).set(auditLog);
    } catch {}
    store.createAuditLog(auditLog);

    return NextResponse.json({
      success: true,
      message: `${targetUser.displayName}-এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
