import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
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

    // Only CEO / Main Admin can delete any user
    const isCEO = currentUser?.role === 'CEO' || currentUser?.phoneNumber === '01706338181' || sessionToken === 'ceo-user-01706338181';
    if (!isCEO) {
      return NextResponse.json(
        { success: false, error: 'শুধুমাত্র সিইও/প্রধান অ্যাডমিন অ্যাকাউন্ট মুছে ফেলতে পারেন।' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('uid');

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'টার্গেট ইউজার আইডি প্রদান করুন।' }, { status: 400 });
    }

    // Find target user from store or Firestore
    let targetUser = store.getUserById(targetUserId);
    if (!targetUser) {
      try {
        const doc = await adminDb.collection('users').doc(targetUserId).get();
        if (doc.exists) {
          targetUser = doc.data() as UserProfile;
        }
      } catch {
        // Fallback
      }
    }

    // Prevent deletion of primary main admin
    if (
      targetUser?.phoneNumber === '01706338181' ||
      targetUserId === 'ceo-user-01706338181' ||
      targetUserId === currentUser?.uid
    ) {
      return NextResponse.json(
        { success: false, error: 'প্রধান অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যাবে না।' },
        { status: 400 }
      );
    }

    const displayName = targetUser?.displayName || targetUserId;
    const userRole = targetUser?.role || 'USER';

    // 1. DELETE DIRECTLY FROM FIRESTORE DATABASE (users collection)
    try {
      await adminDb.collection('users').doc(targetUserId).delete();

      // If document was keyed differently (e.g. by clean phone)
      if (targetUser?.phoneNumber) {
        const phoneSnap = await adminDb.collection('users').where('phoneNumber', '==', targetUser.phoneNumber).get();
        for (const doc of phoneSnap.docs) {
          if (doc.id !== 'ceo-user-01706338181') {
            await doc.ref.delete();
          }
        }
      }
    } catch (dbErr: any) {
      console.error('Firestore delete user error:', dbErr);
      return NextResponse.json(
        { success: false, error: `ডাটাবেজ থেকে ব্যবহারকারী মুছতে ব্যর্থ: ${dbErr.message}` },
        { status: 500 }
      );
    }

    // 2. DELETE FROM FIRESTORE EMPLOYEES COLLECTION IF APPLICABLE
    try {
      const empSnap = await adminDb.collection('employees').where('userId', '==', targetUserId).get();
      for (const doc of empSnap.docs) {
        await doc.ref.delete();
      }
      if (targetUser?.phoneNumber) {
        const empSnap2 = await adminDb.collection('employees').where('phone', '==', targetUser.phoneNumber).get();
        for (const doc of empSnap2.docs) {
          await doc.ref.delete();
        }
      }
    } catch (empErr) {
      console.warn('Firestore delete employee error:', empErr);
    }

    // 3. DELETE FROM FIREBASE AUTH IF EXISTS
    try {
      await adminAuth.deleteUser(targetUserId);
    } catch {
      // Ignored if not in Firebase Auth
    }

    // 4. DELETE FROM LOCAL STORE
    store.deleteUser(targetUserId);

    // 5. AUDIT LOG
    const auditLog = {
      id: `AUDIT-DEL-${Date.now()}`,
      actorUserId: currentUser?.uid || sessionToken,
      actorName: currentUser?.displayName || 'প্রধান প্রশাসক',
      actorRole: currentUser?.role || 'CEO',
      actionType: 'EMPLOYEE_STATUS_CHANGED' as const,
      targetEntity: 'USER' as const,
      targetId: targetUserId,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS' as const,
      reason: `প্রধান অ্যাডমিন কর্তৃক ব্যবহারকারী ${displayName} (${userRole}) অ্যাকাউন্ট ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে`
    };

    try {
      await adminDb.collection('auditLogs').doc(auditLog.id).set(auditLog);
    } catch {
      // Non-fatal
    }
    store.createAuditLog(auditLog);

    return NextResponse.json({
      success: true,
      message: `ব্যবহারকারী "${displayName}"-এর অ্যাকাউন্ট ডাটাবেজ থেকে সফলভাবে এবং স্থায়ীভাবে মুছে ফেলা হয়েছে।`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
