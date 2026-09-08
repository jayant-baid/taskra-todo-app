import assert from 'node:assert';
import {
  computeOccurrencesForDate,
  computeDaySummary,
  computeAnalytics,
} from './src/lib/engine/taskEngine';
import {
  getLocalDateString,
  addDays,
} from './src/lib/engine/dateUtils';
import { TaskDefinition, TaskOccurrence } from './src/lib/engine/types';

console.log('========================================');
console.log(' RUNNING SPEC VERIFICATION TEST SUITE  ');
console.log('========================================');

const today = getLocalDateString();
const yesterday = addDays(today, -1);
const twoDaysAgo = addDays(today, -2);
const tomorrow = addDays(today, 1);

// TEST 1: Non-recurring carry-forward and age calculation (§3.1, §3.2, §10)
console.log('\n[1] Testing Non-recurring carry-forward & daysOld:');
const taskNonRecurring: TaskDefinition = {
  id: 'task-nonrec-1',
  title: 'Investigate Redis memory peak',
  description: 'Rolled forward from two days ago',
  isRecurring: false,
  startDate: twoDaysAgo,
  createdAt: new Date(twoDaysAgo + 'T10:00:00').toISOString(),
  status: 'active',
};

const occsToday = computeOccurrencesForDate(today, [taskNonRecurring], [], today);
assert.strictEqual(occsToday.length, 1, 'Non-recurring task should roll forward to today');
assert.strictEqual(occsToday[0].status, 'pending');
assert.strictEqual(occsToday[0].daysOld, 2, 'Task created 2 days ago should be 2d old');
console.log('   ✓ Carries forward to today with accurate daysOld=2');

// TEST 2: Completed non-recurring task stops rolling forward (§3.2)
console.log('\n[2] Testing completed non-recurring task stops rolling forward:');
const completedYesterdayOcc: TaskOccurrence = {
  id: 'task-nonrec-1_' + yesterday,
  taskDefinitionId: 'task-nonrec-1',
  date: yesterday,
  status: 'completed',
  completedAt: new Date(yesterday + 'T17:00:00').toISOString(),
};

// On completion day (yesterday), it appears as completed
const occsYesterday = computeOccurrencesForDate(yesterday, [taskNonRecurring], [completedYesterdayOcc], today);
assert.strictEqual(occsYesterday.length, 1);
assert.strictEqual(occsYesterday[0].status, 'completed');
console.log('   ✓ Preserved in history as completed on completion day');

// On days AFTER completion day (today), it does NOT appear
const occsTodayAfterCompletion = computeOccurrencesForDate(today, [taskNonRecurring], [completedYesterdayOcc], today);
assert.strictEqual(occsTodayAfterCompletion.length, 0, 'Completed non-recurring task must not roll forward to today');
console.log('   ✓ Does not roll forward after completion day');

// TEST 3: Recurring task lazy generation & independent completion (§3.2, §4)
console.log('\n[3] Testing recurring task lazy occurrence generation:');
const taskRecurring: TaskDefinition = {
  id: 'task-rec-1',
  title: 'Daily Standup & Sync',
  isRecurring: true,
  recurrenceRule: 'daily',
  startDate: twoDaysAgo,
  createdAt: new Date(twoDaysAgo + 'T08:00:00').toISOString(),
  status: 'active',
};

// Yesterday was completed
const standupYesterdayCompleted: TaskOccurrence = {
  id: 'task-rec-1_' + yesterday,
  taskDefinitionId: 'task-rec-1',
  date: yesterday,
  status: 'completed',
  completedAt: new Date(yesterday + 'T09:30:00').toISOString(),
};

// Today has no persisted occurrence yet (lazy!)
const occsRecToday = computeOccurrencesForDate(today, [taskRecurring], [standupYesterdayCompleted], today);
assert.strictEqual(occsRecToday.length, 1);
assert.strictEqual(occsRecToday[0].status, 'pending', 'Today should be pending lazily');
assert.strictEqual(occsRecToday[0].isMaterialized, false, 'Today occurrence should not be materialized in DB yet');
console.log('   ✓ Lazily generates today without pre-writing DB rows');
console.log('   ✓ Completing yesterday does not complete today (independent occurrences)');

// TEST 4: Recurring task delete semantics (§3.3)
console.log('\n[4] Testing recurring task delete semantics (deletedFrom = today):');
// When deleted today, deletedFrom = today and status = 'deleted'
const taskRecurringDeletedToday: TaskDefinition = {
  ...taskRecurring,
  deletedFrom: today,
  status: 'deleted',
};

// Past occurrences (< today) remain valid and present in history!
const occsRecPast = computeOccurrencesForDate(yesterday, [taskRecurringDeletedToday], [standupYesterdayCompleted], today);
assert.strictEqual(occsRecPast.length, 1, 'Past occurrences before delete date must remain intact');
assert.strictEqual(occsRecPast[0].status, 'completed');
console.log('   ✓ Past historical occurrences (< today) remain untouched in history');

// Occurrences from today onward cease to generate!
const occsRecTodayAfterDelete = computeOccurrencesForDate(today, [taskRecurringDeletedToday], [standupYesterdayCompleted], today);
assert.strictEqual(occsRecTodayAfterDelete.length, 0, 'Recurring task must not generate occurrences on or after deletedFrom');

const occsRecTomorrowAfterDelete = computeOccurrencesForDate(tomorrow, [taskRecurringDeletedToday], [standupYesterdayCompleted], today);
assert.strictEqual(occsRecTomorrowAfterDelete.length, 0, 'Recurring task must not generate occurrences on tomorrow after delete');
console.log('   ✓ No new occurrences generated from today onward');

// TEST 5: Analytics and DaySummary (§3.4, §3.5)
console.log('\n[5] Testing Analytics & Weekly DaySummary:');
const daySummaryYesterday = computeDaySummary(yesterday, [taskRecurring], [standupYesterdayCompleted], today);
assert.strictEqual(daySummaryYesterday.completedCount, 1);
assert.strictEqual(daySummaryYesterday.totalCount, 1);
assert.strictEqual(daySummaryYesterday.completionPercentage, 100);
assert.strictEqual(daySummaryYesterday.isPast, true);
console.log('   ✓ DaySummary accurately marks isPast=true, 100% completion');

const analytics = computeAnalytics([taskRecurring, taskNonRecurring], [standupYesterdayCompleted], today);
assert.strictEqual(analytics.carryOverCount, 1, 'One pending non-recurring task carried over');
assert.strictEqual(analytics.recurringCount, 1);
assert.ok(analytics.currentStreak >= 1, 'Streak includes completed yesterday');
console.log('   ✓ Analytics carries over count=1, streaks computed correctly');

// TEST 6: Non-recurring delete semantics & Tomorrow isolation (§3.2, §3.3)
console.log('\n[6] Testing Non-recurring delete history preservation & Tomorrow boundary:');
const taskNonRecDeletedToday: TaskDefinition = {
  ...taskNonRecurring,
  deletedFrom: today,
  status: 'deleted',
};

// Historical completion on yesterday is preserved even after deletion
const occsNonRecPast = computeOccurrencesForDate(yesterday, [taskNonRecDeletedToday], [completedYesterdayOcc], today);
assert.strictEqual(occsNonRecPast.length, 1, 'Completed non-recurring task must be preserved in history after delete');
assert.strictEqual(occsNonRecPast[0].status, 'completed');
console.log('   ✓ Non-recurring past completion preserved in history after deletion');

// From delete date onward, it does not appear
const occsNonRecTodayAfterDelete = computeOccurrencesForDate(today, [taskNonRecDeletedToday], [completedYesterdayOcc], today);
assert.strictEqual(occsNonRecTodayAfterDelete.length, 0, 'Deleted non-recurring task must not show today');
console.log('   ✓ Non-recurring task stops appearing on and after delete date');

// Pending task for today does NOT preemptively appear in Tomorrow
const occsTomorrowPending = computeOccurrencesForDate(tomorrow, [taskNonRecurring], [], today);
assert.strictEqual(occsTomorrowPending.length, 0, 'Pending today task should not duplicate into Tomorrow');
console.log('   ✓ Tomorrow does not prematurely duplicate today’s unfinished tasks');

console.log('\n========================================');
console.log(' ALL 6 SPEC VERIFICATION SUITES PASSED! ✓');
console.log('========================================\n');
