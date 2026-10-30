import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/services/data-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userUid = searchParams.get('userUid');

  const user = userUid ? store.getUserById(userUid) : null;
  if (!user || user.role !== 'CEO') {
    return NextResponse.json({ success: false, error: 'শুধুমাত্র সিইও অডিট লগ দেখতে পারেন।' }, { status: 403 });
  }

  const logs = store.getAuditLogs();
  return NextResponse.json({ success: true, logs });
}
