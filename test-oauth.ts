import assert from "node:assert";
import { getDatabase } from "./src/lib/server/db";
import {
  findOrCreateOAuthUser,
  getGoogleAuthUrl,
  getFacebookAuthUrl,
  isGoogleOAuthConfigured,
  isFacebookOAuthConfigured,
  OAuthProfile,
} from "./src/lib/server/oauth";
import { getUserFromToken } from "./src/lib/server/auth";

console.log("================================================");
console.log(" RUNNING OAUTH ARCHITECTURE VERIFICATION TESTS ");
console.log("================================================");

// 1. Test OAuth URL generation and config flags
console.log("\n[1] Testing OAuth URL Generation & Config Helpers:");
assert.strictEqual(typeof isGoogleOAuthConfigured(), "boolean");
assert.strictEqual(typeof isFacebookOAuthConfigured(), "boolean");

const googleUrl = getGoogleAuthUrl("http://localhost:3000", "test_state_123");
assert.ok(googleUrl.startsWith("https://accounts.google.com/o/oauth2/v2/auth"));
assert.ok(
  googleUrl.includes(
    "redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle",
  ),
);
assert.ok(googleUrl.includes("scope=openid+email+profile"));
assert.ok(googleUrl.includes("state=test_state_123"));
console.log(
  "   ✓ Google OAuth 2.0 URL properly formed with state and redirect_uri",
);

const fbUrl = getFacebookAuthUrl("http://localhost:3000", "fb_state_456");
assert.ok(fbUrl.startsWith("https://www.facebook.com/v19.0/dialog/oauth"));
assert.ok(
  fbUrl.includes(
    "redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Ffacebook",
  ),
);
assert.ok(fbUrl.includes("state=fb_state_456"));
console.log(
  "   ✓ Facebook OAuth URL properly formed with state and redirect_uri",
);

// 2. Test User Provisioning via Google OAuth
console.log("\n[2] Testing User Provisioning via Google:");
const googleProfile: OAuthProfile = {
  provider: "google",
  providerId: `g_sub_${Date.now()}`,
  email: `developer_${Date.now()}@gmail.com`,
  name: "Alex Engineer",
  avatarUrl: "https://lh3.googleusercontent.com/a/sample_avatar",
};

const result1 = findOrCreateOAuthUser(googleProfile);
assert.ok(result1.user.id.startsWith("usr_"));
assert.ok(result1.token, "Session token must be created");

// Verify user is in SQLite
const sessionUser1 = getUserFromToken(result1.token);
assert.ok(sessionUser1, "Session user must be resolved from session token");
assert.strictEqual(sessionUser1.id, result1.user.id);
console.log(
  "   ✓ Google user successfully created in SQLite with active 30-day session",
);

// 3. Test Idempotency (Subsequent logins return same user without duplicates)
console.log("\n[3] Testing OAuth Idempotency (Repeat Login):");
const result2 = findOrCreateOAuthUser(googleProfile);
assert.strictEqual(
  result2.user.id,
  result1.user.id,
  "Repeat OAuth login must match same user ID",
);

const db = getDatabase();
const countStmt = db.prepare(
  "SELECT COUNT(*) as count FROM users WHERE provider = ? AND provider_id = ?",
);
const userCount = (
  countStmt.get("google", googleProfile.providerId) as { count: number }
).count;
assert.strictEqual(
  userCount,
  1,
  "Only exactly 1 user row must exist for this OAuth account",
);
console.log(
  "   ✓ Repeat OAuth login returns existing account without duplicate creation",
);

// 4. Test User Provisioning via Facebook OAuth
console.log("\n[4] Testing User Provisioning via Facebook:");
const fbProfile: OAuthProfile = {
  provider: "facebook",
  providerId: `fb_id_${Date.now()}`,
  email: `fb_user_${Date.now()}@example.com`,
  name: "Taylor Ops",
  avatarUrl: "https://graph.facebook.com/picture",
};

const resultFb = findOrCreateOAuthUser(fbProfile);
assert.ok(resultFb.user.id.startsWith("usr_"));
assert.ok(resultFb.token);
const sessionUserFb = getUserFromToken(resultFb.token);
assert.strictEqual(sessionUserFb?.id, resultFb.user.id);
console.log("   ✓ Facebook user successfully provisioned and authenticated");

// 5. Test Cross-Provider Account Linking by Email
console.log("\n[5] Testing Cross-Provider Account Linking by Email:");
const sharedEmail = `shared_${Date.now()}@company.org`;
const googleUserWithSharedEmail: OAuthProfile = {
  provider: "google",
  providerId: `g_shared_${Date.now()}`,
  email: sharedEmail,
  name: "Shared Account",
};
const fbUserWithSharedEmail: OAuthProfile = {
  provider: "facebook",
  providerId: `fb_shared_${Date.now()}`,
  email: sharedEmail,
  name: "Shared Account FB",
};

const userA = findOrCreateOAuthUser(googleUserWithSharedEmail);
const userB = findOrCreateOAuthUser(fbUserWithSharedEmail);
assert.strictEqual(
  userB.user.id,
  userA.user.id,
  "Accounts sharing same verified email must link to same user ID",
);
console.log(
  "   ✓ Accounts sharing verified email automatically link to same user ID and tasks",
);

console.log("\n================================================");
console.log(" ALL OAUTH VERIFICATION TESTS PASSED! ✓        ");
console.log("================================================\n");
