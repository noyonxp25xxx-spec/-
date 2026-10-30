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

console.log('Connecting to Firebase Cloud Firestore...');
console.log('Project ID:', projectId);
console.log('Client Email:', clientEmail);

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  })
});

const db = app.firestore();

// Load local database data
const localData = JSON.parse(fs.readFileSync('.local-data.json', 'utf-8'));

async function syncAll() {
  console.log('\n🚀 লাইভ ফায়ারবেস ক্লাউড ফায়ারস্টোরে ডাটা আপলোড শুরু হচ্ছে...');

  // 1. Users
  console.log(`- আপলোড হচ্ছে ইউজার (${localData.users.length} টি)...`);
  const userBatch = db.batch();
  for (const user of localData.users) {
    const ref = db.collection('users').doc(user.uid);
    userBatch.set(ref, user, { merge: true });
  }
  await userBatch.commit();
  console.log('  ✔ ইউজার আপলোড সম্পন্ন!');

  // 2. Employees
  if (localData.employees && localData.employees.length > 0) {
    console.log(`- আপলোড হচ্ছে কর্মী (${localData.employees.length} জন)...`);
    const empBatch = db.batch();
    for (const emp of localData.employees) {
      const ref = db.collection('employees').doc(emp.id);
      empBatch.set(ref, emp, { merge: true });
    }
    await empBatch.commit();
    console.log('  ✔ কর্মী ডাটা আপলোড সম্পন্ন!');
  }

  // 3. Members
  if (localData.members && localData.members.length > 0) {
    console.log(`- আপলোড হচ্ছে সদস্য (${localData.members.length} জন)...`);
    const memBatch = db.batch();
    for (const mem of localData.members) {
      const ref = db.collection('members').doc(mem.id);
      memBatch.set(ref, mem, { merge: true });
    }
    await memBatch.commit();
    console.log('  ✔ সমবায় সদস্য ডাটা আপলোড সম্পন্ন!');
  }

  // 4. Transactions
  if (localData.transactions && localData.transactions.length > 0) {
    console.log(`- আপলোড হচ্ছে লেনদেন (${localData.transactions.length} টি)...`);
    const txnBatch = db.batch();
    for (const txn of localData.transactions) {
      const ref = db.collection('transactions').doc(txn.id);
      txnBatch.set(ref, txn, { merge: true });
    }
    await txnBatch.commit();
    console.log('  ✔ লেনদেন ডাটা আপলোড সম্পন্ন!');
  }

  // 5. Ledger
  if (localData.ledgerEntries && localData.ledgerEntries.length > 0) {
    console.log(`- আপলোড হচ্ছে লেজার এন্ট্রি (${localData.ledgerEntries.length} টি)...`);
    const ledBatch = db.batch();
    for (const entry of localData.ledgerEntries) {
      const ref = db.collection('ledgerEntries').doc(entry.id);
      ledBatch.set(ref, entry, { merge: true });
    }
    await ledBatch.commit();
    console.log('  ✔ ব্যাংকিং লেজার আপলোড সম্পন্ন!');
  }

  // 6. Notices
  if (localData.notices && localData.notices.length > 0) {
    console.log(`- আপলোড হচ্ছে নোটিশ (${localData.notices.length} টি)...`);
    const notBatch = db.batch();
    for (const notice of localData.notices) {
      const ref = db.collection('notices').doc(notice.id);
      notBatch.set(ref, notice, { merge: true });
    }
    await notBatch.commit();
    console.log('  ✔ নোটিশ বোর্ড ডাটা আপলোড সম্পন্ন!');
  }

  // 7. Activities
  if (localData.activities && localData.activities.length > 0) {
    console.log(`- আপলোড হচ্ছে কার্যক্রম ছবি (${localData.activities.length} টি)...`);
    const actBatch = db.batch();
    for (const act of localData.activities) {
      const ref = db.collection('activities').doc(act.id);
      actBatch.set(ref, act, { merge: true });
    }
    await actBatch.commit();
    console.log('  ✔ কার্যক্রম ছবি আপলোড সম্পন্ন!');
  }

  // 8. Settings
  if (localData.settings) {
    console.log('- আপলোড হচ্ছে সিস্টেম সেটিংস...');
    await db.collection('settings').doc('main').set(localData.settings, { merge: true });
    console.log('  ✔ সেটিংস আপলোড সম্পন্ন!');
  }

  // 9. System metadata
  await db.collection('system').doc('metadata').set({
    connected: true,
    lastSyncAt: new Date().toISOString(),
    organization: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা',
    version: '1.0.0',
    status: 'LIVE_DATABASE_ACTIVE'
  });

  console.log('\n🎉 ক্লাউড ফায়ারস্টোরে সকল ডাটাবেস টেবিল সফলভাবে সিঙ্ক ও কানেক্টেড হয়েছে!');

  // Verify counts directly from live Firestore
  const usersCount = (await db.collection('users').get()).size;
  const membersCount = (await db.collection('members').get()).size;
  const txnCount = (await db.collection('transactions').get()).size;
  const noticesCount = (await db.collection('notices').get()).size;

  console.log('\n📊 ফায়ারস্টোর ডাটাবেস লাইভ স্ট্যাটাস:');
  console.log(`- লাইভ ইউজার: ${usersCount} টি`);
  console.log(`- লাইভ সমবায় সদস্য: ${membersCount} জন`);
  console.log(`- লাইভ লেনদেন: ${txnCount} টি`);
  console.log(`- লাইভ নোটিশ: ${noticesCount} টি`);

  process.exit(0);
}

syncAll().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
