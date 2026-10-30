import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { Transaction } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const memberIdFilter = searchParams.get('memberId');
    const employeeIdFilter = searchParams.get('employeeId');

    let transactions: Transaction[] = [];

    // 1. Fetch from Firestore
    try {
      let query: FirebaseFirestore.Query = adminDb.collection('transactions');

      if (statusFilter && statusFilter !== 'ALL') {
        query = query.where('status', '==', statusFilter);
      }
      if (memberIdFilter) {
        query = query.where('memberId', '==', memberIdFilter);
      }
      if (employeeIdFilter) {
        query = query.where('submittedByUserId', '==', employeeIdFilter);
      }

      const snap = await query.get();
      if (!snap.empty) {
        transactions = snap.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as Transaction[];
      }
    } catch (dbErr) {
      console.warn('Firestore fetch transactions warning:', dbErr);
    }

    // 2. Merge with store transactions
    const storeTxns = store.getTransactions();
    for (const st of storeTxns) {
      if (!transactions.some((t) => t.id === st.id)) {
        if (!statusFilter || statusFilter === 'ALL' || st.status === statusFilter) {
          if (!memberIdFilter || st.memberId === memberIdFilter) {
            if (!employeeIdFilter || st.submittedByUserId === employeeIdFilter) {
              transactions.push(st);
            }
          }
        }
      }
    }

    // 3. Keep store in sync
    for (const t of transactions) {
      if (!store.getTransactionById(t.id)) {
        store.createTransaction(t);
      }
    }

    // Sort by createdAt descending
    transactions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
      pendingCount: transactions.filter((t) => t.status === 'PENDING').length
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
