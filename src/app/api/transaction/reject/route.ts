import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { cookies } from 'next/headers';
import { UserProfile, Transaction } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('bhaggo_session_token')?.value ||
                         cookies().get('bhaggo_session_token')?.value ||
                         req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();
    const { transactionId, reviewerUserId, rejectionReason } = body;

    const actorId = reviewerUserId || sessionToken;
    let reviewer = actorId ? store.getUserById(actorId) : null;

    if (!reviewer && actorId) {
      try {
        const uDoc = await adminDb.collection('users').doc(actorId).get();
        if (uDoc.exists) {
          reviewer = uDoc.data() as UserProfile;
        }
      } catch {}
    }

    const isCEO = reviewer?.role === 'CEO' || actorId === 'ceo-user-01706338181' || actorId === '01706338181';
    if (!isCEO) {
      return NextResponse.json(
        { success: false, error: 'শুধুমাত্র প্রধান নির্বাহী কর্মকর্তা (সিইও) লেনদেন প্রত্যাখ্যান করতে পারেন।' },
        { status: 403 }
      );
    }

    if (!transactionId) {
      return NextResponse.json({ success: false, error: 'লেনদেন আইডি আবশ্যক।' }, { status: 400 });
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।' },
        { status: 400 }
      );
    }

    const reviewedAt = new Date().toISOString();
    const reviewerName = reviewer?.displayName || 'প্রধান প্রশাসক ও সিইও';
    const reviewerUid = reviewer?.uid || 'ceo-user-01706338181';

    // 1. Update in Firestore
    try {
      await adminDb.collection('transactions').doc(transactionId).update({
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        reviewedByUserId: reviewerUid,
        reviewedByUserName: reviewerName,
        reviewedAt
      });
    } catch (dbErr) {
      console.warn('Firestore reject transaction error:', dbErr);
    }

    // 2. Update in store
    store.rejectTransaction(transactionId, reviewerUid, reviewerName, rejectionReason.trim());

    // 3. Audit Log
    const auditLog = {
      id: `AUDIT-REJ-${Date.now()}`,
      actorUserId: reviewerUid,
      actorName: reviewerName,
      actorRole: 'CEO' as const,
      actionType: 'TRANSACTION_REJECTED' as const,
      targetEntity: 'TRANSACTION' as const,
      targetId: transactionId,
      timestamp: reviewedAt,
      outcome: 'SUCCESS' as const,
      metadata: { reason: rejectionReason },
      reason: `সিইও মহোদয় কর্তৃক লেনদেন প্রত্যাখ্যান: ${rejectionReason}`
    };

    try {
      await adminDb.collection('auditLogs').doc(auditLog.id).set(auditLog);
    } catch {}
    store.createAuditLog(auditLog);

    return NextResponse.json({
      success: true,
      message: 'লেনদেনটি সফলভাবে ডাটাবেজে প্রত্যাখ্যাত হিসেবে চিহ্নিত করা হয়েছে।'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
