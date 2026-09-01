import { RESULT_COPY } from "./result-copy.js";

/**
 * Mailing a result from a site with no server.
 *
 * The site cannot send mail and should not start: sending would mean an address, an outbox and a
 * server holding the answers on the way through. Opening the reader's own mail app with the text
 * already written costs none of that. Nothing here makes a request, the recipient field is left
 * blank so no address is ever ours, and what is mailed is what the reader can already see.
 *
 * The body is capped, because a `mailto:` is a URL and a URL has a limit — browsers differ, and
 * around 2,000 characters is the honest floor. So the mail carries the questions worth an evening
 * and a link to the rest, rather than a hundred rows that would be silently truncated by whichever
 * program opens it.
 *
 * No imports but the copy, so the browser loads this without the pack registry behind it.
 */

/** Conservative for a URL that has to survive a mail client, a browser and an OS handoff. */
export const MAIL_BODY_LIMIT = 1800;

function line(...parts) {
  return parts.filter(Boolean).join("");
}

/**
 * The letter itself: subject, body, and how many rows had to be left out.
 *
 * `rows` are the comparison's differing questions when there are two people, or the reader's own
 * answers when there is one. `link` is where the whole thing can be read, and it is included only
 * when rows were dropped or a second person is in it — a link that carries answers is not something
 * to put in a mail nobody asked for.
 */
export function composeResultMail({ title = "", rows = [], link = "", compared = false } = {}) {
  const subject = compared
    ? RESULT_COPY.mailSubjectCompared(title)
    : RESULT_COPY.mailSubject(title);

  const head = compared ? [RESULT_COPY.mailBothWarning, ""] : [];
  const body = [];

  // The tail is budgeted before the rows are, not after. Filling to the limit and *then* adding
  // "and 23 more" plus a link is how a letter ends up over the limit it was written to respect —
  // measured at 1,871 characters against a cap of 1,800 before this reserved its own room. Worst
  // case both lines are present, so worst case is what is set aside.
  const tailReserve =
    RESULT_COPY.mailMore(rows.length).length +
    (link ? `${RESULT_COPY.mailLinkLabel}: ${link}`.length + 1 : 0) +
    2;
  const budget = MAIL_BODY_LIMIT - tailReserve;
  let used = head.join("\n").length + subject.length;
  let written = 0;

  for (const row of rows) {
    const block = compared
      ? [
          `${row.number}. ${row.title}`,
          `    ${RESULT_COPY.mailMine} · ${row.mine}`,
          `    ${RESULT_COPY.mailTheirs} · ${row.theirs}`,
          ""
        ]
      : [`${row.number}. ${row.title}`, `    ${row.choice}`, ""];
    const text = block.join("\n");
    if (used + text.length > budget) break;
    body.push(text);
    used += text.length;
    written += 1;
  }

  const left = rows.length - written;
  const tail = [];
  if (left > 0) tail.push(RESULT_COPY.mailMore(left));
  if (link && (left > 0 || compared)) tail.push(`${RESULT_COPY.mailLinkLabel}: ${link}`);

  return {
    subject,
    body: line([...head, ...body, ...tail].join("\n")).trim(),
    written,
    left
  };
}

/** `mailto:` with no recipient: the reader chooses who it goes to, and we never learn who. */
export function mailtoHref({ subject = "", body = "" } = {}) {
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:?${query}`;
}
