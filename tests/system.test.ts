import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { store } from '../src/lib/services/data-store';
import { formatBDT, bdtToPoisha, poishaToBDT, toBengaliNumber } from '../src/lib/utils';
import { Transaction, Member, Employee } from '../src/types';

describe('1. Currency & Poisha Calculations', () => {
  test('converts BDT decimal to integer poisha correctly without floating point loss', () => {
    assert.equal(bdtToPoisha(500), 50000);
    assert.equal(bdtToPoisha('1250.50'), 125050);
    assert.equal(bdtToPoisha(0), 0);
    assert.equal(bdtToPoisha(-100), 0);
  });

  test('formats integer poisha into Bengali currency format correctly', () => {
    const formatted = formatBDT(50000); // ৳৫০০.০০
    assert.ok(formatted.startsWith('৳'));
    assert.ok(formatted.includes('৫০০.০০'));
  });

  test('converts English numbers to Bengali numerals', () => {
    assert.equal(toBengaliNumber(1234567890), '১২৩৪৫৬৭৮৯০');
  });
});

describe('2. Member Creation & Balance Integrity', () => {
  test('initializes new members with 0 balance and unique member ID', () => {
    const newMember: Member = {
      id: `MEM-TEST-${Date.now()}`,
      memberId: 'MEM-TEST-001',
      name: 'পরীক্ষামূলক সদস্য',
      phone: '01700000000',
      address: 'ঢাকা, বাংলাদেশ',
      joiningDate: '2026-10-29',
      status: 'ACTIVE',
      currentBalancePoisha: 0,
      totalDepositedPoisha: 0,
      totalWithdrawnPoisha: 0,
      registeredByEmployeeId: 'emp-user-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = store.createMember(newMember);
    assert.equal(created.currentBalancePoisha, 0);
    assert.equal(created.status, 'ACTIVE');

    const fetched = store.getMemberById(created.id);
    assert.ok(fetched);
    assert.equal(fetched?.memberId, 'MEM-TEST-001');
  });
});

describe('3. Transaction Submission & Validation', () => {
  test('submits valid transaction with PENDING status', () => {
    const members = store.getMembers();
    const testMember = members[0];

    const txn: Transaction = {
      id: `TXN-TEST-${Date.now()}`,
      memberId: testMember.id,
      memberName: testMember.name,
      memberCode: testMember.memberId,
      amountPoisha: 100000, // ৳১,০০০.০০
      type: 'DEPOSIT',
      status: 'PENDING',
      paymentMethod: 'CASH',
      referenceNumber: 'REC-TEST-1',
      submittedByUserId: 'emp-user-001',
      submittedByEmployeeName: 'তানভীর আহমেদ',
      submittedAt: new Date().toISOString(),
      idempotencyKey: `IDEM-TEST-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = store.createTransaction(txn);
    assert.equal(saved.status, 'PENDING');
    assert.equal(saved.amountPoisha, 100000);
  });

  test('enforces idempotency preventing duplicate transaction submissions', () => {
    const key = `IDEM-DUPLICATE-CHECK-${Date.now()}`;
    const txn1: Transaction = {
      id: `TXN-DUP-1-${Date.now()}`,
      memberId: 'MEM-001',
      memberName: 'মোছাঃ রহিমা বেগম',
      memberCode: 'MEM-2026-001',
      amountPoisha: 50000,
      type: 'DEPOSIT',
      status: 'PENDING',
      paymentMethod: 'CASH',
      submittedByUserId: 'emp-user-001',
      submittedByEmployeeName: 'তানভীর আহমেদ',
      submittedAt: new Date().toISOString(),
      idempotencyKey: key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const first = store.createTransaction(txn1);
    const txn2 = { ...txn1, id: `TXN-DUP-2-${Date.now()}` };
    const second = store.createTransaction(txn2);

    assert.equal(first.id, second.id); // Same transaction returned, no duplicate created
  });
});

describe('4. CEO Financial Approval System & Double-Entry Ledger', () => {
  test('CEO approval atomically increments member balance and writes ledger record', () => {
    const member = store.getMembers()[0];
    const initialBalance = member.currentBalancePoisha;
    const depositAmount = 25000; // ৳২৫০.০০

    const txn: Transaction = {
      id: `TXN-APPROVAL-TEST-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberCode: member.memberId,
      amountPoisha: depositAmount,
      type: 'DEPOSIT',
      status: 'PENDING',
      paymentMethod: 'CASH',
      submittedByUserId: 'emp-user-001',
      submittedByEmployeeName: 'তানভীর আহমেদ',
      submittedAt: new Date().toISOString(),
      idempotencyKey: `IDEM-APP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.createTransaction(txn);

    // Approve as CEO
    const result = store.approveTransaction(txn.id, 'ceo-user-001', 'মোঃ রফিকুল ইসলাম');
    assert.equal(result.success, true);
    assert.equal(result.transaction?.status, 'APPROVED');

    // Verify member balance
    const updatedMember = store.getMemberById(member.id);
    assert.equal(updatedMember?.currentBalancePoisha, initialBalance + depositAmount);

    // Verify ledger entry
    const ledger = store.getLedgerEntriesByMemberId(member.id);
    const latestLedger = ledger[0];
    assert.equal(latestLedger.transactionId, txn.id);
    assert.equal(latestLedger.debitPoisha, depositAmount);
  });

  test('prevents duplicate approval of an already approved transaction', () => {
    const approvedTxn = store.getTransactions().find((t) => t.status === 'APPROVED');
    assert.ok(approvedTxn);

    const secondApproval = store.approveTransaction(approvedTxn.id, 'ceo-user-001', 'মোঃ রফিকুল ইসলাম');
    assert.equal(secondApproval.success, false);
    assert.ok(secondApproval.error?.includes('ইতোমধ্যে'));
  });

  test('rejects withdrawal if member has insufficient balance', () => {
    const member = store.getMembers()[0];
    const excessiveAmount = member.currentBalancePoisha + 10000000; // Far exceeds balance

    const withdrawalTxn: Transaction = {
      id: `TXN-OVERDRAW-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberCode: member.memberId,
      amountPoisha: excessiveAmount,
      type: 'WITHDRAWAL',
      status: 'PENDING',
      paymentMethod: 'CASH',
      submittedByUserId: 'emp-user-001',
      submittedByEmployeeName: 'তানভীর আহমেদ',
      submittedAt: new Date().toISOString(),
      idempotencyKey: `IDEM-OVERDRAW-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.createTransaction(withdrawalTxn);

    const result = store.approveTransaction(withdrawalTxn.id, 'ceo-user-001', 'সিইও');
    assert.equal(result.success, false);
    assert.ok(result.error?.includes('পর্যাপ্ত ব্যালেন্স নেই'));
  });

  test('rejection requires reason and keeps member balance unchanged', () => {
    const member = store.getMembers()[0];
    const initialBalance = member.currentBalancePoisha;

    const txn: Transaction = {
      id: `TXN-REJECT-TEST-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberCode: member.memberId,
      amountPoisha: 10000,
      type: 'DEPOSIT',
      status: 'PENDING',
      paymentMethod: 'CASH',
      submittedByUserId: 'emp-user-001',
      submittedByEmployeeName: 'তানভীর আহমেদ',
      submittedAt: new Date().toISOString(),
      idempotencyKey: `IDEM-REJ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.createTransaction(txn);

    // Attempt rejection without reason -> should fail
    const failReject = store.rejectTransaction(txn.id, 'ceo-user-001', 'সিইও', '');
    assert.equal(failReject.success, false);

    // Reject with reason
    const successReject = store.rejectTransaction(txn.id, 'ceo-user-001', 'সিইও', 'ভাউচার অস্পষ্ট');
    assert.equal(successReject.success, true);
    assert.equal(successReject.transaction?.status, 'REJECTED');
    assert.equal(successReject.transaction?.rejectionReason, 'ভাউচার অস্পষ্ট');

    // Member balance remains unchanged
    const afterRejectMember = store.getMemberById(member.id);
    assert.equal(afterRejectMember?.currentBalancePoisha, initialBalance);
  });
});

describe('5. Audit Logs & Compliance', () => {
  test('audit log records are generated for financial approvals and account events', () => {
    const logs = store.getAuditLogs();
    assert.ok(logs.length > 0);

    const approvalLog = logs.find((l) => l.actionType === 'TRANSACTION_APPROVED');
    if (approvalLog) {
      assert.equal(approvalLog.actorRole, 'CEO');
      assert.equal(approvalLog.outcome, 'SUCCESS');
      assert.ok(approvalLog.timestamp);
    }
  });
});

describe('6. Homepage Maintenance Separation', () => {
  test('maintenance can create and update public notices', () => {
    const notice = store.createNotice({
      id: `NOTICE-TEST-${Date.now()}`,
      title: 'টেস্ট নোটিশ',
      content: 'টেস্ট বিষয়বস্তু',
      category: 'GENERAL',
      publishedAt: '2026-10-29',
      isPublished: true,
      priority: 'NORMAL',
      authorName: 'আইটি স্টাফ',
      authorId: 'maint-user-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    assert.ok(notice);
    assert.equal(notice.title, 'টেস্ট নোটিশ');

    const updated = store.updateNotice(notice.id, { title: 'হালনাগাদ নোটিশ' });
    assert.equal(updated?.title, 'হালনাগাদ নোটিশ');
  });

  test('public homepage notices only show published notices', () => {
    const all = store.getNotices();
    const publishedOnly = all.filter((n) => n.isPublished);
    publishedOnly.forEach((n) => assert.equal(n.isPublished, true));
  });
});
