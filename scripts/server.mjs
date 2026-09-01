import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { marriagePack, questions } from "../src/questions.js";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createFileStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { createAccount } from "../server/account.mjs";
import { createAudit } from "../server/audit.mjs";
import { createReport } from "../server/report.mjs";

const root = process.cwd();
const storePath = process.env.AB_STORE_PATH
  || fileURLToPath(new URL("../data/ab-store.json", import.meta.url));
const store = await createFileStore(storePath);
const audit = createAudit({ store });
const couple = createCouple({ store, audit });
const account = createAccount({ store, audit });
const pack = { id: marriagePack.id, version: marriagePack.version };
const entitlement = createEntitlement({ store, pack, audit });
const report = createReport({ store, questionIds: questions.map((question) => question.id), pack });
const answers = createAnswers({
  store,
  questionIds: questions.map((question) => question.id),
  choiceIdsByQuestion: Object.fromEntries(questions.map((question) => [question.id, question.choices.map((choice) => choice.id)])),
  pack,
  entitlement
});
const auth = createAuth({
  store,
  audit,
  onLogin: (userId) => couple.ensureWorkspace(userId),
  describeWorkspace: (userId) => couple.viewForUser(userId)
});
const allowDevOutbox = process.env.AB_DEV_OUTBOX === "1" && process.env.NODE_ENV !== "production";
const allowDevOAuth = process.env.AB_DEV_OAUTH === "1" && process.env.NODE_ENV !== "production";
const server = createServer(createListener({ auth, couple, answers, entitlement, account, report, root, allowDevOutbox, allowDevOAuth }));
const port = Number(process.env.PORT) || 4173;
server.listen(port, "0.0.0.0", () => console.log(`AB running at http://localhost:${port} (store: ${storePath})`));
