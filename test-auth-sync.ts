import assert from 'node:assert';
import { getDatabase } from './src/lib/server/db';
import { hashPassword, generateSalt, createSession, getUserFromToken } from './src/lib/server/auth';
import { getLocalDateString } from './src/lib/engine/dateUtils';

console.log('================================================');
console.log(' RUNNING AUTH & SERVER SYNC VERIFICATION TESTS ');
console.log('================================================');

const db = getDatabase();

// 1. Test Password Hashing and Salt Verification
console.log('\n[1] Testing Password Hashing & Verification:');
const password = 'OpsEngineerPassword123';
const salt = generateSalt();
const hash = hashPassword(password, salt);
assert.strictEqual(hashPassword(password, salt), hash, 'Hash must be deterministic for same salt');
assert.notStrictEqual(hashPassword('WrongPassword', salt), hash, 'Hash must differ for wrong password');
console.log('   ✓ PBKDF2 hash generation and validation verified');

// 2. Test User Creation in SQLite
console.log('\n[2] Testing User Creation in SQLite:');
const testUserId = `test_usr_${Date.now()}`;
const testUsername = `user_${Date.now()}`;
const createdAt = new Date().toISOString();

const insertUserStmt = db.prepare(`
  INSERT INTO users (id, username, password_hash, salt, created_at)
  VALUES (?, ?, ?, ?, ?)
`);
insertUserStmt.run(testUserId, testUsername, hash, salt, createdAt);

const selectUserStmt = db.prepare('SELECT id, username FROM users WHERE id = ?');
const createdUser = selectUserStmt.get(testUserId) as { id: string; username: string } | undefined;
assert.ok(createdUser, 'User must exist in SQLite');
assert.strictEqual(createdUser.username, testUsername);
console.log('   ✓ User created and queried successfully from SQLite');

// 3. Test Session Token Creation & Retrieval
console.log('\n[3] Testing Session Creation and Token Validation:');
const { token, expiresAt } = createSession(testUserId);
assert.ok(token, 'Session token must be generated');
assert.ok(new Date(expiresAt) > new Date(), 'Session must expire in the future');

const sessionUser = getUserFromToken(token);
assert.ok(sessionUser, 'User must be resolved from session token');
assert.strictEqual(sessionUser.id, testUserId);
assert.strictEqual(sessionUser.username, testUsername);
console.log('   ✓ Session token successfully validated and mapped to user');

// 4. Test Server Task Definitions and Occurrences Persistence
console.log('\n[4] Testing Server Task Definitions and Occurrences:');
const today = getLocalDateString();
const testTaskId = `task_test_${Date.now()}`;

const insertTaskStmt = db.prepare(`
  INSERT INTO task_definitions (
    id, user_id, title, description, is_recurring, recurrence_rule,
    start_date, created_at, status, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertTaskStmt.run(
  testTaskId,
  testUserId,
  'Verify Cross-Device Sync Architecture',
  'Ensure mobile and desktop sync seamlessly',
  1,
  'daily',
  today,
  createdAt,
  'active',
  createdAt
);

const selectTasksStmt = db.prepare('SELECT id, title, is_recurring FROM task_definitions WHERE user_id = ?');
const userTasks = selectTasksStmt.all(testUserId) as Array<{ id: string; title: string; is_recurring: number }>;
assert.strictEqual(userTasks.length, 1);
assert.strictEqual(userTasks[0].id, testTaskId);
assert.strictEqual(userTasks[0].is_recurring, 1);
console.log('   ✓ Task definition successfully persisted and isolated to user');

// 5. Test Remove All Data on Server (Soft-delete active tasks from today onward)
console.log('\n[5] Testing Remove All Data (Soft-delete active tasks):');
const removeAllStmt = db.prepare(`
  UPDATE task_definitions
  SET status = 'deleted', deleted_from = ?, updated_at = ?
  WHERE user_id = ? AND status = 'active'
`);
removeAllStmt.run(today, new Date().toISOString(), testUserId);

const checkActiveStmt = db.prepare("SELECT COUNT(*) as count FROM task_definitions WHERE user_id = ? AND status = 'active'");
const activeCount = (checkActiveStmt.get(testUserId) as { count: number }).count;
assert.strictEqual(activeCount, 0, 'No active tasks should remain after Remove All Data');

const checkDeletedStmt = db.prepare("SELECT COUNT(*) as count FROM task_definitions WHERE user_id = ? AND status = 'deleted'");
const deletedCount = (checkDeletedStmt.get(testUserId) as { count: number }).count;
assert.strictEqual(deletedCount, 1, 'Deleted task definition preserved with deleted_from for history');
console.log('   ✓ Remove All Data soft-deleted active tasks while preserving definition history');

console.log('\n================================================');
console.log(' ALL AUTH & SERVER SYNC TESTS PASSED! ✓        ');
console.log('================================================\n');
