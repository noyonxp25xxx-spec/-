import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/services/data-store';
import { UserStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, newStatus, creatorUid } = body;

    const creator = creatorUid ? store.getUserById(creatorUid) : null;
    if (!creator || creator.role !== 'CEO') {
      return NextResponse.json(
        { success: false, error: 'শুধুমাত্র সিইও মহোদয় কর্মীর স্ট্যাটাস পরিবর্তন করতে পারেন।' },
        { status: 403 }
      );
    }

    const employee = store.getEmployeeById(employeeId);
    if (!employee) {
      return NextResponse.json({ success: false, error: 'কর্মী খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    const validStatuses: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'REVOKED'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ success: false, error: 'অকার্যকর স্ট্যাটাস।' }, { status: 400 });
    }

    store.updateEmployee(employee.id, { status: newStatus });
    store.updateUser(employee.userId, { status: newStatus });

    store.createAuditLog({
      id: `AUDIT-STATUS-${Date.now()}`,
      actorUserId: creator.uid,
      actorName: creator.displayName,
      actorRole: 'CEO',
      actionType: 'EMPLOYEE_STATUS_CHANGED',
      targetEntity: 'EMPLOYEE',
      targetId: employee.employeeId,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS',
      metadata: { previousStatus: employee.status, newStatus },
      reason: `কর্মীর কার্যকাল স্ট্যাটাস '${newStatus}' এ পরিবর্তন করা হয়েছে`
    });

    return NextResponse.json({
      success: true,
      message: `কর্মীর স্ট্যাটাস সফলভাবে '${newStatus}' করা হয়েছে।`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
