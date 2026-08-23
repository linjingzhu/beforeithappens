import { writeFileSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

export function emptyState() {
  return {
    users: [],
    magicLinks: [],
    sessions: [],
    workspaces: [],
    members: [],
    invitations: [],
    answerRounds: [],
    answers: [],
    privateNotes: [],
    agreements: [],
    progress: []
  };
}

export function createMemoryStore(initial = emptyState()) {
  let state = structuredClone(initial);
  return {
    snapshot() {
      return structuredClone(state);
    },
    mutate(writer) {
      writer(state);
    }
  };
}

export async function createFileStore(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
  let state = emptyState();
  try {
    state = { ...emptyState(), ...JSON.parse(await readFile(filePath, "utf8")) };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const persist = () => writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`);
  persist();
  return {
    snapshot() {
      return structuredClone(state);
    },
    mutate(writer) {
      writer(state);
      persist();
    }
  };
}
