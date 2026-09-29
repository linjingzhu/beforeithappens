import { PUBLISHED, SITE } from "./config.js";
import { guidePages } from "./guides.js";

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
/**
 * The page a wrong address lands on.
 *
 * GitHub Pages serves `/404.html` with a 404 status for any path it does not have, and until now
 * there was no such file, so a mistyped URL or a link that outlived its page got the host's own
 * blank page: no name on it, no way back, and a reader gone. This one is the site's own shell with
 * the footer and the way home already in it.
 *
 * It says what happened and nothing more. A 404 that apologises at length is still a 404, and the
 * useful part of it is the link.
 */
export const NOT_FOUND_COPY = Object.freeze({
  title: "찾을 수 없는 쪽이에요",
  description: "주소가 잘못되었거나, 옮겨진 쪽입니다.",
  sections: Object.freeze([
    Object.freeze({
      heading: "여기에는 아무것도 없어요",
      paragraphs: Object.freeze([
        "주소를 잘못 입력하셨거나, 예전에 있던 쪽이 옮겨졌을 수 있습니다.",
        "아래 링크로 처음부터 둘러보실 수 있어요."
      ])
    })
  ]),
  /** The row of ways out. The pack links are built from what the site actually publishes. */
  linksLabel: "돌아가기",
  homeLabel: "홈으로"
});

export const ABOUT_COPY = Object.freeze({
  title: "소개",
  description: "다가올 삶을 앞둔 두 사람이 미리 나눠 두면 좋은 질문을 만듭니다. 인문학적 사유를 위한 출판사 AfterScent가 만들고, 정답을 주지 않고, 판정하지 않습니다.",
  sections: Object.freeze([
    Object.freeze({
      heading: "무엇을 하는 곳인가요",
      paragraphs: Object.freeze([
        "결혼, 임신, 출산, 육아, 노후 — 두 사람이 함께 지나게 될 시기마다, 미리 맞춰 두면 좋았을 이야기가 있습니다. 대개는 그 시기가 닥친 다음에야 서로 생각이 다르다는 것을 알게 됩니다.",
        "이곳은 그 이야기를 미리 꺼내기 위한 질문들을 모아 둔 곳입니다. 한 주제당 100개의 질문이 있고, 각 질문에는 네 개의 답이 있습니다."
      ])
    }),
    Object.freeze({
      heading: "왜 만들게 되었나요",
      paragraphs: Object.freeze([
        "만든 사람이 연인과 질문 100제를 직접 만들어 함께 풀어 본 적이 있습니다. 해 보니 서로를 이해하기가 훨씬 쉬웠습니다. 몰랐던 서로의 속마음을 알게 되었고, 어떤 질문 앞에서는 여태 생각해 본 적도 없는 일을 처음으로 생각해 보게 되었습니다. 질문을 통해 스스로가 자라는 느낌이 들었습니다.",
        "그러다 결혼을 준비하며 두 사람이 앞날을 이야기하기 시작했습니다. 그때 알게 된 것은, 아는 것이 많다는 사실이 아니라 모르는 것이 너무 많다는 사실이었습니다. 임신과 출산, 육아와 자녀 교육, 노후 준비 — 언젠가 반드시 지나갈 시기인데 서로 어떻게 생각하는지는커녕 각자 어떻게 생각하는지조차 몰랐습니다.",
        "이 사이트의 다섯 질문집은 그때의 목록입니다. 무엇을 알아야 하는가의 목록이 아니라, 우리가 무엇을 모르더라의 목록입니다. 질문을 통해 스스로의 가치관을 세울 수 있고, 때로는 미리 대비할 기회가 된다고 보았습니다.",
        "직접 해 보면서 알게 된 것이 하나 더 있습니다. 두 사람의 답이 같았던 질문은 잘 기억나지 않고, 달랐던 질문은 오래 남습니다. 다를 때는 그 자리에서 토론이 되고, 그 토론이 실제로 서로를 알게 되는 지점이었습니다. 답을 비교하는 화면이 다르게 고른 질문을 먼저 보여 주는 것은 그래서입니다."
      ])
    }),
    Object.freeze({
      heading: "점수도, 판정도 없습니다",
      paragraphs: Object.freeze([
        "네 개의 답 중 더 옳은 것은 없습니다. 어느 쪽을 골라도 그것은 지금 당신이 무엇을 중요하게 여기는지를 말할 뿐입니다.",
        "모두 답하고 나면 결과지를 볼 수 있지만, 결과지는 당신이 고른 답을 그대로 돌려줄 뿐입니다. 점수를 매기지 않고, 관계를 진단하지 않습니다.",
        "상대도 같은 질문에 답하면 두 사람의 답을 나란히 놓고 볼 수 있고, 서로 다르게 고른 질문이 먼저 나옵니다. 그것이 이 질문집이 실제로 쓸모 있는 지점입니다."
      ])
    }),
    Object.freeze({
      heading: "혼자 답해도 되나요",
      paragraphs: Object.freeze([
        "됩니다. 혼자 읽고 혼자 답해도 자신의 생각을 정리하는 데는 충분합니다.",
        "다만 이 질문들은 원래 두 사람을 위해 쓰였습니다. 같은 질문에 상대도 답하고 서로의 답을 나란히 놓고 볼 수 있게 하는 것이 앱에서 하는 일입니다."
      ])
    }),
    Object.freeze({
      heading: "질문은 어떻게 만들어지나요",
      paragraphs: Object.freeze([
        "한 주제를 열 개의 장으로 나누고, 장마다 열 개의 질문을 씁니다. 한 질문에는 네 개의 답이 있고, 네 답은 하나의 축 위에 서로 다른 지점으로 놓습니다 — 누가 할지, 언제 할지, 어디까지 할지, 무엇을 먼저 둘지. 같은 말을 네 가지 어조로 바꿔 쓴 답은 답이 아니라 장식이라고 봅니다.",
        "그래서 다섯 질문집 2,500개의 답 중에 같은 문장은 하나도 없습니다. 질문도 마찬가지입니다. 이것은 편집자의 다짐이 아니라 자동 검사로 막아 둔 규칙이어서, 같은 문장이 다시 들어오면 배포가 멈춥니다.",
        "질문마다 그 질문이 놓이는 장면을 한 줄 붙입니다. 「돈을 어떻게 관리할까요」보다 「한 사람이 모르는 지출이 통장에서 빠져나갔습니다」가 먼저 떠올라야 답을 고를 수 있기 때문입니다. 장면도 백 개가 모두 다릅니다."
      ])
    }),
    Object.freeze({
      heading: "답은 어디에 저장되나요",
      paragraphs: Object.freeze([
        "이 브라우저 안에만 남습니다. 계정도, 서버도, 로그인도 없습니다. 「임시 저장」을 누른 순간에만 저장되고, 그 전까지는 아무것도 기록되지 않습니다.",
        "상대와 비교할 때도 답은 링크 주소 안에 담겨 두 사람 사이에서만 오갑니다. 이곳으로 보내지지 않고, 이곳에 남지도 않습니다. 「지우기」를 누르면 저장된 것과 화면의 것이 함께 사라집니다."
      ])
    }),
    Object.freeze({
      heading: "누가 만드나요",
      paragraphs: Object.freeze([
        "AfterScent에서 만들고 운영합니다. 삶을 고민하고 나를 이해하는 인문학적 사유를 위한 출판사이고, 책만이 아니라 사유를 담을 수 있는 여러 매체를 씁니다. 이 질문집도 그중 하나입니다 — 읽는 대신 답하는 방식으로 된 책이라고 생각하고 만들었습니다.",
        "그래서 이곳의 질문은 정보를 전달하지 않습니다. 임신 중 무엇을 먹어야 하는지, 유산 상속을 어떻게 나누는지는 이곳보다 더 잘 아는 곳이 많습니다. 여기 있는 것은 그 앞에서 당신이 무엇을 중요하게 여기는 사람인지 스스로 알아보게 하는 질문입니다.",
        "질문은 한 문장씩 사람이 쓰고 고칩니다. 질문 문장이 어색하거나, 다뤄 주었으면 하는 주제가 있다면 문의 페이지로 알려 주세요. 읽고 고칩니다."
      ])
    })
  ])
});

/**
 * 이용약관.
 *
 * Short, like the 처리방침, and for the same reason: there is no account to terminate, no payment
 * to refund and no user-submitted content to moderate, so most of what such a page usually governs
 * does not exist here. What is left is what a reader actually needs to know before relying on the
 * questions — that they are not advice, that the answers are theirs and stay on their device, and
 * who to write to.
 *
 * The 「전문적인 조언이 아닙니다」 clause is the one that matters. Several packs ask about medical
 * decisions, money and care; none of them is written by a clinician or a lawyer, and the site says
 * so where a reader will meet it rather than in a footnote.
 *
 * Not legal advice, and not a lawyer's work — the same caveat the 처리방침 carries. It wants review
 * before it is relied on.
 */
export function termsCopy({ site = SITE } = {}) {
  const op = site.operator || {};
  const operator = op.business || site.publisher || site.name;
  return Object.freeze({
    title: "이용약관",
    description: "이 사이트를 어떤 약속 아래 쓰실 수 있는지 적어 둔 문서입니다.",
    sections: Object.freeze([
      Object.freeze({
        heading: "제1조 (목적과 적용)",
        paragraphs: Object.freeze([
          `이 약관은 ${operator}(이하 「운영자」)가 제공하는 ${site.name} 웹사이트(${site.customDomain || site.origin})의 이용 조건을 정합니다.`,
          "이 사이트는 회원가입과 로그인이 없습니다. 페이지를 여는 것만으로 이 약관에 따라 이용하시는 것으로 봅니다."
        ])
      }),
      Object.freeze({
        heading: "제2조 (서비스의 내용)",
        paragraphs: Object.freeze([
          "운영자는 두 사람이 함께 지날 시기에 관한 질문집을 웹페이지로 제공합니다. 이용료는 없습니다.",
          "질문에 답한 내용은 이용자의 브라우저에만 저장됩니다. 운영자는 그 내용을 수집하지 않고, 보관하지 않으며, 볼 수 없습니다. 자세한 것은 개인정보 처리방침에 적었습니다."
        ])
      }),
      Object.freeze({
        heading: "제3조 (전문적인 조언이 아닙니다)",
        paragraphs: Object.freeze([
          "질문집은 두 사람이 대화를 시작하도록 돕기 위한 읽을거리입니다. 의료·법률·재무·심리 상담을 대신하지 않으며, 그 분야의 전문가가 감수한 문서가 아닙니다.",
          "건강, 임신과 출산, 자금, 돌봄, 마음의 어려움에 관한 결정은 해당 분야의 전문가와 상의해 주세요. 응급 상황이라고 판단되면 이 사이트를 닫고 119 또는 의료기관에 연락하시기 바랍니다.",
          "질문에 대한 어떤 답도 더 옳거나 그르지 않습니다. 이 사이트는 점수를 매기지 않고, 관계를 진단하지 않으며, 무엇을 하라고 권하지 않습니다."
        ])
      }),
      Object.freeze({
        heading: "제4조 (저작권)",
        paragraphs: Object.freeze([
          "사이트의 질문, 답지, 문안, 그림을 포함한 모든 창작물의 저작권은 운영자에게 있습니다.",
          "개인적으로 읽고, 답하고, 상대에게 링크를 보내는 것은 자유입니다. 무단으로 복제해 재배포하거나 상업적으로 이용하는 것은 허락 없이는 하실 수 없습니다. 인용이나 제휴는 문의 페이지로 연락해 주세요."
        ])
      }),
      Object.freeze({
        heading: "제5조 (광고)",
        paragraphs: Object.freeze([
          "사이트에는 제3자 광고가 실릴 수 있습니다. 광고의 내용과 그 광고주가 제공하는 상품·서비스에 대해서는 운영자가 책임지지 않습니다.",
          "광고 게재에 쓰이는 쿠키에 대해서는 개인정보 처리방침에 적었습니다."
        ])
      }),
      Object.freeze({
        heading: "제6조 (운영자의 책임)",
        paragraphs: Object.freeze([
          "운영자는 사이트가 끊기지 않고 제공된다고 보장하지 않습니다. 점검, 장애, 그 밖의 사유로 중단될 수 있습니다.",
          "이용자의 브라우저에 저장된 답은 이용자가 관리합니다. 브라우저의 저장 공간을 비우거나, 시크릿 창을 닫거나, 다른 기기에서 열면 답은 남아 있지 않습니다. 운영자는 그 답을 복구해 드릴 수 없습니다.",
          "이 사이트를 읽고 내린 결정과 그 결과에 대해 운영자는 책임지지 않습니다."
        ])
      }),
      Object.freeze({
        heading: "제7조 (약관의 변경)",
        paragraphs: Object.freeze([
          "약관이 바뀌면 이 페이지에 바뀐 내용을 올립니다. 바뀐 약관은 올린 때부터 적용됩니다.",
          "문의는 " + (site.contactEmail || "문의 페이지") + "로 받습니다."
        ])
      })
    ])
  });
}

export const CONTACT_COPY = Object.freeze({
  title: "문의",
  description: "질문 내용, 오탈자, 제휴 문의를 받습니다. 보내신 메일은 사람이 읽습니다.",
  sections: Object.freeze([
    Object.freeze({
      heading: "무엇이든 물어보세요",
      paragraphs: Object.freeze([
        "질문 문장이 어색하거나, 오탈자를 발견하셨거나, 다뤄 주었으면 하는 주제가 있다면 알려 주세요. 답지 네 개가 서로 구별되지 않는다거나, 장면이 낯설다거나, 이 문항은 불편했다는 이야기도 그대로 도움이 됩니다.",
        "아래 주소로 메일을 보내 주세요. 자동응답이 아니라 사람이 읽고, 고칠 것은 고칩니다. 답변에는 며칠이 걸릴 수 있습니다."
      ])
    }),
    Object.freeze({
      heading: "이런 것도 받습니다",
      paragraphs: Object.freeze([
        "새 주제 제안 — 지금은 결혼·임신·출산·육아·노후 다섯 가지가 열려 있고, 연애와 이별은 준비 중입니다. 그 밖에 두 사람이 미리 맞춰 두면 좋았을 시기가 있다면 알려 주세요.",
        "인용과 제휴 — 질문집의 일부를 소개하거나 함께 무언가를 하고 싶으시다면, 어떤 형태인지 적어 보내 주세요.",
        "오류 신고 — 페이지가 열리지 않거나, 저장한 답이 사라졌거나, 화면이 깨진다면 쓰신 기기와 브라우저를 함께 알려 주시면 빨리 찾을 수 있습니다."
      ])
    }),
    Object.freeze({
      heading: "보내지 않으셔도 되는 것",
      paragraphs: Object.freeze([
        "질문에 답하신 내용은 보내지 않으셔도 됩니다. 답은 이곳으로 오지 않고 여러분의 브라우저에만 남으며, 저희는 그것을 볼 수 없고 보고 싶지도 않습니다.",
        "건강 상태, 진단 내용, 가족의 개인정보처럼 민감한 이야기는 메일에 적지 말아 주세요. 상담이 필요한 일이라면 해당 분야의 전문가에게 닿는 편이 훨씬 낫습니다."
      ])
    })
  ])
});


/**
 * 개인정보 처리방침.
 *
 * Short because the site is short: it has no server, no account, no analytics and no third-party
 * script, so most of what such a page usually declares does not apply. The sections are the ones
 * `개인정보 보호법` 제30조 asks for, in its order, and each says what this site actually does rather
 * than what a template would have it say.
 *
 * Two things are written as conditions rather than facts, because they are conditions:
 * advertising cookies exist only once `SITE.adsenseClient` is filled in, and the operator's
 * identity comes from `SITE.operator`. The page is not emitted at all until that identity exists —
 * see `standingPages`.
 *
 * Not legal advice, and not a lawyer's work. `docs/proposals/privacy-policy-ko.md` holds the longer
 * draft written for the account-and-server version of the product, which is M2; this one describes
 * what is deployed today. Both want review before they are relied on.
 */
export function privacyCopy({ site = SITE } = {}) {
  const op = site.operator || {};
  const ads = Boolean(site.adsenseClient);
  const officer = op.officer || op.owner;

  // Who "운영자" refers to, said once and briefly. The full identity block belongs under
  // 개인정보 보호책임자, where a reader looks for it; folding it into a defining clause produced
  // `주소: … 20길 6(이하 "운영자")는` — an address with a parenthetical stapled to its house number.
  const trading = op.business || op.owner;

  const identity = [
    op.business ? `상호: ${op.business}` : "",
    op.owner ? `대표자: ${op.owner}` : "",
    op.address ? `주소: ${op.address}` : "",
    op.registration ? `사업자등록번호: ${op.registration}` : "",
    op.mailOrder ? `통신판매업 신고번호: ${op.mailOrder}` : ""
  ].filter(Boolean).join(" · ");

  return Object.freeze({
    title: "개인정보 처리방침",
    description: "이 사이트는 답을 서버로 보내지 않습니다. 무엇을 처리하고 무엇을 처리하지 않는지 그대로 적었습니다.",
    sections: Object.freeze([
      Object.freeze({
        heading: "먼저, 이 사이트가 하지 않는 것",
        paragraphs: Object.freeze([
          "질문에 고른 답과 옆에 적은 메모는 서버로 전송되지 않습니다. 이 사이트에는 답을 받는 서버가 없습니다.",
          "회원가입도, 로그인도, 이름·연락처 입력도 없습니다. 접속 통계 도구나 행동 분석 도구를 넣지 않았습니다.",
          `${trading ? `${trading}(이하 "운영자")` : "운영자"}는 여러분이 이 질문들에 무엇이라고 답했는지 알지 못하며, 알 수 있는 방법도 두지 않았습니다.`
        ])
      }),
      Object.freeze({
        heading: "답과 메모는 어디에 있나요",
        paragraphs: Object.freeze([
          "여러분이 사용하는 브라우저 안에만 있습니다. 화면 아래 \"임시 저장\"을 누른 순간, 그때까지 고른 답과 적은 메모가 브라우저의 저장 공간(localStorage)에 기록됩니다.",
          "누르기 전에는 어디에도 기록되지 않습니다. 저장하지 않은 상태에서 새로고침하거나 다른 페이지로 옮기면 그 내용은 사라집니다. 브라우저가 떠나기 전에 한 번 물어봅니다.",
          "저장된 내용은 결과지의 \"답한 내용 지우기\"로 언제든 남김없이 지울 수 있고, 브라우저의 사이트 데이터 삭제로도 지워집니다. 운영자에게 요청할 필요가 없습니다 — 운영자는 그 데이터에 접근할 수 없습니다."
        ])
      }),
      Object.freeze({
        heading: "링크로 상대와 비교할 때",
        paragraphs: Object.freeze([
          "결과지에서 링크를 만들면 고른 답이 그 링크 주소의 \"#\" 뒤에 담깁니다. 이 부분은 인터넷 표준상 서버로 전송되지 않습니다. 이 사이트도, 호스팅 업체도 그 내용을 받지 않습니다.",
          "옆에 적은 메모는 어떤 링크에도 담기지 않습니다.",
          "그 링크를 누구에게 보낼지는 여러분이 정합니다. 보내는 순간 받는 사람은 그 답을 보게 되므로, 답이 담긴 링크는 상대 한 사람에게만 보내 주세요."
        ])
      }),
      Object.freeze({
        heading: "메일로 보내기",
        paragraphs: Object.freeze([
          "\"메일로 보내기\"는 여러분 기기의 메일 앱을 본문이 채워진 상태로 열어 줄 뿐입니다. 이 사이트는 메일을 보내지 않고, 받는 사람 주소를 비워 두므로 여러분이 누구에게 보내는지도 알지 못합니다."
        ])
      }),
      Object.freeze({
        heading: "그래도 처리되는 것 — 접속 기록",
        paragraphs: Object.freeze([
          "이 사이트는 GitHub, Inc.의 GitHub Pages로 제공됩니다. 웹페이지를 열면 그 서버에 접속 기록(IP 주소, 접속 시각, 브라우저 종류 등)이 남을 수 있습니다. 이는 웹사이트를 제공하기 위해 기술적으로 발생하는 것이며, 운영자는 이 기록을 열람하거나 내려받지 않습니다.",
          "보유 기간과 처리 방식은 GitHub의 정책을 따릅니다.",
          "GitHub의 서버는 대한민국 밖(미국 등)에 있습니다. 웹사이트 제공을 위해 접속 기록이 그곳에서 처리되며, 여러분의 답과 메모는 여기에 포함되지 않습니다."
        ])
      }),
      Object.freeze({
        heading: "문의 메일을 보내신 경우",
        paragraphs: Object.freeze([
          `${site.contactEmail || "문의 주소"}로 메일을 보내시면, 답변에 필요한 범위에서 보내신 메일 주소와 내용이 처리됩니다. 목적은 문의에 답변하는 것 하나뿐이며, 다른 곳에 쓰지 않습니다.`,
          "답변이 끝나고 더 오갈 내용이 없으면 지웁니다. 관계 법령이 보관을 요구하는 경우에는 그 기간을 따릅니다.",
          "삭제를 원하시면 같은 주소로 알려 주세요."
        ])
      }),
      Object.freeze({
        heading: "쿠키와 광고",
        paragraphs: ads
          ? Object.freeze([
              "이 사이트에는 Google의 광고(AdSense)가 표시됩니다. Google을 비롯한 제3자 광고 사업자는 광고를 게재하기 위해 쿠키를 사용하며, 이를 통해 여러분의 이전 방문 기록에 기반한 광고가 표시될 수 있습니다.",
              "맞춤 광고는 Google 광고 설정(https://adssettings.google.com)에서 끌 수 있고, 브라우저 설정에서 쿠키 자체를 거부하거나 삭제할 수도 있습니다. 쿠키를 거부해도 질문을 읽고 답하는 데에는 지장이 없습니다.",
              "운영자는 광고 사업자가 수집한 정보를 받지 않으며, 여러분의 답과 메모는 광고와 어떤 방식으로도 연결되지 않습니다."
            ])
          : Object.freeze([
              "현재 이 사이트는 쿠키를 사용하지 않고, 제3자 스크립트를 싣지 않습니다.",
              "\"임시 저장\"이 쓰는 브라우저 저장 공간(localStorage)은 쿠키와 달리 서버로 전송되지 않으며, 여러분의 브라우저를 벗어나지 않습니다.",
              "앞으로 광고를 도입하게 되면 광고 사업자가 쿠키를 사용하게 되므로, 그 사실과 거부 방법을 이 항목에 먼저 적고 시행합니다."
            ])
      }),
      Object.freeze({
        heading: "제3자 제공과 처리위탁",
        paragraphs: Object.freeze([
          "운영자는 여러분의 개인정보를 제3자에게 제공하지 않습니다. 제공할 정보를 가지고 있지 않습니다.",
          ads
            ? "웹사이트 제공을 GitHub, Inc.(호스팅)에, 광고 게재를 Google LLC에 맡기고 있습니다."
            : "웹사이트 제공을 GitHub, Inc.(호스팅)에 맡기고 있습니다.",
          "법령에 따라 수사기관 등이 적법한 절차로 요구하는 경우에는 그에 따릅니다. 다만 여러분의 답과 메모는 운영자가 보관하지 않으므로 제출할 수 있는 대상이 아닙니다."
        ])
      }),
      Object.freeze({
        heading: "여러분의 권리",
        paragraphs: Object.freeze([
          "언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다.",
          "다만 이 사이트에서 답과 메모에 대해서는 그 권리를 운영자를 거치지 않고 직접, 즉시 행사할 수 있습니다 — 결과지의 \"답한 내용 지우기\"를 누르거나 브라우저의 사이트 데이터를 삭제하면 됩니다.",
          `문의 메일과 관련한 권리 행사는 ${site.contactEmail || "문의 주소"}로 알려 주시면 지체 없이 처리합니다.`
        ])
      }),
      Object.freeze({
        heading: "안전성 확보 조치",
        paragraphs: Object.freeze([
          "가장 강한 조치는 보관하지 않는 것이라고 보고, 답과 메모를 서버에 두지 않는 구조로 만들었습니다. 유출될 수 있는 저장소가 존재하지 않습니다.",
          "사이트 전체가 HTTPS로만 제공됩니다."
        ])
      }),
      Object.freeze({
        heading: "만 14세 미만 아동",
        paragraphs: Object.freeze([
          "이 사이트는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 알면서 처리하지 않습니다."
        ])
      }),
      Object.freeze({
        heading: "개인정보 보호책임자",
        paragraphs: Object.freeze([
          [officer ? `개인정보 보호책임자: ${officer}` : "", site.contactEmail ? `연락처: ${site.contactEmail}` : ""].filter(Boolean).join(" · "),
          identity,
          "개인정보 처리에 관한 문의, 불만, 피해 구제는 위 연락처로 보내 주세요. 받는 즉시 확인하고 답변드립니다."
        ].filter(Boolean))
      }),
      Object.freeze({
        heading: "권익침해 구제방법",
        paragraphs: Object.freeze([
          "아래 기관에 분쟁 해결이나 상담을 신청하실 수 있습니다.",
          "개인정보분쟁조정위원회 1833-6972 (www.kopico.go.kr) · 개인정보침해신고센터 118 (privacy.kisa.or.kr)",
          "대검찰청 사이버수사과 1301 (www.spo.go.kr) · 경찰청 사이버수사국 182 (ecrm.police.go.kr)"
        ])
      }),
      Object.freeze({
        heading: "이 방침이 바뀔 때",
        paragraphs: Object.freeze([
          "내용이 바뀌면 시행일과 함께 이 페이지에 게시합니다. 수집하는 항목이 늘어나는 등 여러분에게 불리한 변경은 시행 최소 30일 전에 게시합니다.",
          "특히 광고를 도입하거나 답을 서버에 저장하게 되는 변경은 시행 전에 이 페이지에서 먼저 알립니다."
        ])
      })
    ])
  });
}

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

  // 처리방침 waits on an identity for the same reason 문의 waits on an address. 개인정보 보호법
  // 제30조 requires the policy to name a 개인정보 보호책임자 and give a contact for them; a page
  // that names nobody is not a policy, and an unfinished legal document published is worse than an
  // absent one. Two values turn it on — `owner` and `address` in `SITE.operator`.
  const op = site.operator || {};
  if ((op.officer || op.owner) && op.address && site.contactEmail) {
    const copy = privacyCopy({ site });
    pages.push(Object.freeze({
      slug: "privacy",
      path: "/privacy/",
      title: copy.title,
      description: copy.description,
      sections: copy.sections
    }));
  }

  // 이용약관 names the operator it binds and gives an address to write to, so it waits on the same
  // two facts 문의 and 처리방침 wait on. A term that says who it is between is a term; one that
  // says "the operator" and names nobody is a template.
  if ((op.business || op.owner) && site.contactEmail) {
    const copy = termsCopy({ site });
    pages.push(Object.freeze({
      slug: "terms",
      path: "/terms/",
      title: copy.title,
      description: copy.description,
      sections: copy.sections
    }));
  }

  return Object.freeze(pages);
}

/** What the footer links to: the standing pages, plus the index when a reader is not on it. */
export function footerLinks({ site = SITE } = {}) {
  // 읽을거리 first: it is the only one of these a reader might actually want, and the three that
  // follow are the ones a reader looks for when something has gone wrong or they want to know who
  // is behind this. The guides come from their own module, so a site with no pack has no such link.
  const guides = guidePages({ site });
  const reading = guides.length
    ? [Object.freeze({ path: guides[0].path, title: guides[0].title })]
    : [];
  return Object.freeze([
    ...reading,
    ...standingPages({ site }).map((page) => Object.freeze({
      path: page.path,
      title: page.title
    }))
  ]);
}

/** Used by the About page to say what is published without hard-coding a count. */
export function publishedSummary() {
  return Object.freeze({
    packs: PUBLISHED.length,
    titles: Object.freeze(PUBLISHED.map((entry) => entry.navTitle || entry.title))
  });
}
