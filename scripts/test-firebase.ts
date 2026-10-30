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
let privateKey = (env['FIREBASE_PRIVATE_KEY'] || '').replace(/\\n/g, '\n');

console.log('Project ID:', projectId);
console.log('Client Email:', clientEmail);
console.log('Key length:', privateKey.length);

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  })
});

const db = app.firestore();
console.log('Connecting to Cloud Firestore...');

async function testConnection() {
  await db.collection('system_status').doc('connection_check').set({
    connected: true,
    organization: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE_CLOUD_FIRESTORE'
  });
  console.log('SUCCESS: Written connection document to Cloud Firestore!');
  const snap = await db.collection('system_status').doc('connection_check').get();
  console.log('READ FROM FIRESTORE:', snap.data());
  process.exit(0);
}

testConnection().catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
