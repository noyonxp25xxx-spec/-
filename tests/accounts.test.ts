import { test, describe } from 'node:test';
import assert from 'node:assert';
import { store } from '../src/lib/services/data-store';

describe('10. Account Management & Credentials Security', () => {
  test('primary admin user 01706338181 exists with password 805222', () => {
    const admin = store.getUserByIdentifier('01706338181');
    assert.ok(admin, 'Admin with 01706338181 should exist');
    assert.strictEqual(admin?.role, 'CEO');
    assert.strictEqual(admin?.password, '805222');
    assert.strictEqual(admin?.status, 'ACTIVE');
  });

  test('old demo credentials without valid password fail lookup or verification', () => {
    const oldEmp = store.getUserByIdentifier('emp-user-001');
    // If old users exist or not, verifying password 805222 against nonexistent or wrong password must fail
    if (oldEmp) {
      assert.notStrictEqual(oldEmp.password, '805222');
    }
  });

  test('admin can create new employee, IT, and CEO accounts', () => {
    const empPhone = '01888123456';
    const newEmp = store.createUser({
      uid: `emp-test-${Date.now()}`,
      displayName: 'টেস্ট মাঠকর্মী',
      phoneNumber: empPhone,
      email: `${empPhone}@bhaggounnayan.org`,
      password: 'testpassword123',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    assert.ok(newEmp);
    const lookup = store.getUserByIdentifier(empPhone);
    assert.strictEqual(lookup?.displayName, 'টেস্ট মাঠকর্মী');
    assert.strictEqual(lookup?.password, 'testpassword123');

    // Clean up
    store.deleteUser(newEmp.uid);
  });

  test('main admin 01706338181 cannot be deleted', () => {
    const admin = store.getUserByIdentifier('01706338181');
    assert.ok(admin);
    const deleted = store.deleteUser(admin.uid);
    assert.strictEqual(deleted, false, 'Main admin deletion must be disallowed');
  });
});
