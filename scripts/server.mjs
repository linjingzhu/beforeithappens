import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { marriagePack, questions } from "../src/questions.js";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createFileStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";

const root = process.cwd();
const store = await createFileStore(fileURLToPath(new URL("../data/ab-store.json", import.meta.url)));
const couple = createCouple({ store });
const pack = { id: marriagePack.id, version: marriagePack.version };
const entitlement = createEntitlement({ store, pack });
const answers = createAnswers({
  store,
  questionIds: questions.map((question) => question.id),
  choiceIdsByQuestion: Object.fromEntries(questions.map((question) => [question.id, question.choices.map((choice) => choice.id)])),
  pack,
  entitlement
});
const auth = createAuth({
  store,
  onLogin: (userId) => couple.ensureWorkspace(userId),
  describeWorkspace: (userId) => couple.viewForUser(userId)
});
const allowDevOutbox = process.env.AB_DEV_OUTBOX === "1" && process.env.NODE_ENV !== "production";
const server = createServer(createListener({ auth, couple, answers, entitlement, root, allowDevOutbox }));
server.listen(4173, "0.0.0.0", () => console.log("AB running at http://localhost:4173"));
