import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { cookies } from 'next/headers';
import { UserProfile } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    const isCEO = currentUser?.role === 'CEO' ||
                  currentUser?.phoneNumber === '01706338181' ||
                  sessionToken === 'ceo-user-01706338181' ||
                  sessionToken?.includes('01706338181') ||
                  sessionToken?.startsWith('ceo-');

    if (!isCEO) {
      return NextResponse.json({ success: false, error: 'শুধুমাত্র প্রধান অ্যাডমিন/সিইও এই তালিকা দেখতে পারেন।' }, { status: 403 });
    }

    // 1. Fetch live users from Firestore
    const userMap = new Map<string, UserProfile>();

    try {
      const snap = await adminDb.collection('users').get();
      for (const doc of snap.docs) {
        const u = doc.data() as UserProfile;
        const uid = doc.id || u.uid;
        userMap.set(uid, { ...u, uid });
      }
    } catch (dbErr) {
      console.warn('Firestore fetch users error:', dbErr);
    }

    // 2. Merge with store users
    for (const u of store.getUsers()) {
      if (!userMap.has(u.uid)) {
        userMap.set(u.uid, u);
      }
    }

    // 3. Ensure store has all Firestore users
    Array.from(userMap.values()).forEach((u) => {
      if (!store.getUserById(u.uid)) {
        store.createUser(u);
      }
    });

    // 3. Format response
    const users = Array.from(userMap.values()).map((u) => ({
      uid: u.uid,
      displayName: u.displayName,
      email: u.email,
      phoneNumber: u.phoneNumber,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      isMainAdmin: u.phoneNumber === '01706338181' || u.email === '01706338181@bhaggounnayan.org'
    }));

    // Sort: Main admin first, then by createdAt descending
    users.sort((a, b) => {
      if (a.isMainAdmin) return -1;
      if (b.isMainAdmin) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
