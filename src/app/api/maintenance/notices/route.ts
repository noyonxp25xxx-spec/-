import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/services/data-store';
import { PublicNotice } from '@/types';

export async function GET() {
  const notices = store.getNotices();
  return NextResponse.json({ success: true, notices });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, category, priority, isPublished, authorUserId, authorName } = body;

    const actor = authorUserId ? store.getUserById(authorUserId) : null;
    if (!actor || (actor.role !== 'MAINTENANCE' && actor.role !== 'CEO')) {
      return NextResponse.json(
        { success: false, error: 'শুধুমাত্র রক্ষণাবেক্ষণ কর্মী অথবা সিইও নোটিশ প্রকাশ করতে পারেন।' },
        { status: 403 }
      );
    }

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'শিরোনাম ও বিষয়বস্তু আবশ্যক।' }, { status: 400 });
    }

    const newNotice: PublicNotice = {
      id: `NOTICE-${Date.now()}`,
      title,
      content,
      category: category || 'GENERAL',
      priority: priority || 'NORMAL',
      publishedAt: new Date().toISOString().split('T')[0],
      isPublished: isPublished !== undefined ? isPublished : true,
      authorName: authorName || actor.displayName,
      authorId: actor.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = store.createNotice(newNotice);

    store.createAuditLog({
      id: `AUDIT-NOTICE-${Date.now()}`,
      actorUserId: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      actionType: 'NOTICE_CREATED',
      targetEntity: 'NOTICE',
      targetId: saved.id,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS',
      reason: `নতুন নোটিশ প্রকাশ: "${title}"`
    });

    return NextResponse.json({ success: true, notice: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates, authorUserId } = body;

    const actor = authorUserId ? store.getUserById(authorUserId) : null;
    if (!actor || (actor.role !== 'MAINTENANCE' && actor.role !== 'CEO')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত।' }, { status: 403 });
    }

    const updated = store.updateNotice(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'নোটিশ পাওয়া যায়নি।' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notice: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const actorUserId = searchParams.get('authorUserId');

    const actor = actorUserId ? store.getUserById(actorUserId) : null;
    if (!actor || (actor.role !== 'MAINTENANCE' && actor.role !== 'CEO')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত।' }, { status: 403 });
    }

    if (!id) return NextResponse.json({ success: false, error: 'আইডি আবশ্যক।' }, { status: 400 });

    const deleted = store.deleteNotice(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
