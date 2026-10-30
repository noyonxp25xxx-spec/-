import {
  UserProfile,
  Employee,
  Member,
  Transaction,
  LedgerEntry,
  AuditLog,
  PublicNotice,
  PublicActivity,
  HomepageSettings,
  UserRole
} from '@/types';
// Server-side safe storage
const isServer = typeof window === 'undefined';

interface SystemDatabase {
  users: UserProfile[];
  employees: Employee[];
  members: Member[];
  transactions: Transaction[];
  ledgerEntries: LedgerEntry[];
  auditLogs: AuditLog[];
  notices: PublicNotice[];
  activities: PublicActivity[];
  settings: HomepageSettings;
}

const DEFAULT_SETTINGS: HomepageSettings = {
  id: 'main',
  orgNameBengali: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা',
  orgNameEnglish: 'Bhaggo Unnayan Samaj Kalyan Sangstha',
  taglineBengali: 'মানবতার সেবায়, উন্নয়নের প্রত্যয়ে',
  heroHeadline: 'মানবতার সেবায় ও দারিদ্র্য বিমোচনে আমরা অঙ্গীকারবদ্ধ',
  heroSubtitle: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা একটি সামাজিক, আর্থিক ও সেবামূলক সমবায় প্রতিষ্ঠান। আমরা সুবিধাবঞ্চিত মানুষের আত্মনির্ভরশীলতা ও সঞ্চয়ী মনোভাব গড়ে তুলতে কাজ করে যাচ্ছি।',
  aboutText: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা প্রান্তিক ও সুবিধাবঞ্চিত জনগোষ্ঠীর জীবনমান উন্নয়ন, ক্ষুদ্র সঞ্চয় বৃদ্ধি, কারিগরি প্রশিক্ষণ এবং জরুরী মানবিক সেবাদানের লক্ষ্যে প্রতিষ্ঠিত একটি আদর্শ সমবায় সংগঠন।',
  missionText: 'প্রান্তিক মানুষের অর্থনৈতিক সক্ষমতা বৃদ্ধি, দারিদ্র্য বিমোচন এবং ন্যায়ভিত্তিক সমাজ গঠনে সার্বিক সহায়তা প্রদান।',
  visionText: 'একটি আত্মনির্ভরশীল, দারিদ্র্যমুক্ত ও বৈষম্যহীন উন্নত সমাজ বিনির্মাণ।',
  objectives: [
    'সদস্যদের মাঝে সঞ্চয়ী মনোভাব ও ক্ষুদ্র আর্থিক শৃঙ্খলা গড়ে তোলা',
    'দুস্থ ও দুর্যোগপীড়িত জনগোষ্ঠীর মাঝে মানবিক ও জরুরী ত্রাণ সহায়তা',
    'যুবসমাজ ও মহিলাদের জন্য বৃত্তিমূলক ও কারিগরি প্রশিক্ষণ',
    'স্বাস্থ্য সচেতনতা এবং শিক্ষা বিস্তার প্রকল্প পরিচালনা'
  ],
  contactPhone: '+880 1712-345678',
  contactEmail: 'contact@bhaggounnayan.org',
  contactAddress: 'প্রধান কার্যালয়: ভবন-৪, মেইন রোড, সদর, বাংলাদেশ',
  emergencyHotline: '+880 1999-000111',
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    whatsapp: 'https://wa.me/8801712345678'
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'SYSTEM'
};

const INITIAL_DATA: SystemDatabase = {
  users: [
    {
      uid: 'ceo-user-01706338181',
      email: '01706338181@bhaggounnayan.org',
      displayName: 'প্রধান প্রশাসক ও সিইও',
      role: 'CEO',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      phoneNumber: '01706338181',
      password: '805222'
    }
  ],
  employees: [],
  members: [],
  transactions: [],
  ledgerEntries: [],
  auditLogs: [],
  notices: [
    {
      id: 'NOTICE-001',
      title: '২০২৬ সালের বার্ষিক সাধারণ সভা ও সদস্য সমাবেশ সংক্রান্ত নোটিশ',
      content: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থার সকল সম্মানিত সদস্য ও শুভানুধ্যায়ীদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ২৫ নভেম্বর ২০২৬ তারিখে সংস্থার কেন্দ্রীয় অডিটোরিয়ামে বার্ষিক সাধারণ সভা অনুষ্ঠিত হবে। সকল সদস্যকে যথাসময়ে উপস্থিত থাকার অনুরোধ করা হচ্ছে।',
      category: 'GENERAL',
      publishedAt: '2026-10-20',
      isPublished: true,
      priority: 'HIGH',
      authorName: 'কার্যনির্বাহী পরিষদ',
      authorId: 'ceo-user-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'NOTICE-002',
      title: 'শীতবস্ত্র বিতরণ ও ফ্রি মেডিকেল ক্যাম্প কর্মসূচি উদ্বোধন',
      content: 'মানবতার সেবায় ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থার পক্ষ থেকে আগামী সপ্তাহে চরাঞ্চলের অসহায় শীতার্ত মানুষের মাঝে শীতবস্ত্র ও বিনামূল্যে ঔষধ বিতরণ করা হবে। সদস্যদের সহযোগিতা একান্ত কাম্য।',
      category: 'PROGRAM',
      publishedAt: '2026-10-25',
      isPublished: true,
      priority: 'NORMAL',
      authorName: 'ত্রাণ ও সেবা উপ-কমিটি',
      authorId: 'ceo-user-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  activities: [
    {
      id: 'ACT-001',
      title: 'বন্যার্ত ও দুর্যোগপীড়িত মানুষের মাঝে জরুরী খাদ্য সামগ্রী ও বিশুদ্ধ পানি বিতরণ',
      description: 'সংস্থার নিজস্ব তহবিল ও শুভানুধ্যায়ীদের সহযোগিতায় দুর্গম চরাঞ্চলের ৩০০টি পরিবারের মাঝে চাউল, ডাল, তেল ও খাবার স্যালাইন বিতরণ করা হয়।',
      category: 'RELIEF',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
      caption: 'ত্রাণ বিতরণ কার্যক্রমে সংস্থার স্বেচ্ছাসেবক ও কর্মীবৃন্দ',
      date: '2026-09-12',
      location: 'চরাঞ্চল ইউনিয়ন',
      isPublished: true,
      authorName: 'মাঠ সমন্বয়কারী',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ACT-002',
      title: 'মহিলাদের আত্মকর্মসংস্থান সৃষ্টির লক্ষ্যে বিনামূল্যে সেলাই প্রশিক্ষণ কর্মশালা',
      description: 'প্রান্তিক নারীদের অর্থনৈতিকভাবে স্বাবলম্বী করে গড়ে তুলতে ২ মাসব্যাপী দর্জি বিজ্ঞান ও হস্তশিল্প প্রশিক্ষণ সফলভাবে সম্পন্ন হয়েছে।',
      category: 'EDUCATION',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop',
      caption: 'সেলাই প্রশিক্ষণ সমাপনী অনুষ্ঠানে সফল প্রশিক্ষণার্থীদের মাঝে সনদ প্রদান',
      date: '2026-08-20',
      location: 'সংস্থা প্রশিক্ষণ কেন্দ্র',
      isPublished: true,
      authorName: 'প্রশিক্ষণ সমন্বয়ক',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ACT-003',
      title: 'পরিবেশ সুরক্ষায় ফলজ ও বনজ বৃক্ষরোপণ কর্মসূচি ২০২৬',
      description: 'সবুজ বাংলাদেশ গড়ার প্রত্যয়ে স্থানীয় শিক্ষা প্রতিষ্ঠান ও সড়ক প্রাঙ্গণে সহস্রাধিক ফলজ ও ঔষধি গাছের চারা রোপণ করা হয়।',
      category: 'COMMUNITY',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
      caption: 'বৃক্ষরোপণ কর্মসূচি উদ্বোধন করছেন সংস্থার সম্মানিত সভাপতি ও সাধারণ সম্পাদক',
      date: '2026-07-15',
      location: 'উপজেলা চত্বর',
      isPublished: true,
      authorName: 'পরিবেশ সেল',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  settings: DEFAULT_SETTINGS
};

// Data Store Access Helper
class StoreManager {
  private memoryData: SystemDatabase | null = null;

  private load(): SystemDatabase {
    if (this.memoryData) return this.memoryData;

    if (isServer) {
      try {
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(process.cwd(), '.local-data.json');
        if (fs.existsSync(dataPath)) {
          const raw = fs.readFileSync(dataPath, 'utf-8');
          this.memoryData = JSON.parse(raw);
          return this.memoryData!;
        }
      } catch {
        // Fallback
      }
    }

    this.memoryData = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save();
    return this.memoryData!;
  }

  private save(_collectionHint?: string, _docId?: string, _docData?: any): void {
    if (!this.memoryData) return;
    if (isServer) {
      try {
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(process.cwd(), '.local-data.json');
        fs.writeFileSync(dataPath, JSON.stringify(this.memoryData, null, 2), 'utf-8');
      } catch {
        // Silent
      }
    }
  }

  // --- Users ---
  getUsers(): UserProfile[] {
    return this.load().users;
  }

  getUserByEmail(email: string): UserProfile | undefined {
    return this.load().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(uid: string): UserProfile | undefined {
    return this.load().users.find((u) => u.uid === uid);
  }

  getUserByIdentifier(identifier: string): UserProfile | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = clean.replace(/[^0-9]/g, '');

    return this.load().users.find((u) => {
      // 1. Direct match on email
      if (u.email && u.email.toLowerCase() === clean) return true;
      // 2. Direct match on uid
      if (u.uid === clean) return true;
      // 3. Match on phone number
      if (u.phoneNumber) {
        const uPhone = u.phoneNumber.replace(/[^0-9]/g, '');
        if (uPhone === cleanPhone || u.phoneNumber === clean) return true;
        // Also match without country code prefix (e.g. 01706338181 vs 8801706338181)
        if (cleanPhone.length >= 10 && (uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone))) {
          return true;
        }
      }
      return false;
    });
  }

  createUser(user: UserProfile): UserProfile {
    const data = this.load();
    data.users.push(user);
    this.save('users', user.uid, user);
    return user;
  }

  updateUser(uid: string, updates: Partial<UserProfile>): UserProfile | null {
    const data = this.load();
    const idx = data.users.findIndex((u) => u.uid === uid);
    if (idx === -1) return null;
    data.users[idx] = { ...data.users[idx], ...updates };
    this.save('users', uid, data.users[idx]);
    return data.users[idx];
  }

  deleteUser(uid: string): boolean {
    const data = this.load();
    const target = data.users.find((u) => u.uid === uid);
    if (!target) return false;
    // Protect primary main admin
    if (target.phoneNumber === '01706338181') return false;

    data.users = data.users.filter((u) => u.uid !== uid);
    // Also remove associated employee record if any
    data.employees = data.employees.filter((e) => e.userId !== uid);
    this.save();
    return true;
  }

  // --- Employees ---
  getEmployees(): Employee[] {
    return this.load().employees;
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.load().employees.find((e) => e.id === id || e.employeeId === id);
  }

  getEmployeeByUserId(userId: string): Employee | undefined {
    return this.load().employees.find((e) => e.userId === userId);
  }

  createEmployee(employee: Employee): Employee {
    const data = this.load();
    data.employees.push(employee);
    this.save();
    return employee;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const data = this.load();
    const idx = data.employees.findIndex((e) => e.id === id || e.employeeId === id);
    if (idx === -1) return null;
    data.employees[idx] = { ...data.employees[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return data.employees[idx];
  }

  // --- Members ---
  getMembers(): Member[] {
    return this.load().members;
  }

  getMemberById(id: string): Member | undefined {
    return this.load().members.find((m) => m.id === id || m.memberId === id);
  }

  createMember(member: Member): Member {
    const data = this.load();
    data.members.push(member);
    this.save('members', member.id, member);
    return member;
  }

  updateMember(id: string, updates: Partial<Member>): Member | null {
    const data = this.load();
    const idx = data.members.findIndex((m) => m.id === id || m.memberId === id);
    if (idx === -1) return null;
    data.members[idx] = { ...data.members[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save('members', data.members[idx].id, data.members[idx]);
    return data.members[idx];
  }

  deleteMember(id: string): boolean {
    const data = this.load();
    const idx = data.members.findIndex((m) => m.id === id || m.memberId === id);
    if (idx === -1) return false;
    data.members.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Transactions & Ledger ---
  getTransactions(): Transaction[] {
    return this.load().transactions;
  }

  deleteTransaction(id: string): boolean {
    const data = this.load();
    const idx = data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    data.transactions.splice(idx, 1);
    this.save();
    return true;
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.load().transactions.find((t) => t.id === id);
  }

  createTransaction(txn: Transaction): Transaction {
    const data = this.load();
    // Verify idempotency
    const existing = data.transactions.find((t) => t.idempotencyKey === txn.idempotencyKey);
    if (existing) {
      return existing;
    }
    data.transactions.unshift(txn);
    this.save('transactions', txn.id, txn);
    return txn;
  }

  // Financial Approval Logic: Server-side atomic balance update and ledger entry creation
  approveTransaction(
    txnId: string,
    reviewedByUserId: string,
    reviewedByUserName: string
  ): { success: boolean; error?: string; transaction?: Transaction } {
    const data = this.load();
    const txn = data.transactions.find((t) => t.id === txnId);

    if (!txn) {
      return { success: false, error: 'লেনদেনটি খুঁজে পাওয়া যায়নি।' };
    }

    if (txn.status !== 'PENDING') {
      return {
        success: false,
        error: `এই লেনদেনটি ইতোমধ্যে '${txn.status === 'APPROVED' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}' করা হয়েছে। দ্বৈত অনুমোদন সম্ভব নয়।`
      };
    }

    const member = data.members.find((m) => m.id === txn.memberId || m.memberId === txn.memberId);
    if (!member) {
      return { success: false, error: 'সংশ্লিষ্ট সদস্যের একাউন্ট পাওয়া যায়নি।' };
    }

    // Balance check for withdrawal
    if (txn.type === 'WITHDRAWAL') {
      if (member.currentBalancePoisha < txn.amountPoisha) {
        return {
          success: false,
          error: `সদস্যের তহবিলে পর্যাপ্ত ব্যালেন্স নেই। বর্তমান ব্যালেন্স: ৳${(member.currentBalancePoisha / 100).toFixed(2)}, উত্তোলনের আবেদন: ৳${(txn.amountPoisha / 100).toFixed(2)}`
        };
      }
    }

    const now = new Date().toISOString();

    // 1. Mark transaction as APPROVED
    txn.status = 'APPROVED';
    txn.reviewedByUserId = reviewedByUserId;
    txn.reviewedByUserName = reviewedByUserName;
    txn.reviewedAt = now;
    txn.updatedAt = now;

    // 2. Calculate balance changes
    let balanceChange = 0;
    if (txn.type === 'DEPOSIT' || txn.type === 'ADJUSTMENT') {
      balanceChange = txn.amountPoisha;
      member.totalDepositedPoisha += txn.amountPoisha;
    } else if (txn.type === 'WITHDRAWAL' || txn.type === 'CORRECTION') {
      balanceChange = -txn.amountPoisha;
      member.totalWithdrawnPoisha += txn.amountPoisha;
    }

    member.currentBalancePoisha += balanceChange;
    member.updatedAt = now;

    // 3. Create immutable ledger record
    const ledgerEntry: LedgerEntry = {
      id: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      transactionId: txn.id,
      memberId: member.id,
      type: txn.type,
      debitPoisha: balanceChange > 0 ? txn.amountPoisha : 0,
      creditPoisha: balanceChange < 0 ? txn.amountPoisha : 0,
      balanceAfterPoisha: member.currentBalancePoisha,
      timestamp: now,
      approvedByUserId: reviewedByUserId,
      description: `অনুমোদিত লেনদেন: ${txn.notes || 'নিয়মিত লেনদেন'}`
    };

    data.ledgerEntries.unshift(ledgerEntry);

    // 4. Update employee collection stats if deposit
    if (txn.type === 'DEPOSIT') {
      const emp = data.employees.find((e) => e.userId === txn.submittedByUserId);
      if (emp) {
        emp.totalCollectedPoisha += txn.amountPoisha;
        emp.totalTransactionsCount += 1;
        emp.updatedAt = now;
      }
    }

    this.save();

    // 5. Create audit log
    this.createAuditLog({
      id: `AUDIT-${Date.now()}`,
      actorUserId: reviewedByUserId,
      actorName: reviewedByUserName,
      actorRole: 'CEO',
      actionType: 'TRANSACTION_APPROVED',
      targetEntity: 'TRANSACTION',
      targetId: txn.id,
      timestamp: now,
      outcome: 'SUCCESS',
      metadata: {
        amountPoisha: txn.amountPoisha,
        memberId: member.id,
        newBalancePoisha: member.currentBalancePoisha
      },
      reason: 'সিইও মহোদয় কর্তৃক লেনদেন ও ব্যালেন্স অনুমোদন সম্পন্ন'
    });

    return { success: true, transaction: txn };
  }

  // Reject transaction with mandatory reason
  rejectTransaction(
    txnId: string,
    reviewedByUserId: string,
    reviewedByUserName: string,
    rejectionReason: string
  ): { success: boolean; error?: string; transaction?: Transaction } {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return { success: false, error: 'প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।' };
    }

    const data = this.load();
    const txn = data.transactions.find((t) => t.id === txnId);

    if (!txn) {
      return { success: false, error: 'লেনদেনটি খুঁজে পাওয়া যায়নি।' };
    }

    if (txn.status !== 'PENDING') {
      return {
        success: false,
        error: `এই লেনদেনটি ইতোমধ্যে '${txn.status === 'APPROVED' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}' করা হয়েছে।`
      };
    }

    const now = new Date().toISOString();
    txn.status = 'REJECTED';
    txn.reviewedByUserId = reviewedByUserId;
    txn.reviewedByUserName = reviewedByUserName;
    txn.reviewedAt = now;
    txn.rejectionReason = rejectionReason;
    txn.updatedAt = now;

    this.save();

    // Audit log
    this.createAuditLog({
      id: `AUDIT-${Date.now()}`,
      actorUserId: reviewedByUserId,
      actorName: reviewedByUserName,
      actorRole: 'CEO',
      actionType: 'TRANSACTION_REJECTED',
      targetEntity: 'TRANSACTION',
      targetId: txn.id,
      timestamp: now,
      outcome: 'SUCCESS',
      reason: rejectionReason,
      metadata: {
        amountPoisha: txn.amountPoisha,
        memberId: txn.memberId
      }
    });

    return { success: true, transaction: txn };
  }

  getLedgerEntries(): LedgerEntry[] {
    return this.load().ledgerEntries;
  }

  getLedgerEntriesByMemberId(memberId: string): LedgerEntry[] {
    return this.load().ledgerEntries.filter((l) => l.memberId === memberId);
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.load().auditLogs;
  }

  createAuditLog(log: AuditLog): AuditLog {
    const data = this.load();
    data.auditLogs.unshift(log);
    this.save();
    return log;
  }

  // --- Public Notices ---
  getNotices(): PublicNotice[] {
    return this.load().notices;
  }

  createNotice(notice: PublicNotice): PublicNotice {
    const data = this.load();
    data.notices.unshift(notice);
    this.save();
    return notice;
  }

  updateNotice(id: string, updates: Partial<PublicNotice>): PublicNotice | null {
    const data = this.load();
    const idx = data.notices.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    data.notices[idx] = { ...data.notices[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return data.notices[idx];
  }

  deleteNotice(id: string): boolean {
    const data = this.load();
    const idx = data.notices.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    data.notices.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Public Activities ---
  getActivities(): PublicActivity[] {
    return this.load().activities;
  }

  createActivity(act: PublicActivity): PublicActivity {
    const data = this.load();
    data.activities.unshift(act);
    this.save();
    return act;
  }

  updateActivity(id: string, updates: Partial<PublicActivity>): PublicActivity | null {
    const data = this.load();
    const idx = data.activities.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    data.activities[idx] = { ...data.activities[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return data.activities[idx];
  }

  deleteActivity(id: string): boolean {
    const data = this.load();
    const idx = data.activities.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    data.activities.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Settings ---
  getSettings(): HomepageSettings {
    return this.load().settings;
  }

  updateSettings(settings: Partial<HomepageSettings>, updatedBy: string): HomepageSettings {
    const data = this.load();
    data.settings = {
      ...data.settings,
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    this.save();
    return data.settings;
  }
}

export const store = new StoreManager();
