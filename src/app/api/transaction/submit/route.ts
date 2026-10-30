import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { bdtToPoisha } from '@/lib/utils';
import { Transaction, PaymentMethod, TransactionType, UserProfile, Member } from '@/types';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('bhaggo_session_token')?.value ||
                         cookies().get('bhaggo_session_token')?.value ||
                         req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();
    const {
      memberId,
      amount,
      type,
      paymentMethod,
      referenceNumber,
      notes,
      attachmentUrl,
      submittedByUserId,
      idempotencyKey
    } = body;

    const actorId = submittedByUserId || sessionToken;
    let employeeUser = actorId ? store.getUserById(actorId) : null;

    // Check in Firestore users if not found in store
    if (!employeeUser && actorId) {
      try {
        const uDoc = await adminDb.collection('users').doc(actorId).get();
        if (uDoc.exists) {
          employeeUser = uDoc.data() as UserProfile;
        } else {
          // Check by phone
          const cleanPhone = actorId.replace(/[^0-9]/g, '');
          const snap = await adminDb.collection('users').where('phoneNumber', '==', cleanPhone).limit(1).get();
          if (!snap.empty) {
            employeeUser = snap.docs[0].data() as UserProfile;
          }
        }
      } catch (dbErr) {
        console.warn('Firestore employee user lookup error:', dbErr);
      }
    }

    // Allow EMPLOYEE or CEO or primary admin
    const isAuthorized = employeeUser?.role === 'EMPLOYEE' ||
                         employeeUser?.role === 'CEO' ||
                         actorId === 'ceo-user-01706338181' ||
                         actorId === '01706338181';

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অনুরোধ। শুধুমাত্র অনুমোদিত কর্মী বা সিইও লেনদেন দাখিল করতে পারেন।' },
        { status: 403 }
      );
    }

    // Look up Member from store or Firestore
    let member = store.getMemberById(memberId);
    if (!member) {
      try {
        const mDoc = await adminDb.collection('members').doc(memberId).get();
        if (mDoc.exists) {
          member = { ...mDoc.data(), id: mDoc.id } as Member;
        } else {
          // Search by memberId field or doc ID
          const snap = await adminDb.collection('members').where('memberId', '==', memberId).limit(1).get();
          if (!snap.empty) {
            member = { ...snap.docs[0].data(), id: snap.docs[0].id } as Member;
          } else {
            // Search all documents in case id field matches
            const allSnap = await adminDb.collection('members').get();
            const found = allSnap.docs.find(d => d.id === memberId || d.data().id === memberId || d.data().memberId === memberId);
            if (found) {
              member = { ...found.data(), id: found.id } as Member;
            }
          }
        }
      } catch (mErr) {
        console.warn('Firestore member lookup error:', mErr);
      }
    }

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'নির্দিষ্ট সদস্যকে ডাটাবেজে খুঁজে পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    const amountPoisha = bdtToPoisha(amount);
    if (amountPoisha <= 0) {
      return NextResponse.json(
        { success: false, error: 'লেনদেনের পরিমাণ শূন্য অথবা ঋণাত্মক হতে পারবে না।' },
        { status: 400 }
      );
    }

    // Check withdrawal balance pre-validation
    if (type === 'WITHDRAWAL' && (member.currentBalancePoisha || 0) < amountPoisha) {
      return NextResponse.json(
        {
          success: false,
          error: `সদস্যের ব্যালেন্স পর্যাপ্ত নয়। বর্তমান জমা: ৳${((member.currentBalancePoisha || 0) / 100).toFixed(2)}`
        },
        { status: 400 }
      );
    }

    const key = idempotencyKey || `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const txnId = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTxn: Transaction = {
      id: txnId,
      memberId: member.id,
      memberName: member.name,
      memberCode: member.memberId,
      amountPoisha,
      type: (type as TransactionType) || 'DEPOSIT',
      status: 'PENDING',
      paymentMethod: (paymentMethod as PaymentMethod) || 'CASH',
      referenceNumber: referenceNumber || '',
      notes: notes || '',
      attachmentUrl: attachmentUrl || '',
      submittedByUserId: employeeUser?.uid || actorId || 'SYSTEM_WORKER',
      submittedByEmployeeName: employeeUser?.displayName || 'মাঠ কর্মী',
      submittedAt: new Date().toISOString(),
      idempotencyKey: key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. SAVE DIRECTLY TO FIRESTORE (transactions collection)
    try {
      await adminDb.collection('transactions').doc(txnId).set(newTxn);
    } catch (saveErr: any) {
      console.error('Firestore save transaction error:', saveErr);
      return NextResponse.json(
        { success: false, error: `ডাটাবেজে লেনদেন সংরক্ষণ করতে ব্যর্থ: ${saveErr.message}` },
        { status: 500 }
      );
    }

    // 2. Save in local store
    const saved = store.createTransaction(newTxn);

    // 3. Audit log in Firestore & store
    const auditLog = {
      id: `AUDIT-TXN-${Date.now()}`,
      actorUserId: employeeUser?.uid || actorId || 'SYSTEM_WORKER',
      actorName: employeeUser?.displayName || 'মাঠ কর্মী',
      actorRole: employeeUser?.role || 'EMPLOYEE',
      actionType: 'TRANSACTION_SUBMITTED' as const,
      targetEntity: 'TRANSACTION' as const,
      targetId: txnId,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS' as const,
      metadata: {
        memberId: member.memberId,
        memberName: member.name,
        amountPoisha,
        type: newTxn.type
      },
      reason: 'নতুন কালেকশন লেনদেন সিইও মহোদয়ের অনুমোদনের জন্য অপেক্ষমাণ তালিকায় ডাটাবেজে অন্তর্ভুক্ত'
    };

    try {
      await adminDb.collection('auditLogs').doc(auditLog.id).set(auditLog);
    } catch {}
    store.createAuditLog(auditLog);

    return NextResponse.json({
      success: true,
      message: 'লেনদেন সফলভাবে ডাটাবেজে দাখিল হয়েছে। সিইও মহোদয়ের অনুমোদনের তালিকায় অন্তর্ভুক্ত করা হয়েছে।',
      transaction: saved
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
