import { store } from '../src/lib/services/data-store';

console.log('🌱 ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা - ডাটাবেস সিডিং শুরু হচ্ছে...');

const members = store.getMembers();
const employees = store.getEmployees();
const transactions = store.getTransactions();
const notices = store.getNotices();
const activities = store.getActivities();

console.log(`✅ সফলভাবে প্রাথমিক ডাটা লোড সম্পন্ন:`);
console.log(`- নিবন্ধিত সমবায় সদস্য: ${members.length} জন`);
console.log(`- সক্রিয় মাঠকর্মী: ${employees.length} জন`);
console.log(`- প্রাথমিক লেনদেন সংখ্যা: ${transactions.length} টি`);
console.log(`- প্রকাশিত নোটিশ: ${notices.length} টি`);
console.log(`- কার্যক্রম ছবি: ${activities.length} টি`);
console.log('🚀 সিস্টেম ব্যবহারের জন্য সম্পূর্ণরূপে প্রস্তুত!');
