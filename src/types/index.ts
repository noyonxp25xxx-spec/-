export type UserRole = 'CEO' | 'EMPLOYEE' | 'MAINTENANCE' | 'AUDITOR';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface Employee {
  id: string; // Document ID (e.g. EMP-1001)
  userId: string; // Firebase Auth UID
  employeeId: string; // Unique human ID e.g. EMP-2026-001
  name: string;
  email: string;
  phone: string;
  designation: string;
  role: UserRole;
  status: UserStatus;
  joiningDate: string;
  assignedArea?: string;
  totalCollectedPoisha: number;
  totalTransactionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string; // Document ID (e.g. MEM-1001)
  memberId: string; // Human readable e.g. MEM-2026-001
  name: string;
  fatherName?: string;
  motherName?: string;
  phone: string;
  nid?: string;
  address: string;
  joiningDate: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  currentBalancePoisha: number; // Stored in integer poisha (100 poisha = 1 BDT)
  totalDepositedPoisha: number;
  totalWithdrawnPoisha: number;
  registeredByEmployeeId: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT' | 'CORRECTION';

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'BANK_TRANSFER' | 'CHEQUE';

export interface Transaction {
  id: string; // Unique Transaction ID e.g. TXN-20261029-XXXX
  memberId: string; // References Member.id
  memberName: string;
  memberCode: string;
  amountPoisha: number; // Integer Poisha (e.g., 50000 = 500.00 BDT)
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  attachmentUrl?: string;
  submittedByUserId: string;
  submittedByEmployeeName: string;
  submittedAt: string;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  memberId: string;
  type: TransactionType;
  debitPoisha: number; // Money out from society or into member balance
  creditPoisha: number; // Money into society or out from member balance
  balanceAfterPoisha: number; // Resulting member balance in poisha
  timestamp: string;
  approvedByUserId: string;
  description: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  actionType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'EMPLOYEE_CREATED'
    | 'EMPLOYEE_STATUS_CHANGED'
    | 'EMPLOYEE_PASSWORD_RESET'
    | 'MEMBER_CREATED'
    | 'MEMBER_STATUS_CHANGED'
    | 'TRANSACTION_SUBMITTED'
    | 'TRANSACTION_APPROVED'
    | 'TRANSACTION_REJECTED'
    | 'NOTICE_CREATED'
    | 'NOTICE_UPDATED'
    | 'NOTICE_DELETED'
    | 'ACTIVITY_CREATED'
    | 'ACTIVITY_UPDATED'
    | 'ACTIVITY_DELETED'
    | 'HOMEPAGE_SETTINGS_UPDATED'
    | 'REPORT_EXPORTED';
  targetEntity: 'USER' | 'EMPLOYEE' | 'MEMBER' | 'TRANSACTION' | 'NOTICE' | 'ACTIVITY' | 'SETTINGS' | 'REPORT';
  targetId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  outcome: 'SUCCESS' | 'FAILURE';
  reason?: string;
}

export interface PublicNotice {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'FINANCIAL' | 'EMERGENCY' | 'PROGRAM';
  publishedAt: string;
  isPublished: boolean;
  priority: 'NORMAL' | 'HIGH';
  attachmentUrl?: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicActivity {
  id: string;
  title: string;
  description: string;
  category: 'RELIEF' | 'EDUCATION' | 'HEALTH' | 'COMMUNITY' | 'MICROFINANCE';
  imageUrl: string;
  caption?: string;
  date: string;
  location?: string;
  isPublished: boolean;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageSettings {
  id: string;
  orgNameBengali: string;
  orgNameEnglish: string;
  taglineBengali: string;
  heroHeadline: string;
  heroSubtitle: string;
  aboutText: string;
  missionText: string;
  visionText: string;
  objectives: string[];
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  emergencyHotline?: string;
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
  };
  updatedAt: string;
  updatedBy: string;
}
