import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { Member } from '@/types';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('bhaggo_session_token')?.value ||
                         cookies().get('bhaggo_session_token')?.value ||
                         req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();
    const { memberId: customMemberId, name, fatherName, motherName, phone, nid, address, registeredByUserId } = body;

    const actorId = registeredByUserId || sessionToken;
    let actor = actorId ? store.getUserById(actorId) : null;

    if (!actor && actorId) {
      try {
        const userDoc = await adminDb.collection('users').doc(actorId).get();
        if (userDoc.exists) {
          actor = userDoc.data() as any;
        }
      } catch (err) {
        console.warn('Firestore actor check:', err);
      }
    }

    // Default to main admin if actorId matches primary admin credentials or phone
    const isMainAdmin = actorId === 'ceo-user-01706338181' || actorId === '01706338181' || actor?.phoneNumber === '01706338181' || actor?.role === 'CEO';
    const isEmployee = actor?.role === 'EMPLOYEE';

    if (!isMainAdmin && !isEmployee) {
      return NextResponse.json(
        { success: false, error: 'শুধুমাত্র অনুমোদিত কর্মী অথবা সিইও সদস্য নিবন্ধন করতে পারেন।' },
        { status: 403 }
      );
    }

    if (!name || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'সদস্যের নাম, মোবাইল নম্বর এবং বর্তমান ঠিকানা আবশ্যক।' },
        { status: 400 }
      );
    }

    if (!customMemberId || !customMemberId.trim()) {
      return NextResponse.json(
        { success: false, error: 'সদস্য আইডি প্রদান করা বাধ্যতামূলক।' },
        { status: 400 }
      );
    }

    const memberId = customMemberId.trim();
    const newDocId = `MEM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newMember: Member = {
      id: newDocId,
      memberId,
      name: name.trim(),
      fatherName: (fatherName || '').trim(),
      motherName: (motherName || '').trim(),
      phone: phone.trim(),
      nid: (nid || '').trim(),
      address: address.trim(),
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      currentBalancePoisha: 0,
      totalDepositedPoisha: 0,
      totalWithdrawnPoisha: 0,
      registeredByEmployeeId: actor?.uid || actorId || 'ceo-user-01706338181',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Save directly into Firestore database
    try {
      await adminDb.collection('members').doc(newDocId).set(newMember);
    } catch (dbErr: any) {
      console.error('Firestore member save error:', dbErr);
      return NextResponse.json(
        { success: false, error: `ডাটাবেজে সদস্য সংরক্ষণ করতে ব্যর্থ: ${dbErr.message}` },
        { status: 500 }
      );
    }

    // 2. Also save to local store
    store.createMember(newMember);

    // 3. Save audit log
    const auditLog = {
      id: `AUDIT-MEM-${Date.now()}`,
      actorUserId: actor?.uid || actorId || 'SYSTEM',
      actorName: actor?.displayName || 'প্রধান প্রশাসক',
      actorRole: actor?.role || 'CEO',
      actionType: 'MEMBER_CREATED' as const,
      targetEntity: 'MEMBER' as const,
      targetId: memberId,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS' as const,
      metadata: { name, phone, memberId },
      reason: 'নতুন সমবায় সদস্যের নিবন্ধন সম্পন্ন'
    };

    try {
      await adminDb.collection('auditLogs').doc(auditLog.id).set(auditLog);
    } catch {
      // Non-fatal
    }
    store.createAuditLog(auditLog);

    return NextResponse.json({
      success: true,
      message: `নতুন সদস্য (${name} - ${memberId}) সফলভাবে ডাটাবেজে যুক্ত ও নিবন্ধিত হয়েছে।`,
      member: newMember
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
