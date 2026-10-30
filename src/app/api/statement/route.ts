import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { Member, Transaction } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('nid') || searchParams.get('query') || '').trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'অনুগ্রহ করে জাতীয় পরিচয়পত্র (NID) নম্বর প্রদান করুন।' },
        { status: 400 }
      );
    }

    let member: Member | null = null;

    // 1. Query Firestore members by NID
    try {
      const snap = await adminDb.collection('members').where('nid', '==', query).get();
      if (!snap.empty) {
        const doc = snap.docs[0];
        member = { ...doc.data(), id: doc.id } as Member;
      }
    } catch (dbErr) {
      console.warn('Firestore NID search error:', dbErr);
    }

    // 2. If not found by exact NID, check all Firestore members (case/trim/fallback to memberId or phone)
    if (!member) {
      try {
        const allSnap = await adminDb.collection('members').get();
        for (const doc of allSnap.docs) {
          const d = doc.data() as Member;
          const cleanNid = (d.nid || '').replace(/[\s-]/g, '');
          const cleanQuery = query.replace(/[\s-]/g, '');
          if (
            cleanNid === cleanQuery ||
            (d.memberId && d.memberId.toLowerCase() === query.toLowerCase()) ||
            (d.phone && d.phone.replace(/[\s-]/g, '') === cleanQuery)
          ) {
            member = { ...d, id: doc.id };
            break;
          }
        }
      } catch (err) {
        console.warn('Firestore fallback search error:', err);
      }
    }

    // 3. Fallback to local store
    if (!member) {
      const storeMembers = store.getMembers();
      const cleanQuery = query.replace(/[\s-]/g, '');
      member =
        storeMembers.find((m) => {
          const cleanNid = (m.nid || '').replace(/[\s-]/g, '');
          return (
            cleanNid === cleanQuery ||
            m.memberId.toLowerCase() === query.toLowerCase() ||
            m.phone.replace(/[\s-]/g, '') === cleanQuery
          );
        }) || null;
    }

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: `প্রদত্ত NID "${query}"-এর বিপরীতে কোনো সম্মানিত সদস্যের তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক NID প্রদান করুন।`
        },
        { status: 404 }
      );
    }

    // 4. Fetch transactions for this member
    let memberTransactions: Transaction[] = [];

    try {
      // Check transactions where memberId is member.id or member.memberId
      const tSnap1 = await adminDb.collection('transactions').where('memberId', '==', member.id).get();
      const tSnap2 = await adminDb.collection('transactions').where('memberId', '==', member.memberId).get();

      const map = new Map<string, Transaction>();
      tSnap1.docs.forEach((doc) => map.set(doc.id, { ...doc.data(), id: doc.id } as Transaction));
      tSnap2.docs.forEach((doc) => map.set(doc.id, { ...doc.data(), id: doc.id } as Transaction));

      memberTransactions = Array.from(map.values());
    } catch (tErr) {
      console.warn('Firestore member transactions fetch error:', tErr);
    }

    // Merge with store transactions
    const storeTxns = store.getTransactions().filter(
      (t) => t.memberId === member!.id || t.memberId === member!.memberId || t.memberCode === member!.memberId
    );
    for (const st of storeTxns) {
      if (!memberTransactions.some((t) => t.id === st.id)) {
        memberTransactions.push(st);
      }
    }

    // Keep only APPROVED transactions for the official financial bank statement
    const approvedTxns = memberTransactions.filter((t) => t.status === 'APPROVED');

    // Sort chronologically ascending (earliest to latest) to calculate running balance accurately
    approvedTxns.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    let runningBalance = 0;
    const statementEntries = approvedTxns.map((t, index) => {
      const isDeposit = t.type === 'DEPOSIT';
      if (isDeposit) {
        runningBalance += t.amountPoisha;
      } else {
        runningBalance = Math.max(0, runningBalance - t.amountPoisha);
      }

      return {
        sl: index + 1,
        id: t.id,
        date: t.reviewedAt || t.createdAt,
        type: t.type,
        particulars: isDeposit ? 'সঞ্চয় কিস্তি জমা' : 'সঞ্চয় তহবিল উত্তোলন',
        method: t.paymentMethod === 'CASH' ? 'নগদ' : t.paymentMethod,
        referenceNumber: t.referenceNumber || '',
        debitPoisha: isDeposit ? t.amountPoisha : 0, // In bank statements, Deposit = Credit, Withdrawal = Debit
        creditPoisha: !isDeposit ? t.amountPoisha : 0,
        amountPoisha: t.amountPoisha,
        runningBalancePoisha: runningBalance,
        notes: t.notes || '',
        approvedBy: t.reviewedByUserName || 'প্রধান নির্বাহী কর্মকর্তা (সিইও)'
      };
    });

    // Reverse to show latest first on statement, while keeping running balance consistent
    statementEntries.reverse();

    // Summary calculation
    const totalDepositedPoisha = member.totalDepositedPoisha || runningBalance;
    const totalWithdrawnPoisha = member.totalWithdrawnPoisha || 0;
    const currentBalancePoisha = member.currentBalancePoisha || runningBalance;

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        memberId: member.memberId,
        name: member.name,
        fatherName: member.fatherName || '—',
        motherName: member.motherName || '—',
        nid: member.nid || query,
        phone: member.phone,
        address: member.address,
        joiningDate: member.joiningDate || member.createdAt,
        status: member.status || 'ACTIVE',
        currentBalancePoisha,
        totalDepositedPoisha,
        totalWithdrawnPoisha
      },
      summary: {
        totalDepositedPoisha,
        totalWithdrawnPoisha,
        currentBalancePoisha,
        totalTransactions: statementEntries.length
      },
      statementEntries
    });
  } catch (error: any) {
    console.error('Error generating member statement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'স্টেটমেন্ট তৈরিতে ত্রুটি হয়েছে।' },
      { status: 500 }
    );
  }
}
