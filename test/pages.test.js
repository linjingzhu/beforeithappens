import test from "node:test";
import assert from "node:assert/strict";
import { SITE, siteWith } from "../site/config.js";
import { ABOUT_COPY, CONTACT_COPY, footerLinks, standingPages } from "../site/pages.js";
import { renderIndex, renderQuestionPage, renderStandingPage } from "../site/render.js";
import { indexModel, pageModel } from "../site/content.js";

const site = siteWith({ origin: "https://ab.example" });
const has = (html, text) => html.includes(text);

test("문의 is built from the address, and not built without one", () => {
  // The page appears from the address alone — no switch to remember — and disappears with it. A
  // contact page carrying an address nobody reads invites a message into a void.
  assert.match(SITE.contactEmail, /^[^@\s]+@[^@\s]+$/, "there is an inbox");
  const pages = standingPages({ site });
  assert.ok(pages.map((page) => page.slug).includes("contact"), "the address puts 문의 in the list");
  const contact = pages.find((page) => page.slug === "contact");
  assert.equal(contact.email, SITE.contactEmail);
  const html = renderStandingPage(contact, site);
  assert.ok(has(html, `href="mailto:${SITE.contactEmail}"`), "and it is reachable, not just printed");

  // Taking the address away takes 문의 with it — and 처리방침 too, which prints the same address as
  // the way to reach the 개인정보 보호책임자. 소개 is the only page that needs nothing.
  const withoutInbox = siteWith({ origin: site.origin, contactEmail: "" });
  assert.deepEqual(standingPages({ site: withoutInbox }).map((page) => page.slug), ["about"]);
});

test("the footer links only to pages the build actually emits", () => {
  // A footer link to a page that is not built is a 404 nobody finds until a reader does.
  for (const setup of [site, siteWith({ origin: site.origin, contactEmail: "x@example.com" })]) {
    const built = new Set(standingPages({ site: setup }).map((page) => page.path));
    const linked = footerLinks({ site: setup }).map((link) => link.path);
    assert.ok(linked.length > 0);
    for (const path of linked) assert.ok(built.has(path), `${path} is linked and built`);
    assert.equal(linked.length, built.size, "and every built page is linked");

    const html = renderQuestionPage(pageModel("marriage", 1, { site: setup }), setup);
    for (const link of footerLinks({ site: setup })) {
      assert.ok(has(html, `href="${link.path}"`), `${link.title} is in the footer`);
    }
  }
});

test("the standing pages are on every page's footer, including their own and the index", () => {
  const about = standingPages({ site })[0];
  const pages = [
    renderStandingPage(about, site),
    renderIndex(indexModel({ site }), site),
    renderQuestionPage(pageModel("marriage", 3, { site }), site)
  ];
  for (const html of pages) {
    assert.ok(has(html, 'class="foot-nav"'));
    assert.ok(has(html, 'href="/about/"'));
    assert.ok(has(html, site.name), "the rail names the site");
    // The footer signs with the publisher, on the owner's word, and no longer repeats the tagline.
    assert.ok(has(html, `<footer class="foot">\n        <p>${site.publisher}</p>`), "the footer signs as the publisher");
    const footer = html.slice(html.indexOf('<footer class="foot">'), html.indexOf("</footer>"));
    assert.ok(!has(footer, site.tagline), "the footer does not repeat the rail's line");
  }
});

test("소개 answers what a reader who just answered a hundred questions would ask", () => {
  const html = renderStandingPage(standingPages({ site })[0], site);
  assert.ok(has(html, `<title>${ABOUT_COPY.title} · ${site.name}</title>`));
  assert.ok(has(html, `<link rel="canonical" href="https://ab.example/about/">`));
  assert.ok(has(html, `content="${ABOUT_COPY.description}"`), "and says what it is, for a search result");

  for (const section of ABOUT_COPY.sections) {
    assert.ok(has(html, section.heading), section.heading);
    for (const paragraph of section.paragraphs) assert.ok(has(html, paragraph));
  }

  // Not scoring anyone is the claim the site rests on, so the page has to be straight about it and
  // a reviewer will look for it. Where the answers live was stated here too and the owner took the
  // section out; the sheet still says it, in `RESULT_COPY.clearNote`, next to the button that acts
  // on it — which is the place it is actually read.
  const prose = ABOUT_COPY.sections.flatMap((section) => section.paragraphs).join(" ");
  assert.ok(prose.includes("점수를 매기지 않고"), "that nothing is scored");
});

test("a standing page is prose, so it ships none of the answer machinery", () => {
  const html = renderStandingPage(standingPages({ site })[0], site);
  // No enhancement module: there is nothing on the page to remember, and a script that stores
  // nothing is still a request and still a thing that can break.
  assert.equal(has(html, "enhance.js"), false);
  for (const marker of ['type="radio"', 'class="q"', "data-question-index"]) {
    assert.equal(has(html, marker), false, `${marker} has no business on a prose page`);
  }
  assert.ok(has(html, 'class="prose"'));
});

test("the contact page's copy exists before the page does, so it is written once and reviewed once", () => {
  // It is not built today. It should still be real, and covered by the subsetted fonts — which
  // `scripts/build-brand-assets.py` reads from this module for exactly that reason.
  assert.ok(CONTACT_COPY.title);
  assert.ok(CONTACT_COPY.sections.length > 0);
  for (const section of CONTACT_COPY.sections) {
    assert.ok(section.heading.trim());
    for (const paragraph of section.paragraphs) assert.ok(paragraph.trim());
  }
});
