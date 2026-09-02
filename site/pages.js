import { PUBLISHED, SITE } from "./config.js";

/**
 * The site's standing pages — the ones that are not questions.
 *
 * A reader who has just answered a hundred personal questions is entitled to know who asked them,
 * what happened to the answers, and how to reach somebody. Ad networks want the same three things
 * before they will serve a page, which is a coincidence worth noticing but not the reason.
 *
 * Availability is derived, not declared. `문의` needs an address to send to and `개인정보처리방침`
 * needs the operator's details; neither exists in `site/config.js` yet, and a contact page carrying
 * a placeholder address is worse than no contact page — it invites a message nobody receives. So a
 * page appears when the facts it depends on are filled in, and until then it is absent from the
 * build, the footer and the sitemap alike, with nothing to remember to switch on.
 */
export const ABOUT_COPY = Object.freeze({
  title: "소개",
  description: "다가올 삶을 앞둔 두 사람이 미리 나눠 두면 좋은 질문을 만듭니다. 정답을 주지 않고, 판정하지 않습니다.",
  sections: Object.freeze([
    Object.freeze({
      heading: "무엇을 하는 곳인가요",
      paragraphs: Object.freeze([
        "결혼, 임신, 출산, 육아 — 두 사람이 함께 지나게 될 시기마다, 미리 맞춰 두면 좋았을 이야기가 있습니다. 대개는 그 시기가 닥친 다음에야 서로 생각이 다르다는 것을 알게 됩니다.",
        "이곳은 그 이야기를 미리 꺼내기 위한 질문들을 모아 둔 곳입니다. 한 주제당 100개의 질문이 있고, 각 질문에는 네 개의 답이 있습니다."
      ])
    }),
    Object.freeze({
      heading: "점수도, 판정도 없습니다",
      paragraphs: Object.freeze([
        "네 개의 답 중 더 옳은 것은 없습니다. 어느 쪽을 골라도 그것은 지금 당신이 무엇을 중요하게 여기는지를 말할 뿐입니다.",
        "모두 답하고 나면 결과지를 볼 수 있지만, 결과지는 당신이 고른 답을 그대로 돌려줄 뿐입니다. 점수를 매기지 않고, 관계를 진단하지 않고, 어떻게 하라고 말하지 않습니다. 100개짜리 설문이 남의 관계에 판정을 내릴 자격은 없다고 생각합니다.",
        "상대도 같은 질문에 답하면 두 사람의 답을 나란히 놓고 볼 수 있고, 서로 다르게 고른 질문이 먼저 나옵니다. 그것이 이 질문집이 실제로 쓸모 있는 지점입니다."
      ])
    }),
    Object.freeze({
      heading: "혼자 답해도 되나요",
      paragraphs: Object.freeze([
        "됩니다. 혼자 읽고 혼자 답해도 자신의 생각을 정리하는 데는 충분합니다.",
        "다만 이 질문들은 원래 두 사람을 위해 쓰였습니다. 같은 질문에 상대도 답하고 서로의 답을 나란히 놓고 볼 수 있게 하는 것이 앱에서 하는 일입니다."
      ])
    })
  ])
});

export const CONTACT_COPY = Object.freeze({
  title: "문의",
  description: "질문 내용, 오탈자, 제휴 문의를 받습니다.",
  sections: Object.freeze([
    Object.freeze({
      heading: "무엇이든 물어보세요",
      paragraphs: Object.freeze([
        "질문 문장이 어색하거나, 오탈자를 발견하셨거나, 다뤄 주었으면 하는 주제가 있다면 알려 주세요.",
        "답변에는 며칠이 걸릴 수 있습니다."
      ])
    })
  ])
});

/**
 * The standing pages this site can currently emit, in the order they appear in the footer.
 *
 * `contact` waits on an address and `privacy` on the operator's details. Both are owner actions —
 * `docs/OWNER_ACTIONS.md` N5 — and the page shows up on its own the moment the value is set.
 */
export function standingPages({ site = SITE } = {}) {
  const pages = [
    Object.freeze({
      slug: "about",
      path: "/about/",
      title: ABOUT_COPY.title,
      description: ABOUT_COPY.description,
      sections: ABOUT_COPY.sections
    })
  ];

  if (site.contactEmail) {
    pages.push(Object.freeze({
      slug: "contact",
      path: "/contact/",
      title: CONTACT_COPY.title,
      description: CONTACT_COPY.description,
      sections: CONTACT_COPY.sections,
      email: site.contactEmail
    }));
  }

  return Object.freeze(pages);
}

/** What the footer links to: the standing pages, plus the index when a reader is not on it. */
export function footerLinks({ site = SITE } = {}) {
  return Object.freeze(standingPages({ site }).map((page) => Object.freeze({
    path: page.path,
    title: page.title
  })));
}

/** Used by the About page to say what is published without hard-coding a count. */
export function publishedSummary() {
  return Object.freeze({
    packs: PUBLISHED.length,
    titles: Object.freeze(PUBLISHED.map((entry) => entry.navTitle || entry.title))
  });
}
