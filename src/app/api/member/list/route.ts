import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { Member } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let members: Member[] = [];

    // Query live Firestore members collection
    try {
      const snap = await adminDb.collection('members').get();
      if (!snap.empty) {
        members = snap.docs.map((doc) => {
          const data = doc.data() as Member;
          return {
            ...data,
            id: doc.id || data.id,
          };
        });
      }
    } catch (dbErr) {
      console.warn('Firestore fetch members warning:', dbErr);
    }

    // Merge with store if any existed only in store
    const storeMembers = store.getMembers();
    for (const sm of storeMembers) {
      if (!members.some((m) => m.id === sm.id || m.memberId === sm.memberId)) {
        members.push(sm);
      }
    }

    // Update store with live members
    for (const m of members) {
      if (!store.getMemberById(m.id)) {
        store.createMember(m);
      }
    }

    // Sort by createdAt descending
    members.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({
      success: true,
      members,
      count: members.length
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'সদস্য তালিকা লোড করতে ত্রুটি।' },
      { status: 500 }
    );
  }
}
