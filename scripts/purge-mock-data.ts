import fs from 'fs';
import * as admin from 'firebase-admin';

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
const lines = envContent.split(/\r?\n/);
const env: Record<string, string> = {};
let currentKey = '';
let currentValue = '';
let inMulti = false;

for (const line of lines) {
  if (!inMulti) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) {
      const key = match[1];
      let val = match[2].trim();
      if (val.startsWith('"') && !val.endsWith('"')) {
        inMulti = true;
        currentKey = key;
        currentValue = val.substring(1);
      } else {
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[key] = val;
      }
    }
  } else {
    if (line.trim().endsWith('"')) {
      currentValue += '\n' + line.trim().slice(0, -1);
      env[currentKey] = currentValue;
      inMulti = false;
    } else {
      currentValue += '\n' + line;
    }
  }
}

const projectId = env['FIREBASE_PROJECT_ID'];
const clientEmail = env['FIREBASE_CLIENT_EMAIL'];
const privateKey = (env['FIREBASE_PRIVATE_KEY'] || '').replace(/\\n/g, '\n');

console.log('Firebase Cloud Firestore Mock Data Cleaner');
console.log('Project ID:', projectId);

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  })
});

const db = app.firestore();

async function purgeMockData() {
  console.log('\n🧹 ফায়ারবেস ক্লাউড ফায়ারস্টোর থেকে সকল মক ডাটা মোছা হচ্ছে...');

  // Helper to delete all docs in a collection
  async function clearCollection(colName: string) {
    const snapshot = await db.collection(colName).get();
    if (snapshot.empty) {
      console.log(`- ${colName}: পূর্বে থেকেই খালি (0 docs)`);
      return;
    }
    const batch = db.batch();
    let count = 0;
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });
    await batch.commit();
    console.log(`✔ ${colName}: সফলভাবে ${count}টি মক ডকুমেন্ট মুছে ফেলা হয়েছে`);
  }

  // 1. Purge Members
  await clearCollection('members');

  // 2. Purge Transactions
  await clearCollection('transactions');

  // 3. Purge Ledger Entries
  await clearCollection('ledgerEntries');

  // 4. Purge Employees
  await clearCollection('employees');

  // 5. Purge Audit Logs
  await clearCollection('auditLogs');

  // 6. Clean Users Collection (Keep ONLY real CEO 01706338181)
  console.log('\n- ইউজার কালেকশন পরীক্ষা করা হচ্ছে...');
  const usersSnapshot = await db.collection('users').get();
  const userBatch = db.batch();
  let deletedUsers = 0;
  
  usersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.phoneNumber !== '01706338181' && doc.id !== 'ceo-user-01706338181') {
      userBatch.delete(doc.ref);
      deletedUsers++;
    }
  });
  if (deletedUsers > 0) {
    await userBatch.commit();
    console.log(`✔ users: ${deletedUsers}টি ডামি/টেস্ট অ্যাকাউন্ট মুছে ফেলা হয়েছে`);
  }

  // Ensure CEO account exists and is pristine in Firestore
  const ceoUser = {
    uid: 'ceo-user-01706338181',
    email: '01706338181@bhaggounnayan.org',
    displayName: 'প্রধান প্রশাসক ও সিইও',
    role: 'CEO',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    phoneNumber: '01706338181',
    password: '805222'
  };
  await db.collection('users').doc('ceo-user-01706338181').set(ceoUser, { merge: true });
  console.log('✔ users: সিইও অ্যাকাউন্ট (01706338181 / 805222) সুরক্ষিত ও হালনাগাদ করা হয়েছে');

  // 7. Update .local-data.json
  console.log('\n🧹 লোকাল ক্যাশ ফাইল (.local-data.json) পরিচ্ছন্ন করা হচ্ছে...');
  const localDataRaw = fs.readFileSync('.local-data.json', 'utf-8');
  const localData = JSON.parse(localDataRaw);

  localData.users = [ceoUser];
  localData.employees = [];
  localData.members = [];
  localData.transactions = [];
  localData.ledgerEntries = [];
  localData.auditLogs = [
    {
      id: `AUDIT-INIT-${Date.now()}`,
      actorUserId: ceoUser.uid,
      actorName: ceoUser.displayName,
      actorRole: ceoUser.role,
      actionType: 'LOGIN_SUCCESS',
      targetEntity: 'SYSTEM',
      targetId: 'MAIN',
      timestamp: new Date().toISOString(),
      outcome: 'SUCCESS',
      reason: 'মক ডাটা পরিচ্ছন্ন করে লাইভ উৎপাদন ডাটাবেজ সক্রিয়করণ'
    }
  ];

  fs.writeFileSync('.local-data.json', JSON.stringify(localData, null, 2), 'utf-8');
  console.log('✔ .local-data.json সফলভাবে সম্পূর্ণ মক-মুক্ত করা হয়েছে!');

  console.log('\n🎉 সফলভাবে সম্পন্ন হয়েছে! ডাটাবেজ এখন সম্পূর্ণ মক ডাটা মুক্ত ও আসল ব্যবহারের জন্য প্রস্তুত।');
  process.exit(0);
}

purgeMockData().catch((err) => {
  console.error('Error purging data:', err);
  process.exit(1);
});
