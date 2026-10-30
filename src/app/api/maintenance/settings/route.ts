import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/services/data-store';

export async function GET() {
  const settings = store.getSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates, authorUserId } = body;

    const actor = authorUserId ? store.getUserById(authorUserId) : null;
    if (!actor || (actor.role !== 'MAINTENANCE' && actor.role !== 'CEO')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত।' }, { status: 403 });
    }

    const updated = store.updateSettings(updates, actor.displayName);

    store.createAuditLog({
      id: `AUDIT-SETTINGS-${Date.now()}`,
      actorUserId: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      actionType: 'HOMEPAGE_SETTINGS_UPDATED',
      targetEntity: 'SETTINGS',
      targetId: 'main',
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS',
      reason: 'ওয়েবসাইটের সাধারণ সেটিংস হালনাগাদ করা হয়েছে'
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
