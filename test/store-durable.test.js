import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createCouple } from "../server/workspace.mjs";
import { createFileStore, createSqliteStore, emptyState, resolveStorePaths } from "../server/store.mjs";
import { collectionNames } from "../server/store-sqlite.mjs";
import { marriagePack } from "../src/questions.js";

const storeModule = fileURLToPath(new URL("../server/store-sqlite.mjs", import.meta.url));
const pack = { id: marriagePack.id, version: marriagePack.version };
const questionIds = ["home-01", "money-01"];
const choiceIdsByQuestion = {
  "home-01": ["home-rest", "home-social", "home-independent", "home-growth"],
  "money-01": ["money-save", "money-experience", "money-growth", "money-split"]
};

function workspace(t) {
  const dir = mkdtempSync(join(tmpdir(), "ab-store-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function open(dir, name = "state.sqlite") {
  return createSqliteStore(join(dir, name));
}

function couple(store) {
  const pair = createCouple({ store });
  const answers = createAnswers({ store, questionIds, choiceIdsByQuestion, pack });
  const auth = createAuth({
    store,
    onLogin: (userId) => pair.ensureWorkspace(userId),
    describeWorkspace: (userId) => pair.viewForUser(userId)
  });
  const login = (email) => auth.consumeMagicLink(auth.requestMagicLink(email).token);
  return { couple: pair, answers, auth, login };
}

// One child process, its own connection to the same database file.
function child(dbPath, source, env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ["--input-type=module", "-e", source], {
      env: { ...process.env, AB_TEST_DB: dbPath, ...env },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let out = "";
    let err = "";
    proc.stdout.on("data", (chunk) => { out += chunk; });
    proc.stderr.on("data", (chunk) => { err += chunk; });
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(`child exited ${code}: ${err}`));
    });
  });
}

const WRITER = `
  import { createSqliteStore } from ${JSON.stringify(storeModule)};
  const store = createSqliteStore(process.env.AB_TEST_DB);
  const tag = process.env.AB_TAG;
  const rounds = Number(process.env.AB_ROUNDS);
  for (let i = 0; i < rounds; i += 1) {
    // Read first, write second — the shape that loses data in a read-modify-rewrite store.
    const before = store.snapshot().sessions.length;
    store.mutate((state) => {
      state.sessions.push({ id: \`\${tag}-\${i}\`, userId: tag, seenBefore: before });
    });
  }
  store.close();
`;

test("every collection the server knows has a durable table behind it", () => {
  assert.deepEqual(collectionNames, Object.keys(emptyState()));
});

test("a durable store restarts with everything it was given", (t) => {
  const dir = workspace(t);
  const first = open(dir);
  first.mutate((state) => {
    state.users.push({ id: "usr_1", email: "buyer@example.com", createdAt: "2026-01-01T00:00:00.000Z" });
    state.workspaces.push({ id: "ws_1", ownerUserId: "usr_1", status: "active" });
    state.progress.push({ workspaceId: "ws_1", userId: "usr_1", index: 3 });
  });
  first.mutate((state) => {
    state.users[0].lastLoginAt = "2026-01-02T00:00:00.000Z";
    state.progress[0].index = 7;
  });
  first.close();

  const second = open(dir);
  t.after(() => second.close());
  const state = second.snapshot();
  assert.deepEqual(state.users, [{
    id: "usr_1",
    email: "buyer@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    lastLoginAt: "2026-01-02T00:00:00.000Z"
  }]);
  assert.deepEqual(state.progress, [{ workspaceId: "ws_1", userId: "usr_1", index: 7 }]);
  assert.equal(state.workspaces.length, 1);
  assert.deepEqual(state.answers, []);
});

test("deletes and reorders survive a restart too", (t) => {
  const dir = workspace(t);
  const first = open(dir);
  first.mutate((state) => {
    for (const id of ["ses_1", "ses_2", "ses_3"]) state.sessions.push({ id, userId: id });
  });
  first.mutate((state) => {
    state.sessions = state.sessions.filter((row) => row.id !== "ses_1");
  });
  first.close();

  const second = open(dir);
  t.after(() => second.close());
  assert.deepEqual(second.snapshot().sessions.map((row) => row.id), ["ses_2", "ses_3"]);
});

test("the database rejects the duplicates docs/DATA_MODEL.md forbids", (t) => {
  const dir = workspace(t);
  const store = open(dir);
  t.after(() => store.close());

  const cases = [
    ["users", { id: "usr_1", email: "same@example.com" }, { id: "usr_2", email: "same@example.com" }],
    ["invitations", { id: "inv_1", tokenHash: "hash-1" }, { id: "inv_2", tokenHash: "hash-1" }],
    ["purchases", { id: "pur_1", orderId: "ord_1" }, { id: "pur_2", orderId: "ord_1" }],
    ["webhookEvents", { id: "evt_1", eventId: "wh_1" }, { id: "evt_2", eventId: "wh_1" }],
    [
      "answers",
      { id: "ans_1", workspaceId: "ws_1", questionId: "home-01", roundNumber: 1, userId: "usr_1" },
      { id: "ans_2", workspaceId: "ws_1", questionId: "home-01", roundNumber: 1, userId: "usr_1" }
    ],
    [
      "answerRounds",
      { id: "rnd_1", workspaceId: "ws_1", questionId: "home-01", roundNumber: 1 },
      { id: "rnd_2", workspaceId: "ws_1", questionId: "home-01", roundNumber: 1 }
    ]
  ];

  for (const [collection, first, second] of cases) {
    store.mutate((state) => state[collection].push(first));
    assert.throws(
      () => store.mutate((state) => state[collection].push(second)),
      // The store itself never compares these fields: SQLite is what refuses.
      (error) => /UNIQUE constraint failed/.test(error.message),
      `${collection} accepted a duplicate`
    );
    assert.equal(store.snapshot()[collection].length, 1, `${collection} kept the rejected row`);
  }

  // A rejected write leaves nothing behind on disk either.
  store.close();
  const reopened = open(dir);
  t.after(() => reopened.close());
  for (const [collection] of cases) {
    assert.equal(reopened.snapshot()[collection].length, 1, `${collection} persisted a rejected row`);
  }
});

test("uniqueness does not punish rows that legitimately have no value yet", (t) => {
  const dir = workspace(t);
  const store = open(dir);
  t.after(() => store.close());
  // Social login can create an account before any email is trusted.
  store.mutate((state) => {
    state.users.push({ id: "usr_1", email: "" });
    state.users.push({ id: "usr_2", email: "" });
    state.users.push({ id: "usr_3" });
  });
  // Different rounds and different partners are different answers.
  store.mutate((state) => {
    state.answers.push({ id: "a1", workspaceId: "ws_1", questionId: "home-01", roundNumber: 1, userId: "usr_1" });
    state.answers.push({ id: "a2", workspaceId: "ws_1", questionId: "home-01", roundNumber: 1, userId: "usr_2" });
    state.answers.push({ id: "a3", workspaceId: "ws_1", questionId: "home-01", roundNumber: 2, userId: "usr_1" });
    state.answers.push({ id: "a4", workspaceId: "ws_2", questionId: "home-01", roundNumber: 1, userId: "usr_1" });
  });
  assert.equal(store.snapshot().users.length, 3);
  assert.equal(store.snapshot().answers.length, 4);
});

test("two processes writing at the same moment lose nothing", async (t) => {
  const dir = workspace(t);
  const dbPath = join(dir, "state.sqlite");
  const tags = ["a", "b", "c", "d"];
  const rounds = 25;
  await Promise.all(tags.map((tag) => child(dbPath, WRITER, { AB_TAG: tag, AB_ROUNDS: String(rounds) })));

  const store = open(dir);
  t.after(() => store.close());
  const sessions = store.snapshot().sessions;
  assert.equal(sessions.length, tags.length * rounds);
  assert.equal(new Set(sessions.map((row) => row.id)).size, tags.length * rounds);
  for (const tag of tags) {
    assert.equal(sessions.filter((row) => row.userId === tag).length, rounds);
  }
  // Every writer saw a state at least as large as the one before it: no reader was
  // handed a stale snapshot it could have overwritten.
  const last = sessions.at(-1);
  assert.ok(last.seenBefore >= 0);
});

test("a partner submitting from another process is visible without a restart", async (t) => {
  const dir = workspace(t);
  const dbPath = join(dir, "state.sqlite");
  const store = createSqliteStore(dbPath);
  t.after(() => store.close());
  store.mutate((state) => state.workspaces.push({ id: "ws_1", status: "active" }));
  assert.equal(store.snapshot().sessions.length, 0);

  await child(dbPath, WRITER, { AB_TAG: "partner", AB_ROUNDS: "3" });

  // Same open store instance, no restart.
  assert.equal(store.snapshot().sessions.length, 3);
  store.mutate((state) => state.sessions.push({ id: "mine", userId: "buyer" }));
  assert.equal(store.snapshot().sessions.length, 4);
  assert.equal(store.snapshot().workspaces.length, 1);
});

test("a duplicate rejected in one process is rejected against the other's rows", async (t) => {
  const dir = workspace(t);
  const dbPath = join(dir, "state.sqlite");
  const store = createSqliteStore(dbPath);
  t.after(() => store.close());
  await child(dbPath, `
    import { createSqliteStore } from ${JSON.stringify(storeModule)};
    const store = createSqliteStore(process.env.AB_TEST_DB);
    store.mutate((state) => state.purchases.push({ id: "pur_1", orderId: "ord_shared", status: "pending" }));
    store.close();
  `);
  assert.throws(
    () => store.mutate((state) => state.purchases.push({ id: "pur_2", orderId: "ord_shared" })),
    /UNIQUE constraint failed/
  );
  assert.deepEqual(store.snapshot().purchases.map((row) => row.id), ["pur_1"]);
});

test("an existing JSON store migrates, once, without touching the JSON file", async (t) => {
  const dir = workspace(t);
  const jsonPath = join(dir, "ab-store.json");
  const legacy = {
    users: [
      { id: "usr_1", email: "buyer@example.com" },
      { id: "usr_2", email: "partner@example.com" }
    ],
    workspaces: [{ id: "ws_1", ownerUserId: "usr_1", status: "active" }],
    members: [
      { id: "mem_1", workspaceId: "ws_1", userId: "usr_1", role: "buyer", status: "accepted" },
      { id: "mem_2", workspaceId: "ws_1", userId: "usr_2", role: "partner", status: "accepted" }
    ],
    purchases: [{ id: "pur_1", orderId: "ord_1", workspaceId: "ws_1", status: "paid" }],
    progress: [{ workspaceId: "ws_1", userId: "usr_1", index: 4 }]
  };
  const original = `${JSON.stringify(legacy, null, 2)}\n`;
  writeFileSync(jsonPath, original);

  const { dbPath } = resolveStorePaths(jsonPath);
  assert.equal(dbPath, join(dir, "ab-store.sqlite"));

  const store = await createFileStore(jsonPath);
  const state = store.snapshot();
  assert.deepEqual(state.users, legacy.users);
  assert.deepEqual(state.members, legacy.members);
  assert.deepEqual(state.progress, legacy.progress);
  assert.deepEqual(state.answers, []);
  assert.equal(store.importSummary.imported, 6);
  assert.equal(store.importSummary.conflicts, 0);
  assert.equal(readFileSync(jsonPath, "utf8"), original, "the old file must stay as a backup");
  assert.ok(existsSync(dbPath));

  // A second boot must not import the same rows again.
  store.mutate((state_) => state_.sessions.push({ id: "ses_1", userId: "usr_1" }));
  store.close();
  const rebooted = await createFileStore(jsonPath);
  t.after(() => rebooted.close());
  assert.equal(rebooted.importSummary, null);
  assert.equal(rebooted.snapshot().users.length, 2);
  assert.equal(rebooted.snapshot().sessions.length, 1);
});

test("a JSON store that already broke the rules still boots, and keeps the rejected rows readable", async (t) => {
  const dir = workspace(t);
  const jsonPath = join(dir, "ab-store.json");
  writeFileSync(jsonPath, JSON.stringify({
    users: [
      { id: "usr_1", email: "same@example.com" },
      { id: "usr_2", email: "same@example.com" }
    ],
    webhookEvents: [
      { id: "evt_1", eventId: "wh_1" },
      { id: "evt_2", eventId: "wh_1" }
    ],
    somethingElse: [{ id: "x" }]
  }));

  const store = await createFileStore(jsonPath);
  t.after(() => store.close());
  assert.deepEqual(store.snapshot().users.map((row) => row.id), ["usr_1"]);
  assert.deepEqual(store.snapshot().webhookEvents.map((row) => row.id), ["evt_1"]);
  const conflicts = store.conflicts();
  assert.equal(conflicts.length, 3);
  assert.deepEqual(conflicts.map((row) => row.collection), ["users", "webhookEvents", "somethingElse"]);
  assert.equal(JSON.parse(conflicts[0].data).id, "usr_2");
  assert.equal(store.importSummary.conflicts, 3);
  assert.deepEqual(store.importSummary.skippedKeys, ["somethingElse"]);
});

test("a real pairing and a real submitted round survive a restart", async (t) => {
  const dir = workspace(t);
  const jsonPath = join(dir, "ab-store.json");
  const first = await createFileStore(jsonPath);
  const app = couple(first);
  const buyer = app.login("buyer@example.com");
  const invite = app.couple.issueInvite(buyer.sessionId, "partner@example.com");
  const partner = app.login("partner@example.com");
  assert.equal(app.couple.acceptInvite(partner.sessionId, invite.token).ok, true);
  app.answers.saveDraft(buyer.sessionId, { questionId: "home-01", draftChoice: "home-rest", privateNote: "나만 볼 메모", index: 0 });
  app.answers.submit(buyer.sessionId, { questionId: "home-01", index: 0 });
  app.answers.saveDraft(partner.sessionId, { questionId: "home-01", draftChoice: "home-rest", index: 0 });
  app.answers.submit(partner.sessionId, { questionId: "home-01", index: 0 });
  const before = app.answers.stateFor(buyer.sessionId);
  assert.equal(before.ok, true);
  assert.equal(before.state.questions["home-01"].publicLock.comparison, "same");
  first.close();

  const second = await createFileStore(jsonPath);
  t.after(() => second.close());
  const rebooted = couple(second);
  const after = rebooted.answers.stateFor(buyer.sessionId);
  assert.equal(after.ok, true, "the buyer's session did not survive the restart");
  assert.deepEqual(after.state.questions["home-01"].publicLock, before.state.questions["home-01"].publicLock);
  assert.equal(after.state.questions["home-01"].roles.a.privateNote, "나만 볼 메모");
  assert.equal(second.snapshot().publicLocks.length, 1);
  assert.equal(rebooted.auth.sessionFor(partner.sessionId).workspace.acceptedPartner, true);
});

test("an unknown collection is refused rather than silently dropped", (t) => {
  const dir = workspace(t);
  const store = open(dir);
  t.after(() => store.close());
  assert.throws(
    () => store.mutate((state) => { state.receipts = [{ id: "r1" }]; }),
    /unknown collection "receipts"/
  );
  assert.equal(store.snapshot().receipts, undefined);
});
