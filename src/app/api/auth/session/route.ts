import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/services/data-store';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, email, phone, password, roleHint } = body;
    const loginId = (identifier || email || phone || '').toString().trim();

    if (!loginId) {
      return NextResponse.json(
        { success: false, error: 'ইউজার আইডি, মোবাইল নম্বর অথবা ইমেইল প্রদান করুন।' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'গোপন পাসওয়ার্ড প্রদান করুন।' },
        { status: 400 }
      );
    }

    let user = store.getUserByIdentifier(loginId);

    // If not found in store, query live Firestore users
    if (!user) {
      try {
        const { adminDb } = await import('@/lib/firebase/admin');
        const cleanPhone = loginId.replace(/[^0-9]/g, '');

        let snap = cleanPhone ? await adminDb.collection('users').where('phoneNumber', '==', cleanPhone).limit(1).get() : null;
        if (!snap || snap.empty) {
          snap = await adminDb.collection('users').where('email', '==', loginId.toLowerCase()).limit(1).get();
        }
        if (!snap || snap.empty) {
          const directDoc = await adminDb.collection('users').doc(loginId).get();
          if (directDoc.exists) {
            user = { ...directDoc.data(), uid: directDoc.id } as any;
          }
        } else {
          user = { ...snap.docs[0].data(), uid: snap.docs[0].id } as any;
        }

        if (user) {
          store.createUser(user);
        }
      } catch (fErr) {
        console.warn('Firestore user lookup error:', fErr);
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ইউজার আইডি বা মোবাইল নম্বর খুঁজে পাওয়া যায়নি।' },
        { status: 401 }
      );
    }

    // Verify Password
    const expectedPassword = user.password || (user.role === 'CEO' ? '805222' : '');
    if (!expectedPassword || user.password !== password.toString().trim()) {
      return NextResponse.json(
        { success: false, error: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'আপনার অ্যাকাউন্টটি স্থগিত বা নিষ্ক্রিয় অবস্থায় রয়েছে। সিইও মহোদয়ের সাথে যোগাযোগ করুন।' },
        { status: 403 }
      );
    }

    // Set secure HTTP-only session cookie
    cookies().set('bhaggo_session_token', user.uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Update lastLoginAt
    store.updateUser(user.uid, { lastLoginAt: new Date().toISOString() });

    // Determine target dashboard based on user role
    const redirectUrl =
      user.role === 'CEO'
        ? '/ceo/dashboard'
        : user.role === 'EMPLOYEE'
        ? '/employee/dashboard'
        : '/maintenance/dashboard';

    // Audit log
    store.createAuditLog({
      id: `AUDIT-LOG-${Date.now()}`,
      actorUserId: user.uid,
      actorName: user.displayName,
      actorRole: user.role,
      actionType: 'LOGIN_SUCCESS',
      targetEntity: 'USER',
      targetId: user.uid,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS',
      reason: `ব্যবহারকারী সফলভাবে সিস্টেমে লগইন করেছেন (${user.role} ড্যাশবোর্ড)`
    });

    return NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}

export async function DELETE() {
  cookies().delete('bhaggo_session_token');
  return NextResponse.json({ success: true, message: 'সফলভাবে লগআউট সম্পন্ন হয়েছে।' });
}
