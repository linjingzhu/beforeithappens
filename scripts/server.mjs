import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createFileStore } from "../server/store.mjs";

const root = process.cwd();
const store = await createFileStore(fileURLToPath(new URL("../data/ab-store.json", import.meta.url)));
const auth = createAuth({ store });
const allowDevOutbox = process.env.NODE_ENV !== "production" && process.env.AB_DEV_OUTBOX !== "0";
const server = createServer(createListener({ auth, root, allowDevOutbox }));
server.listen(4173, "0.0.0.0", () => console.log("AB running at http://localhost:4173"));
