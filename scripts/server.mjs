import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createFileStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";

const root = process.cwd();
const store = await createFileStore(fileURLToPath(new URL("../data/ab-store.json", import.meta.url)));
const couple = createCouple({ store });
const auth = createAuth({
  store,
  onLogin: (userId) => couple.ensureWorkspace(userId),
  describeWorkspace: (userId) => couple.viewForUser(userId)
});
const allowDevOutbox = process.env.AB_DEV_OUTBOX === "1" && process.env.NODE_ENV !== "production";
const server = createServer(createListener({ auth, couple, root, allowDevOutbox }));
server.listen(4173, "0.0.0.0", () => console.log("AB running at http://localhost:4173"));
