import { PACK_LIST_ROWS } from "./pair-code.js";
import { PACK_AUDIENCE } from "./pack-schema.js";
import { marriagePack } from "./questions.js";

/**
 * The registry: every pack that has content, in one place, addressable by either of its two ids.
 *
 * There are two id spaces and conflating them has already cost time. `PACK_LIST_ROWS` in
 * `src/pair-code.js` uses **catalog ids** — `marriage`, `dating` — and is the app's locked display
 * list, order and labels included. A pack's own `id` is its **content id** — `marriage-preparation`
 * — which is versioned and is what entitlements, answer rounds and reports are stamped with. The
 * first names a shelf; the second names what is on it, at a version. Both are needed and they are
 * not interchangeable.
 *
 * Adding a pack means one import and one line in `CONTENT_PACKS`. Everything else — validation,
 * ordering, lookup, and the invariant that the app never advertises a pack with nothing in it —
 * follows from being in this list.
 */
const CONTENT_PACKS = Object.freeze([marriagePack]);

const byCatalogId = new Map(CONTENT_PACKS.map((pack) => [pack.catalogId, pack]));
const byContentId = new Map(CONTENT_PACKS.map((pack) => [pack.id, pack]));

if (byCatalogId.size !== CONTENT_PACKS.length) throw new Error("two packs claim the same catalogId");
if (byContentId.size !== CONTENT_PACKS.length) throw new Error("two packs claim the same content id");

const catalogIds = new Set(PACK_LIST_ROWS.map((row) => row.id));
for (const pack of CONTENT_PACKS) {
  if (!catalogIds.has(pack.catalogId)) {
    throw new Error(`pack ${pack.id} has catalogId ${pack.catalogId}, which is not in PACK_LIST_ROWS`);
  }
}

/**
 * A row the app shows as open must have questions behind it. Getting this wrong ships a pack
 * people can tap into and find empty, which is the failure the coming-soon rule exists to prevent.
 */
for (const row of PACK_LIST_ROWS) {
  if (row.open && !byCatalogId.has(row.id)) {
    throw new Error(`pack list marks ${row.id} open, but no registered pack has that catalogId`);
  }
}

export { PACK_AUDIENCE };

export function allPacks() {
  return CONTENT_PACKS;
}

export function packByCatalogId(catalogId) {
  return byCatalogId.get(String(catalogId || "")) || null;
}

export function packByContentId(contentId) {
  return byContentId.get(String(contentId || "")) || null;
}

/** Accepts either id, because callers hold one or the other and should not have to know which. */
export function findPack(id) {
  return packByCatalogId(id) || packByContentId(id);
}

export function hasContent(id) {
  return Boolean(findPack(id));
}

export function packsFor(audience) {
  return CONTENT_PACKS.filter((pack) => pack.audience === audience);
}

export function isCouplePack(id) {
  return findPack(id)?.audience === PACK_AUDIENCE.couple;
}

/** Ordered by section, renumbered, `chapter` attached. Empty for a pack that does not exist. */
export function questionsFor(id) {
  return findPack(id)?.orderedQuestions || [];
}

/** The identity stamped onto entitlements, answer rounds and reports. */
export function packIdentity(id) {
  const pack = findPack(id);
  return pack ? { id: pack.id, version: pack.version } : null;
}

/** Catalog rows joined to whether anything is actually behind them, for a pack list to render. */
export function catalogWithContent() {
  return PACK_LIST_ROWS.map((row) => Object.freeze({
    ...row,
    hasContent: byCatalogId.has(row.id),
    questionCount: byCatalogId.get(row.id)?.questions.length || 0
  }));
}
