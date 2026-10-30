import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { store } from '@/lib/services/data-store';
import { cookies } from 'next/headers';
import { UserRole, UserProfile, Employee } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('bhaggo_session_token')?.value ||
                         cookies().get('bhaggo_session_token')?.value ||
                         req.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'অনুগ্রহ করে প্রথমে লগইন করুন।' }, { status: 401 });
    }

    let currentUser = store.getUserById(sessionToken);
    if (!currentUser) {
      try {
        const uDoc = await adminDb.collection('users').doc(sessionToken).get();
        if (uDoc.exists) {
          currentUser = uDoc.data() as UserProfile;
        }
      } catch {
        // Fallback
      }
    }

    const isCEO = currentUser?.role === 'CEO' || currentUser?.phoneNumber === '01706338181' || sessionToken === 'ceo-user-01706338181';
    if (!isCEO) {
      return NextResponse.json({ success: false, error: 'শুধুমাত্র প্রধান সিইও/অ্যাডমিন নতুন অ্যাকাউন্ট তৈরি করতে পারেন।' }, { status: 403 });
    }

    const body = await req.json();
    const { role, name, phone, email, password, designation, assignedArea } = body;

    if (!role || !['CEO', 'EMPLOYEE', 'MAINTENANCE'].includes(role)) {
      return NextResponse.json({ success: false, error: 'সঠিক অ্যাকাউন্টের ধরণ (রোল) নির্বাচন করুন।' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'ব্যবহারকারীর পুরো নাম প্রদান করুন।' }, { status: 400 });
    }

    const cleanPhone = (phone || '').toString().trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 6) {
      return NextResponse.json({ success: false, error: 'সঠিক ইউজার আইডি বা মোবাইল নম্বর প্রদান করুন।' }, { status: 400 });
    }

    if (!password || password.toString().trim().length < 4) {
      return NextResponse.json({ success: false, error: 'পাসওয়ার্ড সর্বনিম্ন ৪ অক্ষরের হতে হবে।' }, { status: 400 });
    }

    // Check existing phone/id in store & Firestore
    const existingById = store.getUserByIdentifier(cleanPhone);
    if (existingById) {
      return NextResponse.json({ success: false, error: 'এই মোবাইল নম্বর বা আইডি দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট বিদ্যমান।' }, { status: 400 });
    }

    try {
      const snapPhone = await adminDb.collection('users').where('phoneNumber', '==', cleanPhone).limit(1).get();
      if (!snapPhone.empty) {
        return NextResponse.json({ success: false, error: 'এই মোবাইল নম্বর বা আইডি ডাটাবেজে ইতোমধ্যে বিদ্যমান।' }, { status: 400 });
      }
    } catch (checkErr) {
      console.warn('Firestore existence check error:', checkErr);
    }

    const finalEmail = (email && email.trim()) ? email.trim().toLowerCase() : `${cleanPhone}@bhaggounnayan.org`;
    const existingByEmail = store.getUserByEmail(finalEmail);
    if (existingByEmail) {
      return NextResponse.json({ success: false, error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে।' }, { status: 400 });
    }

    const uid = `${role.toLowerCase()}-${cleanPhone}`;
    const newUser: UserProfile = {
      uid,
      displayName: name.trim(),
      phoneNumber: cleanPhone,
      email: finalEmail,
      password: password.toString().trim(),
      role: role as UserRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // 1. SAVE TO FIRESTORE DATABASE (users collection)
    try {
      await adminDb.collection('users').doc(newUser.uid).set(newUser);
    } catch (dbErr: any) {
      console.error('Firestore save user error:', dbErr);
      return NextResponse.json(
        { success: false, error: `ডাটাবেজে ব্যবহারকারী সংরক্ষণ করতে ব্যর্থ: ${dbErr.message}` },
        { status: 500 }
      );
    }

    // 2. If role is employee, also register in Firestore employees collection
    if (role === 'EMPLOYEE') {
      const empCount = store.getEmployees().length + 1;
      const empId = `EMP-${new Date().getFullYear()}-${String(empCount).padStart(3, '0')}`;
      const newEmp: Employee = {
        id: `emp-${cleanPhone}`,
        userId: uid,
        employeeId: empId,
        name: name.trim(),
        email: finalEmail,
        phone: cleanPhone,
        designation: designation || 'ফিল্ড অফিসার (মাঠ কর্মী)',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        joiningDate: new Date().toISOString().split('T')[0],
        assignedArea: assignedArea || 'সাধারণ কালেকশন জোন',
        totalCollectedPoisha: 0,
        totalTransactionsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await adminDb.collection('employees').doc(newEmp.id).set(newEmp);
      } catch (empErr) {
        console.warn('Firestore save employee error:', empErr);
      }
      store.createEmployee(newEmp);
    }

    // 3. Save to local store
    store.createUser(newUser);

    // 4. Create and save Audit Log
    const auditLog = {
      id: `AUDIT-ACC-NEW-${Date.now()}`,
      actorUserId: currentUser?.uid || sessionToken,
      actorName: currentUser?.displayName || 'প্রধান প্রশাসক',
      actorRole: currentUser?.role || 'CEO',
      actionType: 'EMPLOYEE_CREATED' as const,
      targetEntity: 'USER' as const,
      targetId: uid,
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS' as const,
      reason: `প্রধান অ্যাডমিন নতুন ${role} অ্যাকাউন্ট তৈরি করেছেন (আইডি: ${cleanPhone}, নাম: ${name})`
    };

    try {
      await adminDb.collection('auditLogs').doc(auditLog.id).set(auditLog);
    } catch {
      // Non-fatal
    }
    store.createAuditLog(auditLog);

    return NextResponse.json({
      success: true,
      message: `নতুন ${role === 'CEO' ? 'অ্যাডমিন' : role === 'EMPLOYEE' ? 'কর্মী' : 'আইটি'} অ্যাকাউন্ট (${name} - ${cleanPhone}) সফলভাবে ডাটাবেজে তৈরি ও সক্রিয় করা হয়েছে।`,
      user: {
        uid: newUser.uid,
        displayName: newUser.displayName,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
