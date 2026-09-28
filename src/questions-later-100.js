/**
 * 노후 100제 — a site pack. Generated; do not edit by hand.
 *
 * Source: `question-packs/later.html`, the editorial review build.
 * Regenerate: `node scripts/build-site-packs.mjs later`. `test/site-packs.test.js` fails if
 * this file and that one disagree.
 *
 * The source's last section — the emergency appendix — is not here on purpose. It is a quiz with
 * right and wrong answers about emergencies, which cannot live inside a site whose whole contract is
 * that there is no score and no verdict, and `question-packs/README.md` requires medical review
 * before that material is promoted to any runtime.
 */
import { definePack, PACK_SURFACE } from "./pack-schema.js";

export const later100Pack = definePack({
  id: "later-100",
  surface: PACK_SURFACE.site,
  audience: "couple",
  version: "2026-09-28",
  locale: "ko-KR",
  title: "노후 100제",
  sections: [
  { id: "s01", title: "은퇴라는 말 앞에서", blurb: "언제 그만둘지, 그만둔 뒤 나를 무엇이라 부를지. 은퇴를 그리는 방식에 두 사람이 일에서 무엇을 얻어 왔는지 보여요." },
  { id: "s02", title: "하루가 길어질 때", blurb: "같은 집, 긴 하루. 공간과 시간을 어떻게 나누는지에 두 사람의 거리감이 보여요." },
  { id: "s03", title: "통장의 남은 날들", blurb: "연금, 생활비, 자식에게 줄 돈. 남은 돈을 어떻게 나누고 쓰는지에 두 사람의 우선순위가 보여요." },
  { id: "s04", title: "몸이 먼저 말할 때", blurb: "검진, 약, 습관, 서로 돌보기. 몸이 보내는 신호를 어떻게 다루는지에 두 사람의 태도가 보여요." },
  { id: "s05", title: "우리가 살 집", blurb: "이사, 축소, 가족 근처, 시니어 주택. 어디에서 늙어 갈지에 두 사람의 안전과 자유가 보여요." },
  { id: "s06", title: "자식과 손주 사이", blurb: "손주 돌봄, 자녀의 위기, 명절, 부양 기대. 자녀가 있는 두 사람이 자식 곁에서 얼마나 물러설지에 경계가 보여요." },
  { id: "s07", title: "늙어 가는 부모, 늙어 가는 우리", blurb: "부모 돌봄, 형제, 요양비. 위 세대를 돌보는 방식에 두 사람이 자기 노후를 어떻게 보는지 보여요." },
  { id: "s08", title: "혼자 남을 날을 위해", blurb: "서류, 비밀번호, 장례, 재혼. 먼저 떠날 날을 미리 말할 수 있는지에 두 사람의 용기가 보여요." },
  { id: "s09", title: "돌봄과 존엄", blurb: "요양, 치매, 연명치료. 스스로를 돌볼 수 없을 때를 어떻게 준비하는지에 두 사람의 존엄이 보여요." },
  { id: "s10", title: "마지막까지 우리답게", blurb: "친밀감, 친구, 신앙, 약속. 늙어 가는 두 사람이 무엇을 끝까지 지키고 싶은지 보여요." }
  ],
  questions: [
  {
    id: "l100-s01-01",
    sectionId: "s01",
    title: "은퇴 시점은 무엇을 기준으로 정할까요?",
    example: "한 사람은 정년까지 채우고 싶고, 다른 사람은 몇 년이라도 빨리 그만두고 둘이 지내고 싶어 합니다.",
    mood: "미소",
    choices: [
      { id: "l100-s01-01-a", label: "회사가 정한 정년까지 채우고 나온다", valueLabel: "정년까지" },
      { id: "l100-s01-01-b", label: "노후 자금이 목표 금액에 닿는 해에 그만둔다", valueLabel: "자금 목표 달성" },
      { id: "l100-s01-01-c", label: "몸이 힘들다고 느끼는 때 미련 없이 그만둔다", valueLabel: "몸이 신호할 때" },
      { id: "l100-s01-01-d", label: "두 사람이 같은 해에 함께 그만둔다", valueLabel: "둘이 같은 해" }
    ]
  },
  {
    id: "l100-s01-02",
    sectionId: "s01",
    title: "배우자의 은퇴 결정에 반대할 때 어떻게 할까요?",
    example: "한 사람이 정년 5년 전에 그만두겠다고 하는데 다른 사람은 불안합니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s01-02-a", label: "반대해도 본인 결정이니 따른다", valueLabel: "본인 결정 존중" },
      { id: "l100-s01-02-b", label: "돈 계산을 함께 해 보고 정한다", valueLabel: "함께 계산" },
      { id: "l100-s01-02-c", label: "1년만 더 다니자고 설득한다", valueLabel: "유예 설득" },
      { id: "l100-s01-02-d", label: "내 불안만 말하고 상대가 정하게 둔다", valueLabel: "불안만 전함" }
    ]
  },
  {
    id: "l100-s01-03",
    sectionId: "s01",
    title: "한 사람이 먼저 은퇴하면 집안일은 어떻게 바뀔까요?",
    example: "한 사람은 퇴직해 집에 있고, 다른 사람은 아직 매일 출근합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s01-03-a", label: "집에 있는 사람이 집안일을 대부분 맡는다", valueLabel: "은퇴자가 맡음" },
      { id: "l100-s01-03-b", label: "지금 나누던 대로 그대로 유지한다", valueLabel: "기존 분담 유지" },
      { id: "l100-s01-03-c", label: "집에 있는 사람이 더 하되 절반은 넘지 않는다", valueLabel: "조금만 더" },
      { id: "l100-s01-03-d", label: "청소·반찬 서비스를 늘려 둘 다 줄인다", valueLabel: "서비스로 대체" }
    ]
  },
  {
    id: "l100-s01-04",
    sectionId: "s01",
    title: "퇴직 후 직함과 인맥이 사라지는 것을 어떻게 받아들일까요?",
    example: "명함이 없어지자 모임에서 나를 소개할 말이 없어 머뭇거렸습니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s01-04-a", label: "새 활동에 들어가 새 역할과 호칭을 만든다", valueLabel: "새 역할 찾기" },
      { id: "l100-s01-04-b", label: "옛 동료 모임을 계속 이어 예전 관계를 지킨다", valueLabel: "옛 관계 유지" },
      { id: "l100-s01-04-c", label: "직함 없는 나에 익숙해질 시간을 그냥 갖는다", valueLabel: "그대로 받아들임" },
      { id: "l100-s01-04-d", label: "배우자와의 관계를 새 중심으로 삼는다", valueLabel: "부부가 중심" }
    ]
  },
  {
    id: "l100-s01-05",
    sectionId: "s01",
    title: "은퇴 뒤 하루 일과를 얼마나 정해 둘까요?",
    example: "퇴직 첫 달, 배우자가 오전 내내 TV 앞에 앉아 있는 모습이 보입니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s01-05-a", label: "출근하듯 아침부터 시간표를 만든다", valueLabel: "시간표대로" },
      { id: "l100-s01-05-b", label: "주 단위로 큰 활동 두세 개만 정한다", valueLabel: "주간 계획만" },
      { id: "l100-s01-05-c", label: "정하지 않고 흘러가는 대로 산다", valueLabel: "계획 없이" },
      { id: "l100-s01-05-d", label: "배우자 일정에 맞춰 움직인다", valueLabel: "상대에 맞춤" }
    ]
  },
  {
    id: "l100-s01-06",
    sectionId: "s01",
    title: "은퇴 후 배우자와 시간을 얼마나 함께 쓰고 싶나요?",
    example: "한 사람은 어디든 같이 다니고 싶고, 다른 사람은 낮에는 각자 지내고 싶어 합니다.",
    mood: "안도",
    choices: [
      { id: "l100-s01-06-a", label: "외출도 식사도 대부분 함께한다", valueLabel: "대부분 함께" },
      { id: "l100-s01-06-b", label: "오전은 각자, 오후와 저녁은 함께한다", valueLabel: "반나절씩" },
      { id: "l100-s01-06-c", label: "식사만 함께하고 나머지는 각자 보낸다", valueLabel: "식사만 함께" },
      { id: "l100-s01-06-d", label: "주말처럼 정해 둔 날만 함께한다", valueLabel: "정한 날만" }
    ]
  },
  {
    id: "l100-s01-07",
    sectionId: "s01",
    title: "은퇴 후 배우자가 무기력해 보이면 어떻게 할까요?",
    example: "퇴직 반년째, 배우자가 하루 종일 누워 있고 말수가 줄었습니다.",
    mood: "안도",
    choices: [
      { id: "l100-s01-07-a", label: "함께 나갈 일을 만들어 끌어낸다", valueLabel: "함께 끌어냄" },
      { id: "l100-s01-07-b", label: "힘든지 직접 묻고 들어 준다", valueLabel: "묻고 듣기" },
      { id: "l100-s01-07-c", label: "자녀나 친구가 연락하게 한다", valueLabel: "주변 연결" },
      { id: "l100-s01-07-d", label: "시간이 필요하니 그냥 둔다", valueLabel: "기다림" }
    ]
  },
  {
    id: "l100-s01-08",
    sectionId: "s01",
    title: "은퇴 후 우리의 계획을 자녀에게 얼마나 알릴까요?",
    example: "자녀가 은퇴하고 뭐 하실 거냐고 묻습니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s01-08-a", label: "돈·집·건강 계획을 모두 공유한다", valueLabel: "전부 공유" },
      { id: "l100-s01-08-b", label: "이사 같은 큰 결정만 알린다", valueLabel: "큰 것만" },
      { id: "l100-s01-08-c", label: "물어볼 때만 답한다", valueLabel: "물으면 답함" },
      { id: "l100-s01-08-d", label: "우리 일이니 알리지 않는다", valueLabel: "알리지 않음" }
    ]
  },
  {
    id: "l100-s01-09",
    sectionId: "s01",
    title: "은퇴 후 첫 1년에 꼭 하고 싶은 한 가지는 무엇인가요?",
    example: "퇴직금이 들어왔고, 처음으로 시간이 온전히 두 사람의 것이 됐습니다.",
    mood: "희망",
    choices: [
      { id: "l100-s01-09-a", label: "한 달 이상 긴 여행을 떠난다", valueLabel: "긴 여행" },
      { id: "l100-s01-09-b", label: "집을 정리하고 필요하면 이사한다", valueLabel: "집 정리" },
      { id: "l100-s01-09-c", label: "미뤄 둔 건강 관리와 치료를 마친다", valueLabel: "건강 회복" },
      { id: "l100-s01-09-d", label: "가족·손주와 보내는 시간을 늘린다", valueLabel: "가족과 시간" }
    ]
  },
  {
    id: "l100-s01-10",
    sectionId: "s01",
    title: "은퇴가 두 사람 관계에 무엇을 바꿀 것 같나요?",
    example: "이제 하루 종일 같은 집에서 서로를 보게 됩니다.",
    mood: "여운",
    choices: [
      { id: "l100-s01-10-a", label: "같이 있는 시간만큼 더 가까워질 것이다", valueLabel: "더 가까워짐" },
      { id: "l100-s01-10-b", label: "부딪히는 일이 늘어 다툼이 잦아질 것이다", valueLabel: "다툼 늘어남" },
      { id: "l100-s01-10-c", label: "각자의 공간과 시간이 더 필요해질 것이다", valueLabel: "거리 필요" },
      { id: "l100-s01-10-d", label: "지금과 크게 다르지 않을 것이다", valueLabel: "지금과 비슷" }
    ]
  },
  {
    id: "l100-s02-01",
    sectionId: "s02",
    title: "집 안에서 각자의 공간을 어떻게 둘까요?",
    example: "한 사람이 작은방을 자기 서재로 쓰고 싶다고 합니다.",
    mood: "미소",
    choices: [
      { id: "l100-s02-01-a", label: "각자 방을 하나씩 갖는다", valueLabel: "각자 방" },
      { id: "l100-s02-01-b", label: "방은 없어도 책상이나 의자 하나는 각자 둔다", valueLabel: "자리만 각자" },
      { id: "l100-s02-01-c", label: "공간은 함께 쓰고 시간대로 나눈다", valueLabel: "시간대로 나눔" },
      { id: "l100-s02-01-d", label: "따로 두지 않고 모두 함께 쓴다", valueLabel: "전부 공유" }
    ]
  },
  {
    id: "l100-s02-02",
    sectionId: "s02",
    title: "삼시세끼는 누가 차릴까요?",
    example: "은퇴 뒤 하루 세 끼를 모두 집에서 먹게 되자 한 사람이 부엌에서 나오지 못합니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s02-02-a", label: "지금까지 하던 사람이 계속 차린다", valueLabel: "하던 대로" },
      { id: "l100-s02-02-b", label: "아침은 A, 저녁은 B처럼 끼니를 나눈다", valueLabel: "끼니 분담" },
      { id: "l100-s02-02-c", label: "각자 알아서 챙겨 먹는다", valueLabel: "각자 해결" },
      { id: "l100-s02-02-d", label: "반찬 배달과 외식으로 부엌 일을 줄인다", valueLabel: "배달·외식" }
    ]
  },
  {
    id: "l100-s02-03",
    sectionId: "s02",
    title: "TV·스마트폰 사용 시간을 서로 어디까지 간섭할까요?",
    example: "배우자가 하루 여섯 시간 넘게 TV 앞에 있는 것이 걱정됩니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s02-03-a", label: "걱정되면 그때그때 말한다", valueLabel: "볼 때마다 말함" },
      { id: "l100-s02-03-b", label: "밤 10시 이후에는 끄기로 함께 정한다", valueLabel: "함께 규칙" },
      { id: "l100-s02-03-c", label: "각자의 자유로 두고 말하지 않는다", valueLabel: "간섭 없음" },
      { id: "l100-s02-03-d", label: "함께 볼 프로그램을 정해 같이 본다", valueLabel: "같이 보기" }
    ]
  },
  {
    id: "l100-s02-04",
    sectionId: "s02",
    title: "친구 모임과 외출은 각자 얼마나 자유롭게 할까요?",
    example: "한 사람은 매일 나가고, 다른 사람은 일주일 내내 집에만 있습니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s02-04-a", label: "각자 원하는 만큼 자유롭게 나간다", valueLabel: "완전 자유" },
      { id: "l100-s02-04-b", label: "저녁은 집에서 함께 먹는 조건으로 자유", valueLabel: "저녁만 함께" },
      { id: "l100-s02-04-c", label: "주 몇 회까지로 횟수를 정한다", valueLabel: "횟수 정함" },
      { id: "l100-s02-04-d", label: "되도록 함께 나가고 따로는 줄인다", valueLabel: "함께 외출" }
    ]
  },
  {
    id: "l100-s02-05",
    sectionId: "s02",
    title: "잠자리를 따로 하는 것을 어떻게 정할까요?",
    example: "코골이와 취침 시간 차이로 둘 다 몇 달째 잠을 설칩니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s02-05-a", label: "각방을 쓰고 아침에 만난다", valueLabel: "각방" },
      { id: "l100-s02-05-b", label: "같은 방에서 침대만 따로 둔다", valueLabel: "침대만 분리" },
      { id: "l100-s02-05-c", label: "함께 자되 힘든 날만 따로 잔다", valueLabel: "힘든 날만 따로" },
      { id: "l100-s02-05-d", label: "불편해도 끝까지 같이 잔다", valueLabel: "끝까지 함께" }
    ]
  },
  {
    id: "l100-s02-06",
    sectionId: "s02",
    title: "술·담배 같은 건강에 안 좋은 습관을 서로 얼마나 말할까요?",
    example: "배우자가 저녁마다 혼자 술을 마시는 것이 걱정됩니다.",
    mood: "안도",
    choices: [
      { id: "l100-s02-06-a", label: "볼 때마다 말한다", valueLabel: "매번 말함" },
      { id: "l100-s02-06-b", label: "건강검진 결과가 나쁠 때만 말한다", valueLabel: "검진 결과로" },
      { id: "l100-s02-06-c", label: "한 번 진지하게 말하고 본인에게 맡긴다", valueLabel: "한 번만 말함" },
      { id: "l100-s02-06-d", label: "본인 인생이니 말하지 않는다", valueLabel: "간섭 없음" }
    ]
  },
  {
    id: "l100-s02-07",
    sectionId: "s02",
    title: "반려동물을 새로 들일지 어떻게 정할까요?",
    example: "자식들이 떠난 집이 조용해 강아지를 들이자는 말이 나왔습니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s02-07-a", label: "둘 다 건강할 때 지금 들인다", valueLabel: "지금 들임" },
      { id: "l100-s02-07-b", label: "나이를 생각해 작은 동물이나 노령견을 들인다", valueLabel: "작은 동물" },
      { id: "l100-s02-07-c", label: "우리가 못 돌볼 때 맡을 사람을 정한 뒤 들인다", valueLabel: "돌봄 계획 뒤" },
      { id: "l100-s02-07-d", label: "끝까지 책임지기 어려우니 들이지 않는다", valueLabel: "들이지 않음" }
    ]
  },
  {
    id: "l100-s02-08",
    sectionId: "s02",
    title: "하루 중 대화 시간을 어떻게 만들까요?",
    example: "종일 같은 집에 있지만 정작 하루에 나누는 말이 몇 마디 없습니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s02-08-a", label: "저녁 식사 뒤 30분은 TV 없이 이야기한다", valueLabel: "저녁 30분" },
      { id: "l100-s02-08-b", label: "아침 산책을 함께하며 이야기한다", valueLabel: "산책하며" },
      { id: "l100-s02-08-c", label: "따로 정하지 않고 자연스럽게 둔다", valueLabel: "자연스럽게" },
      { id: "l100-s02-08-d", label: "주말에 한 번 길게 이야기한다", valueLabel: "주 1회 길게" }
    ]
  },
  {
    id: "l100-s02-09",
    sectionId: "s02",
    title: "함께 새로 시작할 취미를 무엇으로 할까요?",
    example: "둘이 같이 할 수 있는 것이 하나도 없다는 것을 문득 깨달았습니다.",
    mood: "희망",
    choices: [
      { id: "l100-s02-09-a", label: "걷기·등산·골프 같은 운동을 함께한다", valueLabel: "함께 운동" },
      { id: "l100-s02-09-b", label: "여행을 함께 계획하고 다닌다", valueLabel: "함께 여행" },
      { id: "l100-s02-09-c", label: "요리·악기·외국어를 함께 배운다", valueLabel: "함께 배우기" },
      { id: "l100-s02-09-d", label: "같은 취미는 없어도 되니 각자 한다", valueLabel: "각자 취미" }
    ]
  },
  {
    id: "l100-s02-10",
    sectionId: "s02",
    title: "배우자가 큰 계획을 혼자 정해 오면 어떻게 할까요?",
    example: "한 사람이 상의 없이 한 달짜리 해외여행을 예약하고 통보했습니다.",
    mood: "솔직함",
    choices: [
      { id: "l100-s02-10-a", label: "이번엔 따르고 다음부터 상의하자고 한다", valueLabel: "이번만 수용" },
      { id: "l100-s02-10-b", label: "취소하고 처음부터 함께 다시 정한다", valueLabel: "다시 정함" },
      { id: "l100-s02-10-c", label: "나는 안 가고 혼자 다녀오게 한다", valueLabel: "혼자 가게 둠" },
      { id: "l100-s02-10-d", label: "기꺼이 따라간다", valueLabel: "기꺼이 따름" }
    ]
  },
  {
    id: "l100-s03-01",
    sectionId: "s03",
    title: "배우자가 자녀에게 돈을 더 주는 것 같을 때 어떻게 할까요?",
    example: "한 사람이 몰래 딸에게 몇 달째 용돈을 보내고 있었습니다.",
    mood: "미소",
    choices: [
      { id: "l100-s03-01-a", label: "금액과 기간을 함께 정하자고 한다", valueLabel: "함께 정하기" },
      { id: "l100-s03-01-b", label: "서운함을 말하고 상대 뜻에 맡긴다", valueLabel: "말하고 맡김" },
      { id: "l100-s03-01-c", label: "나도 같은 금액을 다른 자녀에게 준다", valueLabel: "똑같이 맞춤" },
      { id: "l100-s03-01-d", label: "모른 척 넘긴다", valueLabel: "모른 척" }
    ]
  },
  {
    id: "l100-s03-02",
    sectionId: "s03",
    title: "연금과 자산을 누가 어떻게 관리할까요?",
    example: "지금까지 한 사람이 돈을 관리해 다른 사람은 잔고도 모릅니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s03-02-a", label: "지금처럼 한 사람이 관리한다", valueLabel: "한 사람 관리" },
      { id: "l100-s03-02-b", label: "둘 다 볼 수 있게 공동으로 관리한다", valueLabel: "공동 관리" },
      { id: "l100-s03-02-c", label: "각자 자기 몫을 따로 관리한다", valueLabel: "각자 관리" },
      { id: "l100-s03-02-d", label: "자녀나 전문가에게 맡긴다", valueLabel: "외부 위탁" }
    ]
  },
  {
    id: "l100-s03-03",
    sectionId: "s03",
    title: "각자 자유롭게 쓸 용돈은 어떻게 정할까요?",
    example: "한 사람의 취미 지출이 매달 늘어 다른 사람이 눈치를 줍니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s03-03-a", label: "같은 금액을 각자 쓴다", valueLabel: "같은 금액" },
      { id: "l100-s03-03-b", label: "소득을 더 낸 사람이 더 쓴다", valueLabel: "기여만큼" },
      { id: "l100-s03-03-c", label: "정하지 않고 필요할 때 쓴다", valueLabel: "정하지 않음" },
      { id: "l100-s03-03-d", label: "큰 지출만 서로 말하고 나머지는 자유", valueLabel: "큰 것만 말함" }
    ]
  },
  {
    id: "l100-s03-04",
    sectionId: "s03",
    title: "자녀나 가까운 가족의 결혼·주택 자금을 얼마나 지원할까요?",
    example: "아들이 전세금 5천만 원을 보태 달라고 합니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s03-04-a", label: "노후 자금을 지키고 지원하지 않는다", valueLabel: "지원 안 함" },
      { id: "l100-s03-04-b", label: "미리 정한 한도 안에서만 지원한다", valueLabel: "한도 안에서" },
      { id: "l100-s03-04-c", label: "빌려주고 돌려받기로 한다", valueLabel: "빌려줌" },
      { id: "l100-s03-04-d", label: "집을 줄여서라도 지원한다", valueLabel: "최대한 지원" }
    ]
  },
  {
    id: "l100-s03-05",
    sectionId: "s03",
    title: "자녀나 가족이 생활비를 보태겠다고 하면 어떻게 할까요?",
    example: "딸이 매달 30만 원씩 용돈을 보내겠다고 합니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s03-05-a", label: "마음만 받고 돈은 돌려보낸다", valueLabel: "받지 않음" },
      { id: "l100-s03-05-b", label: "주면 받되 먼저 요구하지 않는다", valueLabel: "주면 받음" },
      { id: "l100-s03-05-c", label: "필요할 때만 부탁한다", valueLabel: "필요할 때 부탁" },
      { id: "l100-s03-05-d", label: "정기적으로 받기로 한다", valueLabel: "정기적으로" }
    ]
  },
  {
    id: "l100-s03-06",
    sectionId: "s03",
    title: "차·여행·의료처럼 큰돈이 드는 지출은 어떻게 정할까요?",
    example: "한 사람이 3천만 원짜리 새 차를 사자고 합니다.",
    mood: "안도",
    choices: [
      { id: "l100-s03-06-a", label: "두 사람이 합의해야 쓴다", valueLabel: "합의 필수" },
      { id: "l100-s03-06-b", label: "500만 원 같은 기준 이상만 상의한다", valueLabel: "금액 기준" },
      { id: "l100-s03-06-c", label: "각자 자기 돈이면 자유롭게 쓴다", valueLabel: "각자 자유" },
      { id: "l100-s03-06-d", label: "자녀와도 상의한 뒤 정한다", valueLabel: "자녀와 상의" }
    ]
  },
  {
    id: "l100-s03-07",
    sectionId: "s03",
    title: "형제·친척 경조사비 기준을 어떻게 맞출까요?",
    example: "배우자 쪽 조카 결혼에 얼마를 낼지 의견이 다릅니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s03-07-a", label: "양가에 똑같은 기준표를 만든다", valueLabel: "양가 동일 기준" },
      { id: "l100-s03-07-b", label: "각자 자기 쪽은 자기가 정한다", valueLabel: "각자 자기 쪽" },
      { id: "l100-s03-07-c", label: "관계 깊이에 따라 그때그때 정한다", valueLabel: "관계별로" },
      { id: "l100-s03-07-d", label: "형편이 어려우니 최소로 통일한다", valueLabel: "최소로 통일" }
    ]
  },
  {
    id: "l100-s03-08",
    sectionId: "s03",
    title: "배우자가 형제에게 빌려준 돈을 뒤늦게 알면 어떻게 할까요?",
    example: "배우자가 상의 없이 동생에게 2천만 원을 빌려준 것을 알게 됐습니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s03-08-a", label: "앞으로는 반드시 상의하자고 약속받는다", valueLabel: "상의 약속" },
      { id: "l100-s03-08-b", label: "돌려받을 계획을 함께 세운다", valueLabel: "회수 계획" },
      { id: "l100-s03-08-c", label: "그 형제에게 내가 직접 이야기한다", valueLabel: "직접 이야기" },
      { id: "l100-s03-08-d", label: "이미 벌어진 일이니 넘긴다", valueLabel: "넘김" }
    ]
  },
  {
    id: "l100-s03-09",
    sectionId: "s03",
    title: "상속과 증여를 언제 어떻게 정해 둘까요?",
    example: "자녀 둘이 집 문제로 벌써 신경전을 벌입니다.",
    mood: "희망",
    choices: [
      { id: "l100-s03-09-a", label: "지금 유언장을 써서 정해 둔다", valueLabel: "유언장 작성" },
      { id: "l100-s03-09-b", label: "살아 있을 때 미리 나눠 증여한다", valueLabel: "사전 증여" },
      { id: "l100-s03-09-c", label: "우리가 다 쓰고 남는 것만 준다", valueLabel: "남는 것만" },
      { id: "l100-s03-09-d", label: "자녀들이 알아서 나누게 둔다", valueLabel: "자녀에게 맡김" }
    ]
  },
  {
    id: "l100-s03-10",
    sectionId: "s03",
    title: "우리 돈을 자녀와 형제 중 어디에 먼저 쓸까요?",
    example: "딸의 이사 비용과 동생의 수술비 부탁이 같은 달에 왔습니다.",
    mood: "여운",
    choices: [
      { id: "l100-s03-10-a", label: "자녀가 먼저다", valueLabel: "자녀 먼저" },
      { id: "l100-s03-10-b", label: "더 급한 쪽이 먼저다", valueLabel: "급한 쪽 먼저" },
      { id: "l100-s03-10-c", label: "우리 노후가 먼저라 둘 다 최소로 한다", valueLabel: "우리 먼저" },
      { id: "l100-s03-10-d", label: "배우자 쪽 부탁은 배우자가 정한다", valueLabel: "각자 쪽 결정" }
    ]
  },
  {
    id: "l100-s04-01",
    sectionId: "s04",
    title: "건강검진 결과를 서로 얼마나 공유할까요?",
    example: "검진 결과지가 왔는데 배우자가 보여 주지 않고 서랍에 넣었습니다.",
    mood: "미소",
    choices: [
      { id: "l100-s04-01-a", label: "결과지를 통째로 서로 보여 준다", valueLabel: "전부 공유" },
      { id: "l100-s04-01-b", label: "이상 소견이 있을 때만 말한다", valueLabel: "이상만 공유" },
      { id: "l100-s04-01-c", label: "물어보면 말한다", valueLabel: "물으면 공유" },
      { id: "l100-s04-01-d", label: "각자 알아서 관리한다", valueLabel: "각자 관리" }
    ]
  },
  {
    id: "l100-s04-02",
    sectionId: "s04",
    title: "병원에 얼마나 함께 갈까요?",
    example: "큰 검사 예약이 잡혔는데 배우자는 혼자 가겠다고 합니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s04-02-a", label: "모든 진료에 함께 간다", valueLabel: "매번 동행" },
      { id: "l100-s04-02-b", label: "큰 검사나 결과 듣는 날만 함께 간다", valueLabel: "큰 날만" },
      { id: "l100-s04-02-c", label: "요청할 때만 함께 간다", valueLabel: "요청 시만" },
      { id: "l100-s04-02-d", label: "각자 가고 결과만 서로 말한다", valueLabel: "각자 감" }
    ]
  },
  {
    id: "l100-s04-03",
    sectionId: "s04",
    title: "운동을 서로에게 얼마나 권할까요?",
    example: "한 사람은 매일 만 보를 걷고, 다른 사람은 소파에서 일어나지 않습니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s04-03-a", label: "함께 하자고 매일 권한다", valueLabel: "매일 권함" },
      { id: "l100-s04-03-b", label: "같이 할 때만 함께하고 강요하지 않는다", valueLabel: "함께할 때만" },
      { id: "l100-s04-03-c", label: "의사가 말하면 그때 권한다", valueLabel: "의사 권고 뒤" },
      { id: "l100-s04-03-d", label: "각자 알아서 하게 둔다", valueLabel: "각자 알아서" }
    ]
  },
  {
    id: "l100-s04-04",
    sectionId: "s04",
    title: "혈압약 같은 만성질환 관리는 누가 챙길까요?",
    example: "배우자가 혈압약을 일주일에 두세 번 빼먹습니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s04-04-a", label: "본인이 챙기고 간섭하지 않는다", valueLabel: "본인 책임" },
      { id: "l100-s04-04-b", label: "배우자가 매일 확인한다", valueLabel: "배우자 확인" },
      { id: "l100-s04-04-c", label: "약 알림과 요일 약통으로 챙긴다", valueLabel: "도구로 관리" },
      { id: "l100-s04-04-d", label: "자녀가 전화로 확인한다", valueLabel: "자녀 확인" }
    ]
  },
  {
    id: "l100-s04-05",
    sectionId: "s04",
    title: "건강 상태를 자녀나 가족에게 어디까지 알릴까요?",
    example: "암 검사 결과를 기다리는데 자녀에게 말할지 망설여집니다.",
    mood: "조심스러움",
    choices: [
      { id: "l100-s04-05-a", label: "검사 단계부터 모두 알린다", valueLabel: "처음부터" },
      { id: "l100-s04-05-b", label: "결과가 확정된 뒤 알린다", valueLabel: "확정 뒤" },
      { id: "l100-s04-05-c", label: "치료가 필요할 때만 알린다", valueLabel: "치료 필요 시" },
      { id: "l100-s04-05-d", label: "두 사람만 알고 넘긴다", valueLabel: "둘만 앎" }
    ]
  },
  {
    id: "l100-s04-06",
    sectionId: "s04",
    title: "배우자가 아프다고 할 때 어디까지 믿고 움직일까요?",
    example: "배우자가 자주 아프다고 하는데 병원에서는 이상이 없다고 합니다.",
    mood: "안도",
    choices: [
      { id: "l100-s04-06-a", label: "말하면 그대로 믿고 함께 병원에 간다", valueLabel: "그대로 믿음" },
      { id: "l100-s04-06-b", label: "증상을 적어 두고 반복되면 병원에 간다", valueLabel: "기록 뒤 판단" },
      { id: "l100-s04-06-c", label: "다른 병원에서 다시 검사받게 한다", valueLabel: "재검사" },
      { id: "l100-s04-06-d", label: "마음의 문제인지 먼저 이야기한다", valueLabel: "마음부터 묻기" }
    ]
  },
  {
    id: "l100-s04-07",
    sectionId: "s04",
    title: "배우자의 우울 신호를 누가 어떻게 꺼낼까요?",
    example: "배우자가 잠을 못 자고 좋아하던 모임도 그만뒀습니다.",
    mood: "조심스러움",
    choices: [
      { id: "l100-s04-07-a", label: "알아챈 쪽이 바로 말을 꺼낸다", valueLabel: "바로 꺼냄" },
      { id: "l100-s04-07-b", label: "자녀에게 대신 말하게 한다", valueLabel: "자녀 통해" },
      { id: "l100-s04-07-c", label: "검진에 함께 가서 의사 앞에서 꺼낸다", valueLabel: "의사 앞에서" },
      { id: "l100-s04-07-d", label: "본인이 말할 때까지 기다린다", valueLabel: "기다림" }
    ]
  },
  {
    id: "l100-s04-08",
    sectionId: "s04",
    title: "치매 검사를 언제 받을까요?",
    example: "배우자가 물건 둔 곳을 자주 잊고 같은 질문을 반복합니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s04-08-a", label: "지금 기본 검사부터 받는다", valueLabel: "지금 받음" },
      { id: "l100-s04-08-b", label: "65세부터 정기적으로 받는다", valueLabel: "정기 검사" },
      { id: "l100-s04-08-c", label: "증상이 뚜렷해지면 받는다", valueLabel: "증상 뒤" },
      { id: "l100-s04-08-d", label: "받지 않고 몸으로 낸다", valueLabel: "받지 않음" }
    ]
  },
  {
    id: "l100-s04-09",
    sectionId: "s04",
    title: "배우자에게 운전을 그만두라고 어떻게 말할까요?",
    example: "배우자가 주차 중 두 번 긁었는데 본인은 괜찮다고 합니다.",
    mood: "희망",
    choices: [
      { id: "l100-s04-09-a", label: "사고 이야기를 하며 그만두자고 직접 말한다", valueLabel: "직접 말함" },
      { id: "l100-s04-09-b", label: "의사나 자녀가 말하게 한다", valueLabel: "주변이 말함" },
      { id: "l100-s04-09-c", label: "내가 운전을 다 맡겠다고 제안한다", valueLabel: "대신 운전" },
      { id: "l100-s04-09-d", label: "본인이 느낄 때까지 기다린다", valueLabel: "기다림" }
    ]
  },
  {
    id: "l100-s04-10",
    sectionId: "s04",
    title: "건강 때문에 부부 관계가 달라지면 어떻게 이야기할까요?",
    example: "수술 뒤 잠자리가 사라졌지만 둘 다 말을 꺼내지 못합니다.",
    mood: "솔직함",
    choices: [
      { id: "l100-s04-10-a", label: "느끼는 쪽이 먼저 솔직하게 말한다", valueLabel: "먼저 말함" },
      { id: "l100-s04-10-b", label: "의사에게 함께 묻는다", valueLabel: "의사와 함께" },
      { id: "l100-s04-10-c", label: "잠자리 대신 다른 스킨십을 늘린다", valueLabel: "다른 방식" },
      { id: "l100-s04-10-d", label: "자연스럽게 두고 말하지 않는다", valueLabel: "말하지 않음" }
    ]
  },
  {
    id: "l100-s05-01",
    sectionId: "s05",
    title: "지금 집에서 계속 살지 어떻게 정할까요?",
    example: "계단이 많은 집이 무릎 때문에 점점 힘들어집니다.",
    mood: "미소",
    choices: [
      { id: "l100-s05-01-a", label: "불편해도 지금 집에서 계속 산다", valueLabel: "계속 산다" },
      { id: "l100-s05-01-b", label: "계단과 욕실을 고쳐서 계속 산다", valueLabel: "고쳐서" },
      { id: "l100-s05-01-c", label: "같은 동네 작은 집으로 옮긴다", valueLabel: "동네 안 축소" },
      { id: "l100-s05-01-d", label: "새 동네로 옮긴다", valueLabel: "새 동네" }
    ]
  },
  {
    id: "l100-s05-02",
    sectionId: "s05",
    title: "자녀나 가까운 가족 근처로 이사하는 것을 어떻게 생각하나요?",
    example: "자녀가 자기 동네로 오라고 합니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s05-02-a", label: "가족 근처로 옮긴다", valueLabel: "가족 근처로" },
      { id: "l100-s05-02-b", label: "오려면 자녀가 오는 게 맞다", valueLabel: "자녀가 오기" },
      { id: "l100-s05-02-c", label: "지금 동네 친구가 더 중요하다", valueLabel: "지금 동네" },
      { id: "l100-s05-02-d", label: "둘 다 원할 때만 간다", valueLabel: "둘 다 원해야" }
    ]
  },
  {
    id: "l100-s05-03",
    sectionId: "s05",
    title: "시골이나 지방으로 내려가는 것을 어떻게 생각하나요?",
    example: "한 사람은 텃밭 있는 전원생활을, 다른 사람은 병원 가까운 도시를 원합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s05-03-a", label: "시골로 내려가 텃밭을 가꾼다", valueLabel: "전원생활" },
      { id: "l100-s05-03-b", label: "도시에 남는다", valueLabel: "도시 생활" },
      { id: "l100-s05-03-c", label: "반은 시골, 반은 도시에서 산다", valueLabel: "반반 생활" },
      { id: "l100-s05-03-d", label: "몇 년 살아 보고 정한다", valueLabel: "살아 보고" }
    ]
  },
  {
    id: "l100-s05-04",
    sectionId: "s05",
    title: "시니어 주택이나 실버타운을 언제 고려할까요?",
    example: "지인이 실버타운에 들어가 편하다고 권합니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s05-04-a", label: "건강할 때 미리 들어간다", valueLabel: "건강할 때" },
      { id: "l100-s05-04-b", label: "혼자 되거나 아플 때 들어간다", valueLabel: "필요할 때" },
      { id: "l100-s05-04-c", label: "비용이 되면 고려한다", valueLabel: "비용 되면" },
      { id: "l100-s05-04-d", label: "고려하지 않는다", valueLabel: "고려 안 함" }
    ]
  },
  {
    id: "l100-s05-05",
    sectionId: "s05",
    title: "자녀나 형제와 합가하는 것을 어떻게 생각하나요?",
    example: "자녀가 방 하나를 비워 두었다며 함께 살자고 제안했습니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s05-05-a", label: "지금 합쳐서 함께 산다", valueLabel: "합가" },
      { id: "l100-s05-05-b", label: "한 사람이 남으면 합친다", valueLabel: "혼자 되면" },
      { id: "l100-s05-05-c", label: "같은 건물 다른 층 정도로 산다", valueLabel: "가까이 따로" },
      { id: "l100-s05-05-d", label: "합치지 않는다", valueLabel: "따로 산다" }
    ]
  },
  {
    id: "l100-s05-06",
    sectionId: "s05",
    title: "손주나 자녀가 자고 갈 방을 남길까요?",
    example: "집을 줄이면 손주가 올 때 잘 방이 없어집니다.",
    mood: "안도",
    choices: [
      { id: "l100-s05-06-a", label: "방 하나는 손님방으로 남긴다", valueLabel: "방 남김" },
      { id: "l100-s05-06-b", label: "거실에서 자면 된다", valueLabel: "거실로" },
      { id: "l100-s05-06-c", label: "근처 숙소를 잡아 준다", valueLabel: "숙소 이용" },
      { id: "l100-s05-06-d", label: "자고 가는 일 자체를 줄인다", valueLabel: "방문 줄임" }
    ]
  },
  {
    id: "l100-s05-07",
    sectionId: "s05",
    title: "집 정리에서 배우자의 물건을 어떻게 다룰까요?",
    example: "배우자가 30년 된 책과 옷을 못 버리게 합니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s05-07-a", label: "본인 물건은 본인만 버린다", valueLabel: "본인만 처분" },
      { id: "l100-s05-07-b", label: "상자 하나만 남기고 함께 정리한다", valueLabel: "함께 정리" },
      { id: "l100-s05-07-c", label: "내가 정리해도 된다고 미리 합의한다", valueLabel: "위임 합의" },
      { id: "l100-s05-07-d", label: "버리지 않고 창고를 빌린다", valueLabel: "창고 보관" }
    ]
  },
  {
    id: "l100-s05-08",
    sectionId: "s05",
    title: "이사 결정은 누가 하나요?",
    example: "한 사람만 이사를 원하고 다른 사람은 이 집이 좋습니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s05-08-a", label: "둘 다 동의해야 한다", valueLabel: "둘 다 동의" },
      { id: "l100-s05-08-b", label: "지금 집이 더 힘든 쪽이 정한다", valueLabel: "힘든 쪽이" },
      { id: "l100-s05-08-c", label: "집 명의자가 정한다", valueLabel: "명의자가" },
      { id: "l100-s05-08-d", label: "자녀 의견을 참고해 정한다", valueLabel: "자녀 참고" }
    ]
  },
  {
    id: "l100-s05-09",
    sectionId: "s05",
    title: "가족이 우리 집에 와서 지내는 것을 어디까지 허용할까요?",
    example: "동생이 이혼 뒤 몇 달만 지내게 해 달라고 합니다.",
    mood: "희망",
    choices: [
      { id: "l100-s05-09-a", label: "기간을 정해 받는다", valueLabel: "기간 한정" },
      { id: "l100-s05-09-b", label: "배우자가 동의할 때만 받는다", valueLabel: "배우자 동의" },
      { id: "l100-s05-09-c", label: "우리 집은 두 사람만의 공간이다", valueLabel: "거절" },
      { id: "l100-s05-09-d", label: "필요한 만큼 받는다", valueLabel: "제한 없음" }
    ]
  },
  {
    id: "l100-s05-10",
    sectionId: "s05",
    title: "한 사람이 먼저 떠나면 남은 사람은 어디에 살까요?",
    example: "이 집에 혼자 남을 날을 그려 봅니다.",
    mood: "여운",
    choices: [
      { id: "l100-s05-10-a", label: "지금 집에서 계속 산다", valueLabel: "지금 집" },
      { id: "l100-s05-10-b", label: "가족 근처로 옮긴다", valueLabel: "가족 근처" },
      { id: "l100-s05-10-c", label: "시설에 들어간다", valueLabel: "시설" },
      { id: "l100-s05-10-d", label: "그때 형편을 보고 정한다", valueLabel: "그때 정함" }
    ]
  },
  {
    id: "l100-s06-01",
    sectionId: "s06",
    title: "손주 돌봄을 어디까지 맡을까요?",
    example: "딸이 복직을 앞두고 주 3일 손주를 봐 달라고 부탁합니다.",
    mood: "미소",
    choices: [
      { id: "l100-s06-01-a", label: "주 3일 이상 정기적으로 맡는다", valueLabel: "정기 돌봄" },
      { id: "l100-s06-01-b", label: "주 1~2일만 맡고 나머지는 어린이집으로", valueLabel: "일부만" },
      { id: "l100-s06-01-c", label: "급할 때만 맡는다", valueLabel: "급할 때만" },
      { id: "l100-s06-01-d", label: "몸이 힘드니 맡지 않는다", valueLabel: "맡지 않음" }
    ]
  },
  {
    id: "l100-s06-02",
    sectionId: "s06",
    title: "손주 돌봄에 대가를 어떻게 정할까요?",
    example: "사위가 매달 돌봄비를 드리겠다고 합니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s06-02-a", label: "정해진 금액을 받는다", valueLabel: "정액 수령" },
      { id: "l100-s06-02-b", label: "교통비·식비 같은 실비만 받는다", valueLabel: "실비만" },
      { id: "l100-s06-02-c", label: "가족 일이니 받지 않는다", valueLabel: "받지 않음" },
      { id: "l100-s06-02-d", label: "받아서 손주 통장에 넣는다", valueLabel: "손주 통장에" }
    ]
  },
  {
    id: "l100-s06-03",
    sectionId: "s06",
    title: "자녀 부부의 육아 방식에 언제 의견을 말할까요?",
    example: "손주에게 영상을 하루 세 시간씩 보여 주는 것이 마음에 걸립니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s06-03-a", label: "마음에 걸리면 그때 말한다", valueLabel: "걸릴 때 말함" },
      { id: "l100-s06-03-b", label: "물어볼 때만 말한다", valueLabel: "물을 때만" },
      { id: "l100-s06-03-c", label: "안전에 관한 것만 말한다", valueLabel: "안전만" },
      { id: "l100-s06-03-d", label: "그들 방식이니 말하지 않는다", valueLabel: "말하지 않음" }
    ]
  },
  {
    id: "l100-s06-04",
    sectionId: "s06",
    title: "명절과 생일 모임을 어떻게 할까요?",
    example: "자녀들이 명절마다 오기 힘들어하는 눈치입니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s06-04-a", label: "우리 집에서 모인다", valueLabel: "우리 집으로" },
      { id: "l100-s06-04-b", label: "우리가 자녀 집으로 간다", valueLabel: "자녀 집으로" },
      { id: "l100-s06-04-c", label: "외식이나 짧은 여행으로 대신한다", valueLabel: "밖에서 만남" },
      { id: "l100-s06-04-d", label: "안 모여도 된다고 먼저 말한다", valueLabel: "모임 없이" }
    ]
  },
  {
    id: "l100-s06-05",
    sectionId: "s06",
    title: "자녀의 이혼이나 실직 같은 위기에 얼마나 개입할까요?",
    example: "아들이 실직했다는 말을 배우자를 통해 들었습니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s06-05-a", label: "돈과 집으로 적극 돕는다", valueLabel: "적극 지원" },
      { id: "l100-s06-05-b", label: "이야기를 듣고 조언만 한다", valueLabel: "조언만" },
      { id: "l100-s06-05-c", label: "도와 달라고 할 때만 돕는다", valueLabel: "요청할 때만" },
      { id: "l100-s06-05-d", label: "성인이니 개입하지 않는다", valueLabel: "개입 없음" }
    ]
  },
  {
    id: "l100-s06-06",
    sectionId: "s06",
    title: "자녀에게 연락 빈도를 얼마나 기대할까요?",
    example: "아들에게 한 달째 연락이 없어 한 사람이 서운해합니다.",
    mood: "안도",
    choices: [
      { id: "l100-s06-06-a", label: "주 1회 연락은 기대한다", valueLabel: "주 1회 기대" },
      { id: "l100-s06-06-b", label: "기대하지 않고 우리가 먼저 연락한다", valueLabel: "먼저 연락" },
      { id: "l100-s06-06-c", label: "연락은 기대하지 않는다", valueLabel: "기대 없음" },
      { id: "l100-s06-06-d", label: "명절과 생일에만 기대한다", valueLabel: "기념일만" }
    ]
  },
  {
    id: "l100-s06-07",
    sectionId: "s06",
    title: "자녀 집에 갈 때 어떻게 할까요?",
    example: "근처에 살게 되어 반찬을 들고 자주 들르게 됩니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s06-07-a", label: "항상 미리 연락하고 간다", valueLabel: "항상 연락" },
      { id: "l100-s06-07-b", label: "가까우니 그냥 들른다", valueLabel: "그냥 들름" },
      { id: "l100-s06-07-c", label: "초대할 때만 간다", valueLabel: "초대 시만" },
      { id: "l100-s06-07-d", label: "요일을 정해 그날만 간다", valueLabel: "정한 요일만" }
    ]
  },
  {
    id: "l100-s06-08",
    sectionId: "s06",
    title: "자녀 부부 갈등에서 어떤 입장을 취할까요?",
    example: "며느리와 아들이 크게 다퉜다는 말을 들었습니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s06-08-a", label: "내 자식 편을 든다", valueLabel: "자녀 편" },
      { id: "l100-s06-08-b", label: "양쪽 이야기를 다 듣고 중립을 지킨다", valueLabel: "중립" },
      { id: "l100-s06-08-c", label: "부부 일이니 관여하지 않는다", valueLabel: "관여 없음" },
      { id: "l100-s06-08-d", label: "부부 상담을 권한다", valueLabel: "상담 권유" }
    ]
  },
  {
    id: "l100-s06-09",
    sectionId: "s06",
    title: "손주에게 무엇을 물려주고 싶나요?",
    example: "손주가 할아버지는 어렸을 때 뭐 했느냐고 묻습니다.",
    mood: "희망",
    choices: [
      { id: "l100-s06-09-a", label: "돈과 자산을 남긴다", valueLabel: "자산" },
      { id: "l100-s06-09-b", label: "가족 이야기와 기록을 남긴다", valueLabel: "가족 이야기" },
      { id: "l100-s06-09-c", label: "함께 보낸 시간을 남긴다", valueLabel: "함께한 시간" },
      { id: "l100-s06-09-d", label: "가치관과 신앙을 남긴다", valueLabel: "가치관" }
    ]
  },
  {
    id: "l100-s06-10",
    sectionId: "s06",
    title: "자녀가 우리 노후를 얼마나 책임져야 한다고 생각하나요?",
    example: "\"부모 부양\"이라는 말이 저녁 대화에 나왔습니다.",
    mood: "여운",
    choices: [
      { id: "l100-s06-10-a", label: "어느 정도는 책임져야 한다", valueLabel: "일부 책임" },
      { id: "l100-s06-10-b", label: "마음만 있으면 된다", valueLabel: "마음만" },
      { id: "l100-s06-10-c", label: "전혀 책임지지 않아도 된다", valueLabel: "책임 없음" },
      { id: "l100-s06-10-d", label: "우리가 도운 만큼은 돌려받고 싶다", valueLabel: "도운 만큼" }
    ]
  },
  {
    id: "l100-s07-01",
    sectionId: "s07",
    title: "부모님 돌봄은 누가 얼마나 맡을까요?",
    example: "어머니가 혼자 살기 어려워졌다는 연락을 받았습니다.",
    mood: "미소",
    choices: [
      { id: "l100-s07-01-a", label: "우리가 주로 맡는다", valueLabel: "우리가 주로" },
      { id: "l100-s07-01-b", label: "형제와 똑같이 나눈다", valueLabel: "형제와 똑같이" },
      { id: "l100-s07-01-c", label: "돈은 내고 시간은 내지 않는다", valueLabel: "비용만 분담" },
      { id: "l100-s07-01-d", label: "시설에 모시고 방문한다", valueLabel: "시설 돌봄" }
    ]
  },
  {
    id: "l100-s07-02",
    sectionId: "s07",
    title: "부모님이 함께 살자고 하면 어떻게 할까요?",
    example: "아버지가 혼자 지내기 외롭다며 함께 살자고 하십니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s07-02-a", label: "우리 집에 모신다", valueLabel: "모심" },
      { id: "l100-s07-02-b", label: "가까이 살되 따로 산다", valueLabel: "가까이 따로" },
      { id: "l100-s07-02-c", label: "시설이나 도우미를 알아본다", valueLabel: "외부 돌봄" },
      { id: "l100-s07-02-d", label: "못 모신다고 분명히 말한다", valueLabel: "거절" }
    ]
  },
  {
    id: "l100-s07-03",
    sectionId: "s07",
    title: "배우자 부모 돌봄에 얼마나 참여할까요?",
    example: "장모님이 입원해 간병할 사람이 필요합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s07-03-a", label: "내 부모처럼 똑같이 한다", valueLabel: "똑같이" },
      { id: "l100-s07-03-b", label: "배우자가 원하는 만큼만 한다", valueLabel: "배우자 뜻대로" },
      { id: "l100-s07-03-c", label: "돈만 내고 몸은 쓰지 않는다", valueLabel: "비용만" },
      { id: "l100-s07-03-d", label: "각자 자기 부모를 맡는다", valueLabel: "각자 부모" }
    ]
  },
  {
    id: "l100-s07-04",
    sectionId: "s07",
    title: "부모 요양비를 우리 노후 자금에서 어디까지 낼까요?",
    example: "요양원비가 월 200만 원인데 부모님 연금은 60만 원입니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s07-04-a", label: "우리 노후 자금에서 낸다", valueLabel: "우리가 부담" },
      { id: "l100-s07-04-b", label: "형제와 나눠서 낸다", valueLabel: "형제 분담" },
      { id: "l100-s07-04-c", label: "부모 자산으로만 낸다", valueLabel: "부모 자산만" },
      { id: "l100-s07-04-d", label: "우리 노후를 지키고 못 낸다고 말한다", valueLabel: "부담 거절" }
    ]
  },
  {
    id: "l100-s07-05",
    sectionId: "s07",
    title: "형제와 돌봄 부담이 다르면 어떻게 할까요?",
    example: "오빠는 돈도 시간도 내지 않고 우리만 병원을 오갑니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s07-05-a", label: "직접 분담을 요구한다", valueLabel: "직접 요구" },
      { id: "l100-s07-05-b", label: "상속에서 반영하자고 한다", valueLabel: "상속 반영" },
      { id: "l100-s07-05-c", label: "말하지 않고 우리가 감당한다", valueLabel: "말없이 감당" },
      { id: "l100-s07-05-d", label: "그 형제와 관계를 줄인다", valueLabel: "거리 두기" }
    ]
  },
  {
    id: "l100-s07-06",
    sectionId: "s07",
    title: "부모님 치매가 시작되면 무엇을 먼저 할까요?",
    example: "어머니가 같은 말을 반복하고 약속을 잊습니다.",
    mood: "안도",
    choices: [
      { id: "l100-s07-06-a", label: "병원 검사부터 받게 한다", valueLabel: "검사 먼저" },
      { id: "l100-s07-06-b", label: "장기요양 신청부터 한다", valueLabel: "요양 신청 먼저" },
      { id: "l100-s07-06-c", label: "함께 사는 방법부터 찾는다", valueLabel: "동거 먼저" },
      { id: "l100-s07-06-d", label: "조금 더 지켜본다", valueLabel: "지켜봄" }
    ]
  },
  {
    id: "l100-s07-07",
    sectionId: "s07",
    title: "부모님 재산과 상속을 형제와 언제 이야기할까요?",
    example: "부모님 집을 처분하자는 말이 형제 사이에 나왔습니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s07-07-a", label: "부모님 살아 계실 때 형제가 모여 이야기한다", valueLabel: "미리 함께" },
      { id: "l100-s07-07-b", label: "부모님이 먼저 꺼낼 때만 이야기한다", valueLabel: "부모가 꺼내면" },
      { id: "l100-s07-07-c", label: "돌아가신 뒤에 이야기한다", valueLabel: "사후에" },
      { id: "l100-s07-07-d", label: "이야기하지 않고 법대로 한다", valueLabel: "법대로" }
    ]
  },
  {
    id: "l100-s07-08",
    sectionId: "s07",
    title: "부모님 연명치료 결정은 누가 하나요?",
    example: "의사가 연명치료를 계속할지 가족에게 묻습니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s07-08-a", label: "부모님이 남긴 의향서대로", valueLabel: "의향서대로" },
      { id: "l100-s07-08-b", label: "형제가 합의해서 정한다", valueLabel: "형제 합의" },
      { id: "l100-s07-08-c", label: "장남·장녀가 정한다", valueLabel: "맏이가" },
      { id: "l100-s07-08-d", label: "의료진 판단에 맡긴다", valueLabel: "의료진에게" }
    ]
  },
  {
    id: "l100-s07-09",
    sectionId: "s07",
    title: "부모님 돌봄 경험이 우리 노후 계획을 어떻게 바꾸나요?",
    example: "어머니 병간호로 3년을 보내고 나니 우리 노후가 보입니다.",
    mood: "희망",
    choices: [
      { id: "l100-s07-09-a", label: "자녀에게는 절대 맡기지 않기로 한다", valueLabel: "자녀에게 안 맡김" },
      { id: "l100-s07-09-b", label: "미리 시설을 정해 둔다", valueLabel: "시설 미리" },
      { id: "l100-s07-09-c", label: "돌봄 비용을 더 모은다", valueLabel: "저축 늘림" },
      { id: "l100-s07-09-d", label: "계획을 바꾸지 않는다", valueLabel: "그대로" }
    ]
  },
  {
    id: "l100-s07-10",
    sectionId: "s07",
    title: "부모님을 보낸 뒤 형제 관계를 어떻게 하고 싶나요?",
    example: "장례를 치르고 나니 형제가 모일 이유가 사라졌습니다.",
    mood: "여운",
    choices: [
      { id: "l100-s07-10-a", label: "지금처럼 명절마다 만난다", valueLabel: "지금처럼" },
      { id: "l100-s07-10-b", label: "부모님 대신 우리가 자리를 만든다", valueLabel: "더 자주" },
      { id: "l100-s07-10-c", label: "자연스럽게 줄어도 괜찮다", valueLabel: "줄어도 됨" },
      { id: "l100-s07-10-d", label: "관계를 정리한다", valueLabel: "정리" }
    ]
  },
  {
    id: "l100-s08-01",
    sectionId: "s08",
    title: "서로의 죽음을 언제 이야기할까요?",
    example: "친구 부고가 잦아져 우리 차례를 생각하게 됩니다.",
    mood: "조심스러움",
    choices: [
      { id: "l100-s08-01-a", label: "지금 구체적으로 이야기한다", valueLabel: "지금 이야기" },
      { id: "l100-s08-01-b", label: "큰 병이 생기면 이야기한다", valueLabel: "병이 생기면" },
      { id: "l100-s08-01-c", label: "배우자가 원할 때 이야기한다", valueLabel: "상대가 원할 때" },
      { id: "l100-s08-01-d", label: "이야기하지 않는다", valueLabel: "이야기 없음" }
    ]
  },
  {
    id: "l100-s08-02",
    sectionId: "s08",
    title: "통장·보험·비밀번호를 어떻게 공유할까요?",
    example: "배우자의 계좌 비밀번호를 하나도 모릅니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s08-02-a", label: "지금 모두 공유한다", valueLabel: "전부 공유" },
      { id: "l100-s08-02-b", label: "문서로 정리해 한곳에 둔다", valueLabel: "문서로 정리" },
      { id: "l100-s08-02-c", label: "자녀에게 알려 둔다", valueLabel: "자녀에게" },
      { id: "l100-s08-02-d", label: "각자 관리하고 공유하지 않는다", valueLabel: "각자 관리" }
    ]
  },
  {
    id: "l100-s08-03",
    sectionId: "s08",
    title: "장례 방식을 어떻게 정할까요?",
    example: "화장과 매장, 종교 의식을 두고 생각이 다릅니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s08-03-a", label: "미리 정해 기록해 둔다", valueLabel: "미리 기록" },
      { id: "l100-s08-03-b", label: "남은 사람이 정한다", valueLabel: "남은 사람이" },
      { id: "l100-s08-03-c", label: "자녀가 정한다", valueLabel: "자녀가" },
      { id: "l100-s08-03-d", label: "종교 방식대로 한다", valueLabel: "종교대로" }
    ]
  },
  {
    id: "l100-s08-04",
    sectionId: "s08",
    title: "남은 사람의 재혼이나 새 관계를 어떻게 생각하나요?",
    example: "먼저 떠나면 상대가 혼자 남을 것을 생각합니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s08-04-a", label: "새 사람을 만났으면 한다", valueLabel: "만났으면" },
      { id: "l100-s08-04-b", label: "상대의 자유로 둔다", valueLabel: "상대 자유" },
      { id: "l100-s08-04-c", label: "안 했으면 한다", valueLabel: "안 했으면" },
      { id: "l100-s08-04-d", label: "이야기하지 않는다", valueLabel: "말하지 않음" }
    ]
  },
  {
    id: "l100-s08-05",
    sectionId: "s08",
    title: "휴대폰·SNS·사진 같은 디지털 흔적은 어떻게 할까요?",
    example: "먼저 떠난 친구의 SNS 계정이 그대로 남아 있는 것을 봤습니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s08-05-a", label: "계정을 정리하고 사진은 가족에게 넘긴다", valueLabel: "정리 후 전달" },
      { id: "l100-s08-05-b", label: "추모 계정으로 남긴다", valueLabel: "추모로 남김" },
      { id: "l100-s08-05-c", label: "남은 사람이 정한다", valueLabel: "남은 사람이" },
      { id: "l100-s08-05-d", label: "손대지 않고 그대로 둔다", valueLabel: "그대로 둠" }
    ]
  },
  {
    id: "l100-s08-06",
    sectionId: "s08",
    title: "배우자가 먼저 가면 생활비는 어떻게 되나요?",
    example: "연금이 한 사람 명의뿐이라는 것을 알게 됐습니다.",
    mood: "안도",
    choices: [
      { id: "l100-s08-06-a", label: "유족연금과 자산으로 충분하다", valueLabel: "충분함" },
      { id: "l100-s08-06-b", label: "보험으로 대비해 둔다", valueLabel: "보험으로" },
      { id: "l100-s08-06-c", label: "자녀 도움을 받는다", valueLabel: "자녀 도움" },
      { id: "l100-s08-06-d", label: "아직 계산해 보지 않았다", valueLabel: "모름" }
    ]
  },
  {
    id: "l100-s08-07",
    sectionId: "s08",
    title: "사진·일기·물건 정리는 미리 할까요?",
    example: "오래된 편지와 사진이 상자째 옷장에 있습니다.",
    mood: "조심스러움",
    choices: [
      { id: "l100-s08-07-a", label: "지금 함께 정리한다", valueLabel: "지금 함께" },
      { id: "l100-s08-07-b", label: "각자 자기 것을 정리한다", valueLabel: "각자" },
      { id: "l100-s08-07-c", label: "남은 사람에게 맡긴다", valueLabel: "남은 사람에게" },
      { id: "l100-s08-07-d", label: "자녀에게 맡긴다", valueLabel: "자녀에게" }
    ]
  },
  {
    id: "l100-s08-08",
    sectionId: "s08",
    title: "낯선 전화나 문자로 돈을 요구받으면 어떻게 할까요?",
    example: "자녀를 사칭한 문자로 급히 돈을 보내 달라는 연락이 왔습니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s08-08-a", label: "보내기 전에 반드시 배우자와 확인한다", valueLabel: "배우자 확인" },
      { id: "l100-s08-08-b", label: "자녀에게 직접 전화해 확인한다", valueLabel: "본인 확인" },
      { id: "l100-s08-08-c", label: "모르는 연락은 전부 무시한다", valueLabel: "전부 무시" },
      { id: "l100-s08-08-d", label: "급하면 일단 보내고 나중에 확인한다", valueLabel: "일단 보냄" }
    ]
  },
  {
    id: "l100-s08-09",
    sectionId: "s08",
    title: "남는 사람에게 무엇을 남기고 싶나요?",
    example: "편지를 써 둘까 생각하다 그만뒀습니다.",
    mood: "희망",
    choices: [
      { id: "l100-s08-09-a", label: "편지를 써 둔다", valueLabel: "편지" },
      { id: "l100-s08-09-b", label: "영상을 남긴다", valueLabel: "영상" },
      { id: "l100-s08-09-c", label: "남기지 말고 지금 말한다", valueLabel: "지금 말함" },
      { id: "l100-s08-09-d", label: "따로 남기지 않는다", valueLabel: "남기지 않음" }
    ]
  },
  {
    id: "l100-s08-10",
    sectionId: "s08",
    title: "배우자의 물건과 옷은 언제 정리할까요?",
    example: "먼저 떠난 친구의 옷장을 배우자가 3년째 못 열고 있다고 합니다.",
    mood: "여운",
    choices: [
      { id: "l100-s08-10-a", label: "장례 뒤 바로 정리한다", valueLabel: "바로" },
      { id: "l100-s08-10-b", label: "1년쯤 지나 정리한다", valueLabel: "1년 뒤" },
      { id: "l100-s08-10-c", label: "남은 사람이 원할 때 한다", valueLabel: "원할 때" },
      { id: "l100-s08-10-d", label: "정리하지 않고 둔다", valueLabel: "두고 삶" }
    ]
  },
  {
    id: "l100-s09-01",
    sectionId: "s09",
    title: "스스로 생활이 어려워지면 어디에서 돌봄을 받고 싶나요?",
    example: "요양원과 집에서 받는 돌봄을 두고 이야기합니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s09-01-a", label: "집에서 도우미와 지낸다", valueLabel: "집에서" },
      { id: "l100-s09-01-b", label: "요양원에 들어간다", valueLabel: "요양원" },
      { id: "l100-s09-01-c", label: "자녀 집에서 지낸다", valueLabel: "자녀 집" },
      { id: "l100-s09-01-d", label: "그때 형편에 맞춰 정한다", valueLabel: "그때 정함" }
    ]
  },
  {
    id: "l100-s09-02",
    sectionId: "s09",
    title: "배우자를 직접 돌볼 수 있는 한계는 어디인가요?",
    example: "배우자가 거동이 어려워져 씻기고 옮기는 일이 생겼습니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s09-02-a", label: "끝까지 직접 돌본다", valueLabel: "끝까지 직접" },
      { id: "l100-s09-02-b", label: "내 몸이 허락하는 한 돌본다", valueLabel: "몸 허락까지" },
      { id: "l100-s09-02-c", label: "밤에는 도움을 받고 낮에는 직접", valueLabel: "밤은 도움" },
      { id: "l100-s09-02-d", label: "전문 시설에 맡기고 자주 간다", valueLabel: "시설에" }
    ]
  },
  {
    id: "l100-s09-03",
    sectionId: "s09",
    title: "치매 진단을 받으면 누구에게 알릴까요?",
    example: "초기 치매 진단을 받고 돌아오는 길입니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s09-03-a", label: "가족 모두에게 알린다", valueLabel: "가족 모두" },
      { id: "l100-s09-03-b", label: "자녀에게만 알린다", valueLabel: "자녀만" },
      { id: "l100-s09-03-c", label: "배우자만 알고 있는다", valueLabel: "배우자만" },
      { id: "l100-s09-03-d", label: "가까운 친구까지 알린다", valueLabel: "친구까지" }
    ]
  },
  {
    id: "l100-s09-04",
    sectionId: "s09",
    title: "돌봄이 필요해지면 자녀 중 누구에게 기댈까요?",
    example: "가까이 사는 딸과 멀리 사는 아들 중 누가 얼마나 할지 정해야 합니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s09-04-a", label: "가까운 자녀는 몸으로, 먼 자녀는 돈으로", valueLabel: "역할 분담" },
      { id: "l100-s09-04-b", label: "자녀들끼리 정하게 둔다", valueLabel: "자녀에게 맡김" },
      { id: "l100-s09-04-c", label: "똑같이 나누게 한다", valueLabel: "똑같이" },
      { id: "l100-s09-04-d", label: "자녀에게 기대지 않고 시설·도우미로", valueLabel: "자녀 제외" }
    ]
  },
  {
    id: "l100-s09-05",
    sectionId: "s09",
    title: "연명치료에 대해 어떻게 정할까요?",
    example: "사전연명의료의향서를 쓸 수 있다는 안내를 받았습니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s09-05-a", label: "원하지 않으니 의향서를 쓴다", valueLabel: "의향서 작성" },
      { id: "l100-s09-05-b", label: "할 수 있는 치료는 다 받는다", valueLabel: "치료 원함" },
      { id: "l100-s09-05-c", label: "상황에 따라 그때 정한다", valueLabel: "그때 판단" },
      { id: "l100-s09-05-d", label: "가족에게 맡긴다", valueLabel: "가족에게" }
    ]
  },
  {
    id: "l100-s09-06",
    sectionId: "s09",
    title: "치료가 어렵다는 말을 들으면 무엇을 선택할까요?",
    example: "의사가 더 이상의 치료보다 완화 돌봄을 권합니다.",
    mood: "안도",
    choices: [
      { id: "l100-s09-06-a", label: "호스피스를 선택한다", valueLabel: "호스피스" },
      { id: "l100-s09-06-b", label: "끝까지 치료를 시도한다", valueLabel: "끝까지 치료" },
      { id: "l100-s09-06-c", label: "집에서 지낸다", valueLabel: "집에서" },
      { id: "l100-s09-06-d", label: "의사 판단에 맡긴다", valueLabel: "의사에게" }
    ]
  },
  {
    id: "l100-s09-07",
    sectionId: "s09",
    title: "자녀에게 돌봄 부담을 어디까지 지울까요?",
    example: "딸이 직장을 그만두고 돌보겠다고 합니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s09-07-a", label: "절대 안 된다고 말린다", valueLabel: "말림" },
      { id: "l100-s09-07-b", label: "본인이 원하면 받아들인다", valueLabel: "원하면 수용" },
      { id: "l100-s09-07-c", label: "주말이나 일부만 받는다", valueLabel: "일부만" },
      { id: "l100-s09-07-d", label: "자식이니 당연히 받는다", valueLabel: "당연히" }
    ]
  },
  {
    id: "l100-s09-08",
    sectionId: "s09",
    title: "의사 결정을 대신할 사람을 어떻게 정할까요?",
    example: "의식이 없을 때 누가 결정할지 아직 정하지 않았습니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s09-08-a", label: "배우자가 한다", valueLabel: "배우자가" },
      { id: "l100-s09-08-b", label: "자녀 중 한 사람이 한다", valueLabel: "자녀가" },
      { id: "l100-s09-08-c", label: "문서로 미리 지정해 둔다", valueLabel: "문서로 지정" },
      { id: "l100-s09-08-d", label: "의료진에게 맡긴다", valueLabel: "의료진에게" }
    ]
  },
  {
    id: "l100-s09-09",
    sectionId: "s09",
    title: "마지막을 어디에서 맞고 싶나요?",
    example: "집과 병원 중 어디가 좋을지 이야기합니다.",
    mood: "희망",
    choices: [
      { id: "l100-s09-09-a", label: "집에서 가족 곁에서", valueLabel: "집에서" },
      { id: "l100-s09-09-b", label: "의료진이 있는 병원에서", valueLabel: "병원에서" },
      { id: "l100-s09-09-c", label: "통증을 돌봐 주는 호스피스에서", valueLabel: "호스피스에서" },
      { id: "l100-s09-09-d", label: "정하지 않는다", valueLabel: "정하지 않음" }
    ]
  },
  {
    id: "l100-s09-10",
    sectionId: "s09",
    title: "존엄이란 나에게 무엇인가요?",
    example: "\"존엄하게 가고 싶다\"는 말의 뜻이 서로 다릅니다.",
    mood: "여운",
    choices: [
      { id: "l100-s09-10-a", label: "통증 없이 지내는 것", valueLabel: "통증 없음" },
      { id: "l100-s09-10-b", label: "끝까지 스스로 선택하는 것", valueLabel: "스스로 선택" },
      { id: "l100-s09-10-c", label: "가족 곁에 있는 것", valueLabel: "가족 곁" },
      { id: "l100-s09-10-d", label: "누구에게도 짐이 되지 않는 것", valueLabel: "짐 안 됨" }
    ]
  },
  {
    id: "l100-s10-01",
    sectionId: "s10",
    title: "나이 들어도 친밀감을 어떻게 지킬까요?",
    example: "손을 잡은 지 얼마나 됐는지 기억나지 않습니다.",
    mood: "미소",
    choices: [
      { id: "l100-s10-01-a", label: "매일 손을 잡거나 안는다", valueLabel: "매일 스킨십" },
      { id: "l100-s10-01-b", label: "주 1회 둘만의 데이트를 한다", valueLabel: "주간 데이트" },
      { id: "l100-s10-01-c", label: "자연스럽게 두고 강요하지 않는다", valueLabel: "자연스럽게" },
      { id: "l100-s10-01-d", label: "이제는 없어도 괜찮다", valueLabel: "없어도 됨" }
    ]
  },
  {
    id: "l100-s10-02",
    sectionId: "s10",
    title: "친구 관계를 어떻게 유지할까요?",
    example: "부고와 이사로 친구가 하나둘 줄고 있습니다.",
    mood: "호기심",
    choices: [
      { id: "l100-s10-02-a", label: "정기 모임을 끝까지 지킨다", valueLabel: "정기 모임" },
      { id: "l100-s10-02-b", label: "소수와 깊게 지낸다", valueLabel: "소수 깊게" },
      { id: "l100-s10-02-c", label: "새 친구를 사귄다", valueLabel: "새 친구" },
      { id: "l100-s10-02-d", label: "부부만으로 충분하다", valueLabel: "부부만" }
    ]
  },
  {
    id: "l100-s10-03",
    sectionId: "s10",
    title: "종교·신앙 생활을 어떻게 할까요?",
    example: "한 사람만 매주 교회에 나가고 다른 사람은 그 시간에 혼자 집에 있습니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "l100-s10-03-a", label: "같은 곳에 함께 다닌다", valueLabel: "함께 다님" },
      { id: "l100-s10-03-b", label: "각자 하고 간섭하지 않는다", valueLabel: "각자" },
      { id: "l100-s10-03-c", label: "가끔 함께 가 준다", valueLabel: "가끔 동행" },
      { id: "l100-s10-03-d", label: "둘 다 하지 않는다", valueLabel: "둘 다 없음" }
    ]
  },
  {
    id: "l100-s10-04",
    sectionId: "s10",
    title: "서로 다른 취향을 어떻게 맞출까요?",
    example: "한 사람은 산, 다른 사람은 바다를 원해 여행지를 못 정합니다.",
    mood: "현실감",
    choices: [
      { id: "l100-s10-04-a", label: "번갈아 맞춘다", valueLabel: "번갈아" },
      { id: "l100-s10-04-b", label: "각자 원하는 곳에 따로 간다", valueLabel: "따로 감" },
      { id: "l100-s10-04-c", label: "둘 다 아닌 제3의 곳을 찾는다", valueLabel: "절충" },
      { id: "l100-s10-04-d", label: "더 원하는 쪽에 맞춘다", valueLabel: "한쪽 양보" }
    ]
  },
  {
    id: "l100-s10-05",
    sectionId: "s10",
    title: "갈등이 생기면 누구에게 도움을 청할까요?",
    example: "은퇴 뒤 다툼이 늘어 며칠씩 말을 안 합니다.",
    mood: "걱정",
    choices: [
      { id: "l100-s10-05-a", label: "자녀에게 이야기한다", valueLabel: "자녀에게" },
      { id: "l100-s10-05-b", label: "친구에게 이야기한다", valueLabel: "친구에게" },
      { id: "l100-s10-05-c", label: "부부 상담을 받는다", valueLabel: "상담사에게" },
      { id: "l100-s10-05-d", label: "누구에게도 말하지 않고 둘이서 푼다", valueLabel: "둘이서" }
    ]
  },
  {
    id: "l100-s10-06",
    sectionId: "s10",
    title: "서로에게 고마움을 어떻게 표현할까요?",
    example: "30년간 고맙다는 말을 한 번도 제대로 못 했습니다.",
    mood: "안도",
    choices: [
      { id: "l100-s10-06-a", label: "말로 자주 한다", valueLabel: "말로" },
      { id: "l100-s10-06-b", label: "행동으로 보여 준다", valueLabel: "행동으로" },
      { id: "l100-s10-06-c", label: "생일이나 기념일에 편지를 쓴다", valueLabel: "편지로" },
      { id: "l100-s10-06-d", label: "안 해도 아는 사이다", valueLabel: "표현 없이" }
    ]
  },
  {
    id: "l100-s10-07",
    sectionId: "s10",
    title: "배우자의 친구를 어디까지 받아들일까요?",
    example: "배우자의 오랜 친구가 자주 집에 와 저녁을 먹고 갑니다.",
    mood: "솔직함",
    choices: [
      { id: "l100-s10-07-a", label: "우리 둘의 친구로 함께 어울린다", valueLabel: "함께 어울림" },
      { id: "l100-s10-07-b", label: "집에 오는 것은 좋지만 자주는 아니길", valueLabel: "횟수 조절" },
      { id: "l100-s10-07-c", label: "밖에서 만나고 집에는 들이지 않길", valueLabel: "집은 안 됨" },
      { id: "l100-s10-07-d", label: "배우자의 관계이니 관여하지 않는다", valueLabel: "관여 없음" }
    ]
  },
  {
    id: "l100-s10-08",
    sectionId: "s10",
    title: "서로의 과거 잘못을 어떻게 다룰까요?",
    example: "오래된 상처가 아직 마음에 남아 가끔 떠오릅니다.",
    mood: "진지함",
    choices: [
      { id: "l100-s10-08-a", label: "이미 용서했고 다시 꺼내지 않는다", valueLabel: "용서함" },
      { id: "l100-s10-08-b", label: "한 번 제대로 이야기하고 용서한다", valueLabel: "대화 뒤 용서" },
      { id: "l100-s10-08-c", label: "묻어두고 살아간다", valueLabel: "묻어둠" },
      { id: "l100-s10-08-d", label: "용서하지 못했다고 말한다", valueLabel: "용서 못 함" }
    ]
  },
  {
    id: "l100-s10-09",
    sectionId: "s10",
    title: "함께 늙어 가며 가장 지키고 싶은 것은 무엇인가요?",
    example: "건강·돈·관계·자유 중 하나만 지킬 수 있다면 무엇일지 이야기합니다.",
    mood: "희망",
    choices: [
      { id: "l100-s10-09-a", label: "서로의 건강을 먼저 지킨다", valueLabel: "건강" },
      { id: "l100-s10-09-b", label: "두 사람의 관계를 먼저 지킨다", valueLabel: "관계" },
      { id: "l100-s10-09-c", label: "돈과 생활의 안정을 먼저 지킨다", valueLabel: "안정" },
      { id: "l100-s10-09-d", label: "각자의 자유를 먼저 지킨다", valueLabel: "자유" }
    ]
  },
  {
    id: "l100-s10-10",
    sectionId: "s10",
    title: "남은 날들을 위한 두 사람의 약속은 무엇인가요?",
    example: "100문항을 마치고 하나만 남긴다면 무엇일지 이야기합니다.",
    mood: "여운",
    choices: [
      { id: "l100-s10-10-a", label: "매일 한 번은 마주 앉아 이야기한다", valueLabel: "매일 대화" },
      { id: "l100-s10-10-b", label: "아플 때 서로를 돌본다", valueLabel: "서로 돌봄" },
      { id: "l100-s10-10-c", label: "각자의 시간을 존중한다", valueLabel: "각자 존중" },
      { id: "l100-s10-10-d", label: "먼저 떠날 날을 함께 준비한다", valueLabel: "함께 준비" }
    ]
  }
  ]
});

export const later100Questions = later100Pack.orderedQuestions;
