import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/services/data-store';
import { PublicActivity } from '@/types';

export async function GET() {
  const activities = store.getActivities();
  return NextResponse.json({ success: true, activities });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, imageUrl, caption, location, date, authorUserId, authorName } = body;

    const actor = authorUserId ? store.getUserById(authorUserId) : null;
    if (!actor || (actor.role !== 'MAINTENANCE' && actor.role !== 'CEO')) {
      return NextResponse.json(
        { success: false, error: 'শুধুমাত্র রক্ষণাবেক্ষণ কর্মী অথবা সিইও কার্যক্রম যোগ করতে পারেন।' },
        { status: 403 }
      );
    }

    if (!title || !description || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'কার্যক্রমের শিরোনাম, বিস্তারিত বিবরণ এবং ছবির লিঙ্ক আবশ্যক।' },
        { status: 400 }
      );
    }

    const newActivity: PublicActivity = {
      id: `ACT-${Date.now()}`,
      title,
      description,
      category: category || 'COMMUNITY',
      imageUrl,
      caption: caption || '',
      date: date || new Date().toISOString().split('T')[0],
      location: location || '',
      isPublished: true,
      authorName: authorName || actor.displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = store.createActivity(newActivity);

    store.createAuditLog({
      id: `AUDIT-ACT-${Date.now()}`,
      actorUserId: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      actionType: 'ACTIVITY_CREATED',
      targetEntity: 'ACTIVITY',
      targetId: saved.id,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS',
      reason: `নতুন সামাজিক কার্যক্রম প্রকাশ: "${title}"`
    });

    return NextResponse.json({ success: true, activity: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const authorUserId = searchParams.get('authorUserId');

    const actor = authorUserId ? store.getUserById(authorUserId) : null;
    if (!actor || (actor.role !== 'MAINTENANCE' && actor.role !== 'CEO')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত।' }, { status: 403 });
    }

    if (!id) return NextResponse.json({ success: false, error: 'আইডি আবশ্যক।' }, { status: 400 });

    const deleted = store.deleteActivity(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
