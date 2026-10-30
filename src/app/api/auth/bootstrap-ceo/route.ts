import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/services/data-store';
import { isFirebaseAdminConfigured, adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const providedToken = authHeader.replace('Bearer ', '').trim();
    const expectedToken = process.env.ADMIN_SETUP_TOKEN || 'secure-local-bootstrap-token-2026';

    if (!providedToken || providedToken !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অনুরোধ। সঠিক অ্যাডমিন সেটআপ টোকেন আবশ্যক।' },
        { status: 401 }
      );
    }

    const email = process.env.INITIAL_CEO_EMAIL || '01706338181';
    const password = process.env.INITIAL_CEO_PASSWORD || '805222';
    const name = process.env.INITIAL_CEO_NAME || 'প্রধান প্রশাসক ও সিইও';
    const phone = process.env.INITIAL_CEO_PHONE || '01706338181';

    // 1. Check if CEO already exists in local store
    const existing = store.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'সিইও অ্যাকাউন্ট ইতোমধ্যে সক্রিয় রয়েছে।',
        ceo: {
          uid: existing.uid,
          email: existing.email,
          displayName: existing.displayName,
          role: existing.role
        }
      });
    }

    // 2. Provision in Firebase Auth if configured
    let uid = `ceo-user-${Date.now()}`;
    if (isFirebaseAdminConfigured()) {
      try {
        const firebaseUser = await adminAuth.createUser({
          email,
          password,
          displayName: name,
          phoneNumber: phone
        });
        uid = firebaseUser.uid;
        await adminAuth.setCustomUserClaims(uid, { role: 'CEO' });
        await adminDb.collection('users').doc(uid).set({
          uid,
          email,
          displayName: name,
          role: 'CEO',
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        });
      } catch (err: any) {
        console.warn('Firebase Admin provisioning warning:', err.message);
      }
    }

    // 3. Register in local store
    const newCeo = store.createUser({
      uid,
      email,
      displayName: name,
      phoneNumber: phone,
      role: 'CEO',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    store.createAuditLog({
      id: `AUDIT-BOOTSTRAP-${Date.now()}`,
      actorUserId: uid,
      actorName: name,
      actorRole: 'CEO',
      actionType: 'LOGIN_SUCCESS',
      targetEntity: 'USER',
      targetId: uid,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS',
      reason: 'প্রাথমিক সিইও অ্যাকাউন্ট সুরক্ষিতভাবে বুটস্ট্র্যাপ করা হয়েছে।'
    });

    return NextResponse.json({
      success: true,
      message: 'সিইও অ্যাকাউন্ট সফলভাবে তৈরি এবং সক্রিয় করা হয়েছে।',
      ceo: {
        uid: newCeo.uid,
        email: newCeo.email,
        displayName: newCeo.displayName,
        role: newCeo.role
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
