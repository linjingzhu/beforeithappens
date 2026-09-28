/**
 * 육아 100제 — a site pack. Generated; do not edit by hand.
 *
 * Source: `question-packs/parenting.html`, the editorial review build.
 * Regenerate: `node scripts/build-site-packs.mjs parenting`. `test/site-packs.test.js` fails if
 * this file and that one disagree.
 *
 * The source's last section — the emergency appendix — is not here on purpose. It is a quiz with
 * right and wrong answers about emergencies, which cannot live inside a site whose whole contract is
 * that there is no score and no verdict, and `question-packs/README.md` requires medical review
 * before that material is promoted to any runtime.
 */
import { definePack, PACK_SURFACE } from "./pack-schema.js";

export const parenting100Pack = definePack({
  id: "parenting-100",
  surface: PACK_SURFACE.site,
  audience: "couple",
  version: "2026-09-28",
  locale: "ko-KR",
  title: "육아 100제",
  sections: [
  { id: "s01", title: "보이지 않는 하루의 노동", blurb: "밤중 돌봄, 정신적 노동, 휴식. 하루의 일을 어떻게 나누는지에 두 사람의 공정함이 보여요." },
  { id: "s02", title: "잠들지 못하는 밤", blurb: "수면교육, 침실 분리, 낮잠. 잠을 둘러싼 선택에 아이를 어떻게 보는지가 보여요." },
  { id: "s03", title: "먹이고 지키는 일", blurb: "이유식, 간식, 접종, 병원. 먹이고 지키는 기준에 두 사람이 무엇을 안전으로 보는지가 보여요." },
  { id: "s04", title: "아이가 자기 뜻을 갖기 시작할 때", blurb: "떼, 훈육, 체벌, 사과. 아이가 뜻을 세울 때 두 사람이 어떻게 반응하는지가 보여요." },
  { id: "s05", title: "화면 너머의 세계", blurb: "영상, 스마트폰, SNS, 감시. 화면을 어떻게 다루는지에 두 사람의 기준이 보여요." },
  { id: "s06", title: "배움의 시작", blurb: "어린이집, 교사, 선행, 학원비. 배움을 어떻게 시작하는지에 두 사람의 기대가 보여요." },
  { id: "s07", title: "우리 밖의 세계", blurb: "조부모, 도우미, 친척. 우리 밖 사람들과 아이 사이에 어떤 경계를 두는지가 보여요." },
  { id: "s08", title: "부모이기 전에 두 사람", blurb: "데이트, 취미, 성생활, 다툼, 그리고 산후우울. 부모가 된 뒤 두 사람의 관계와 마음을 어떻게 지키는지가 보여요." },
  { id: "s09", title: "돈과 시간의 저울", blurb: "육아비, 경력, 이사, 통장. 돈과 시간을 어떻게 저울질하는지에 두 사람의 공정함이 보여요." },
  { id: "s10", title: "언젠가 품을 떠날 아이에게", blurb: "발달, 위험, 사생활, 정체성. 아이가 스스로 서기 시작할 때 얼마나 손을 놓는지가 보여요." }
  ],
  questions: [
  {
    id: "c100-s01-01",
    sectionId: "s01",
    title: "밤중 돌봄은 시간을 똑같이 나눌까요, 상황별로 나눌까요?",
    example: "새벽 3시, 아이가 세 번째로 깼습니다.",
    mood: "미소",
    choices: [
      { id: "c100-s01-01-a", label: "밤을 반으로 나눠 시간대별로 맡는다", valueLabel: "시간대 반반" },
      { id: "c100-s01-01-b", label: "하루씩 번갈아 맡는다", valueLabel: "하루 교대" },
      { id: "c100-s01-01-c", label: "다음 날 출근하는 사람은 자고 쉬는 사람이 맡는다", valueLabel: "출근자 제외" },
      { id: "c100-s01-01-d", label: "주 양육자가 밤을 맡고 주말에 보상한다", valueLabel: "주말 보상" }
    ]
  },
  {
    id: "c100-s01-02",
    sectionId: "s01",
    title: "한 사람이 휴직 중이면 육아와 집안일을 모두 맡아야 할까요?",
    example: "휴직 중인 사람이 육아와 집안일을 다 하고 있습니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s01-02-a", label: "휴직자가 육아와 집안일을 모두 맡는다", valueLabel: "휴직자 전담" },
      { id: "c100-s01-02-b", label: "낮에는 휴직자, 퇴근 뒤와 주말은 반반", valueLabel: "퇴근 뒤 반반" },
      { id: "c100-s01-02-c", label: "육아는 휴직자, 집안일은 출근자가 맡는다", valueLabel: "육아·가사 분리" },
      { id: "c100-s01-02-d", label: "휴직자는 육아만 하고 집안일은 외부에 맡긴다", valueLabel: "가사 외주" }
    ]
  },
  {
    id: "c100-s01-03",
    sectionId: "s01",
    title: "기저귀·수유·병원·준비물의 정신적 노동은 어떻게 나눌까요?",
    example: "기저귀 재고와 검진 예약을 한 사람만 기억합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s01-03-a", label: "영역을 나눠 각자 끝까지 책임진다", valueLabel: "영역 분담" },
      { id: "c100-s01-03-b", label: "공유 앱에 적고 둘 다 확인한다", valueLabel: "공유 앱" },
      { id: "c100-s01-03-c", label: "주 1회 함께 점검하는 시간을 둔다", valueLabel: "주간 점검" },
      { id: "c100-s01-03-d", label: "한 사람이 관리하고 다른 사람은 실행한다", valueLabel: "관리와 실행 분리" }
    ]
  },
  {
    id: "c100-s01-04",
    sectionId: "s01",
    title: "파트너가 “말하면 한다”고 할 때 지시하는 일도 노동으로 볼까요?",
    example: "부탁하면 하겠다지만 발견하고 기억하는 일은 한쪽 몫입니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s01-04-a", label: "지시하는 일도 노동이니 담당 영역을 정한다", valueLabel: "영역 정하기" },
      { id: "c100-s01-04-b", label: "할 일 목록을 만들어 스스로 확인하게 한다", valueLabel: "목록 확인" },
      { id: "c100-s01-04-c", label: "지시받는 쪽이 먼저 찾아서 하기로 한다", valueLabel: "먼저 찾기" },
      { id: "c100-s01-04-d", label: "말하면 바로 하는 것으로 충분하다", valueLabel: "말하면 충분" }
    ]
  },
  {
    id: "c100-s01-05",
    sectionId: "s01",
    title: "주말에는 주양육자가 완전히 쉬는 시간을 얼마나 보장할까요?",
    example: "주말에도 주양육자가 아이를 계속 봅니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s01-05-a", label: "주말 하루는 온전히 쉰다", valueLabel: "하루" },
      { id: "c100-s01-05-b", label: "반나절씩 이틀", valueLabel: "반나절씩" },
      { id: "c100-s01-05-c", label: "몇 시간 외출 정도", valueLabel: "몇 시간" },
      { id: "c100-s01-05-d", label: "주말은 둘이 함께 보고 따로 쉬지 않는다", valueLabel: "따로 없음" }
    ]
  },
  {
    id: "c100-s01-06",
    sectionId: "s01",
    title: "아이가 아플 때 누가 휴가를 내는지 어떤 원칙으로 정할까요?",
    example: "평일 아침 아이에게 열이 나 어린이집에 못 갑니다.",
    mood: "안도",
    choices: [
      { id: "c100-s01-06-a", label: "번갈아 낸다", valueLabel: "교대" },
      { id: "c100-s01-06-b", label: "그날 일정이 덜 급한 쪽", valueLabel: "일정 보고" },
      { id: "c100-s01-06-c", label: "휴가가 더 많거나 눈치 덜 보이는 쪽", valueLabel: "여유 있는 쪽" },
      { id: "c100-s01-06-d", label: "조부모나 아픈 아이 돌봄 서비스를 먼저 찾는다", valueLabel: "외부 먼저" }
    ]
  },
  {
    id: "c100-s01-07",
    sectionId: "s01",
    title: "등원·하원·식사·목욕·재우기 담당을 고정할까요?",
    example: "매일 누가 뭘 할지 정하는 데 힘이 듭니다.",
    mood: "웃음",
    choices: [
      { id: "c100-s01-07-a", label: "담당을 고정한다", valueLabel: "고정" },
      { id: "c100-s01-07-b", label: "주 단위로 바꾼다", valueLabel: "주 교대" },
      { id: "c100-s01-07-c", label: "등원은 A, 재우기는 B처럼 일부만 고정한다", valueLabel: "일부 고정" },
      { id: "c100-s01-07-d", label: "매일 상황에 맞춰 정한다", valueLabel: "매일 조정" }
    ]
  },
  {
    id: "c100-s01-08",
    sectionId: "s01",
    title: "각자 혼자 아이를 돌볼 수 있는 최소 역량을 어떻게 맞출까요?",
    example: "한 사람이 없으면 다른 사람이 재우지도 먹이지도 못합니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s01-08-a", label: "주말마다 한 사람이 혼자 하루를 맡아 본다", valueLabel: "혼자 하루" },
      { id: "c100-s01-08-b", label: "익숙한 사람이 옆에서 가르친다", valueLabel: "옆에서 배움" },
      { id: "c100-s01-08-c", label: "육아 수업을 함께 듣는다", valueLabel: "수업" },
      { id: "c100-s01-08-d", label: "잘하는 사람이 계속 하고 맞추지 않는다", valueLabel: "맞추지 않음" }
    ]
  },
  {
    id: "c100-s01-09",
    sectionId: "s01",
    title: "돌봄 수준이 다를 때 더 꼼꼼한 사람의 기준을 따라야 할까요?",
    example: "한 사람은 소독과 기록을 지키고 다른 사람은 느슨합니다.",
    mood: "희망",
    choices: [
      { id: "c100-s01-09-a", label: "꼼꼼한 기준에 맞춘다", valueLabel: "꼼꼼한 기준" },
      { id: "c100-s01-09-b", label: "안전과 관련된 것만 맞추고 나머지는 각자", valueLabel: "안전만 통일" },
      { id: "c100-s01-09-c", label: "각자 맡은 시간에는 각자 방식대로", valueLabel: "각자 방식" },
      { id: "c100-s01-09-d", label: "의료진이 말한 기준만 지킨다", valueLabel: "의료진 기준" }
    ]
  },
  {
    id: "c100-s01-10",
    sectionId: "s01",
    title: "육아 갈등을 주간 회의처럼 정기적으로 점검할까요?",
    example: "그때마다 말하면 다투고 미루면 폭발합니다.",
    mood: "여운",
    choices: [
      { id: "c100-s01-10-a", label: "주 1회 정해진 시간에 이야기한다", valueLabel: "주간 회의" },
      { id: "c100-s01-10-b", label: "서운할 때 그때 바로 말한다", valueLabel: "그때 바로" },
      { id: "c100-s01-10-c", label: "월 1회 크게 점검한다", valueLabel: "월 1회" },
      { id: "c100-s01-10-d", label: "따로 정하지 않는다", valueLabel: "정하지 않음" }
    ]
  },
  {
    id: "c100-s02-01",
    sectionId: "s02",
    title: "수면교육을 할지 반응적 돌봄을 할지 어떤 기준으로 정할까요?",
    example: "아이가 혼자 잠들지 못해 매번 안아 재웁니다.",
    mood: "미소",
    choices: [
      { id: "c100-s02-01-a", label: "수면교육을 한다", valueLabel: "수면교육" },
      { id: "c100-s02-01-b", label: "울면 바로 반응한다", valueLabel: "반응적 돌봄" },
      { id: "c100-s02-01-c", label: "부모 수면이 무너지면 수면교육을 시작한다", valueLabel: "부모 상태 기준" },
      { id: "c100-s02-01-d", label: "소아과 의사 권고에 따른다", valueLabel: "의료진 권고" }
    ]
  },
  {
    id: "c100-s02-02",
    sectionId: "s02",
    title: "아이가 울 때 몇 분까지 기다릴 수 있나요?",
    example: "잠든 지 20분 만에 아이가 다시 웁니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s02-02-a", label: "바로 안는다", valueLabel: "바로" },
      { id: "c100-s02-02-b", label: "3분", valueLabel: "3분" },
      { id: "c100-s02-02-c", label: "5~10분", valueLabel: "5~10분" },
      { id: "c100-s02-02-d", label: "울음 소리로 판단해 필요할 때만", valueLabel: "소리로 판단" }
    ]
  },
  {
    id: "c100-s02-03",
    sectionId: "s02",
    title: "부모와 아이의 침실을 언제 분리할까요?",
    example: "함께 자면 수유는 편하지만 부부 수면이 줄어듭니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s02-03-a", label: "신생아 때부터", valueLabel: "처음부터" },
      { id: "c100-s02-03-b", label: "6개월쯤", valueLabel: "6개월" },
      { id: "c100-s02-03-c", label: "돌 지나서", valueLabel: "돌 이후" },
      { id: "c100-s02-03-d", label: "아이가 원할 때까지 함께", valueLabel: "아이가 원할 때" }
    ]
  },
  {
    id: "c100-s02-04",
    sectionId: "s02",
    title: "가족침대와 독립수면 중 무엇을 기본으로 할까요?",
    example: "아이가 부모 침대로 매일 건너옵니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s02-04-a", label: "가족침대", valueLabel: "가족침대" },
      { id: "c100-s02-04-b", label: "같은 방, 다른 침대", valueLabel: "같은 방 다른 침대" },
      { id: "c100-s02-04-c", label: "다른 방에서 독립수면", valueLabel: "독립수면" },
      { id: "c100-s02-04-d", label: "평일은 독립, 주말은 함께", valueLabel: "평일·주말 구분" }
    ]
  },
  {
    id: "c100-s02-05",
    sectionId: "s02",
    title: "취침 시간이 어긋나도 가족 일정에 맞출 수 있나요?",
    example: "저녁 모임이 아이 취침 시간과 겹칩니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s02-05-a", label: "취침 시간을 지키고 모임을 거른다", valueLabel: "취침 우선" },
      { id: "c100-s02-05-b", label: "가끔은 늦게 재워도 된다", valueLabel: "가끔 예외" },
      { id: "c100-s02-05-c", label: "한 사람만 가고 한 사람은 재운다", valueLabel: "한 명만 참석" },
      { id: "c100-s02-05-d", label: "아이를 데려가 그 자리에서 재운다", valueLabel: "데려가서 재움" }
    ]
  },
  {
    id: "c100-s02-06",
    sectionId: "s02",
    title: "밤에 깨는 아이를 누가 다시 재울까요?",
    example: "새벽에 아이가 깨서 웁니다.",
    mood: "안도",
    choices: [
      { id: "c100-s02-06-a", label: "아이가 찾는 사람", valueLabel: "아이가 찾는 사람" },
      { id: "c100-s02-06-b", label: "하루씩 번갈아", valueLabel: "교대" },
      { id: "c100-s02-06-c", label: "다음 날 늦게 일어나도 되는 사람", valueLabel: "여유 있는 사람" },
      { id: "c100-s02-06-d", label: "늘 같은 한 사람", valueLabel: "한 사람 고정" }
    ]
  },
  {
    id: "c100-s02-07",
    sectionId: "s02",
    title: "낮잠 때문에 외출과 약속을 제한할까요?",
    example: "낮잠 시간과 외출이 겹칩니다.",
    mood: "웃음",
    choices: [
      { id: "c100-s02-07-a", label: "낮잠 시간에 맞춰 외출을 잡는다", valueLabel: "낮잠 우선" },
      { id: "c100-s02-07-b", label: "유모차나 차에서 재우며 외출한다", valueLabel: "이동 중 낮잠" },
      { id: "c100-s02-07-c", label: "하루쯤 낮잠을 거른다", valueLabel: "거르기" },
      { id: "c100-s02-07-d", label: "외출은 낮잠 없는 시기까지 미룬다", valueLabel: "외출 보류" }
    ]
  },
  {
    id: "c100-s02-08",
    sectionId: "s02",
    title: "조부모 집에서도 같은 수면 규칙을 요구할까요?",
    example: "조부모 집에서는 아이가 밤 11시에 잡니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s02-08-a", label: "똑같이 지켜 달라고 한다", valueLabel: "똑같이" },
      { id: "c100-s02-08-b", label: "취침 시간만 지켜 달라고 한다", valueLabel: "핵심만" },
      { id: "c100-s02-08-c", label: "조부모 집에서는 자유", valueLabel: "자유" },
      { id: "c100-s02-08-d", label: "규칙이 안 지켜지면 재우기 전에 데려온다", valueLabel: "재우기 전 귀가" }
    ]
  },
  {
    id: "c100-s02-09",
    sectionId: "s02",
    title: "잠을 재우기 위해 영상·차 이동·수유를 사용할 수 있나요?",
    example: "영상을 틀어야 잠드는 습관이 생기고 있습니다.",
    mood: "희망",
    choices: [
      { id: "c100-s02-09-a", label: "어떤 것도 쓰지 않는다", valueLabel: "사용 안 함" },
      { id: "c100-s02-09-b", label: "수유만 쓴다", valueLabel: "수유만" },
      { id: "c100-s02-09-c", label: "차 이동이나 수유는 되고 영상은 안 된다", valueLabel: "영상만 금지" },
      { id: "c100-s02-09-d", label: "재우는 게 우선이니 다 쓴다", valueLabel: "다 씀" }
    ]
  },
  {
    id: "c100-s02-10",
    sectionId: "s02",
    title: "부모의 수면 부족이 위험 수준일 때 유료 도움을 받을까요?",
    example: "두 사람 다 두세 시간씩만 자 운전 실수가 생깁니다.",
    mood: "여운",
    choices: [
      { id: "c100-s02-10-a", label: "야간 도우미를 쓴다", valueLabel: "야간 도우미" },
      { id: "c100-s02-10-b", label: "가족에게 며칠 맡긴다", valueLabel: "가족" },
      { id: "c100-s02-10-c", label: "한 사람이 며칠 휴가를 내 몰아서 잔다", valueLabel: "휴가" },
      { id: "c100-s02-10-d", label: "돈 쓰지 않고 버틴다", valueLabel: "버팀" }
    ]
  },
  {
    id: "c100-s03-01",
    sectionId: "s03",
    title: "이유식은 직접 만들기와 시판 제품 중 무엇을 기본으로 할까요?",
    example: "이유식을 만드는 데 하루 한 시간이 듭니다.",
    mood: "미소",
    choices: [
      { id: "c100-s03-01-a", label: "직접 만든다", valueLabel: "직접" },
      { id: "c100-s03-01-b", label: "시판 제품", valueLabel: "시판" },
      { id: "c100-s03-01-c", label: "주중은 시판, 주말은 직접", valueLabel: "섞어서" },
      { id: "c100-s03-01-d", label: "만드는 사람이 정한다", valueLabel: "만드는 사람이" }
    ]
  },
  {
    id: "c100-s03-02",
    sectionId: "s03",
    title: "편식하는 아이에게 먹을 때까지 기다리게 할 수 있나요?",
    example: "정성껏 준비한 음식을 아이가 손도 대지 않습니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s03-02-a", label: "먹을 때까지 식탁에 있게 한다", valueLabel: "먹을 때까지" },
      { id: "c100-s03-02-b", label: "안 먹으면 치우고 다음 끼니까지 없다", valueLabel: "치우고 기다림" },
      { id: "c100-s03-02-c", label: "먹는 것으로 바꿔 준다", valueLabel: "바꿔 줌" },
      { id: "c100-s03-02-d", label: "한 입만 먹으면 된다", valueLabel: "한 입만" }
    ]
  },
  {
    id: "c100-s03-03",
    sectionId: "s03",
    title: "간식과 설탕의 허용 기준을 얼마나 엄격하게 둘까요?",
    example: "아이가 간식만 찾습니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s03-03-a", label: "설탕 간식은 주지 않는다", valueLabel: "금지" },
      { id: "c100-s03-03-b", label: "하루 한 번 정해진 양", valueLabel: "하루 한 번" },
      { id: "c100-s03-03-c", label: "특별한 날만", valueLabel: "특별한 날만" },
      { id: "c100-s03-03-d", label: "제한하지 않는다", valueLabel: "제한 없음" }
    ]
  },
  {
    id: "c100-s03-04",
    sectionId: "s03",
    title: "조부모가 몰래 간식을 주면 어떤 결과를 정할까요?",
    example: "조부모 집에서 온 아이 가방에 사탕이 가득합니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s03-04-a", label: "그 자리에서 다시 말씀드린다", valueLabel: "다시 말함" },
      { id: "c100-s03-04-b", label: "조부모 집에서는 눈감는다", valueLabel: "눈감음" },
      { id: "c100-s03-04-c", label: "반복되면 맡기지 않는다", valueLabel: "맡기지 않음" },
      { id: "c100-s03-04-d", label: "아이에게 집 규칙을 다시 설명한다", valueLabel: "아이에게 설명" }
    ]
  },
  {
    id: "c100-s03-05",
    sectionId: "s03",
    title: "아이의 식사량을 부모가 정할지 아이에게 맡길지 어떻게 생각하나요?",
    example: "아이가 반만 먹고 그만 먹겠다고 합니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s03-05-a", label: "정한 양은 다 먹게 한다", valueLabel: "정한 양" },
      { id: "c100-s03-05-b", label: "아이가 그만이라면 그만", valueLabel: "아이에게 맡김" },
      { id: "c100-s03-05-c", label: "채소만 다 먹으면 된다", valueLabel: "핵심만" },
      { id: "c100-s03-05-d", label: "성장 곡선을 보고 정한다", valueLabel: "성장 곡선" }
    ]
  },
  {
    id: "c100-s03-06",
    sectionId: "s03",
    title: "유기농·프리미엄 식재료에 얼마까지 쓸까요?",
    example: "유기농이 일반 제품보다 두 배 비쌉니다.",
    mood: "안도",
    choices: [
      { id: "c100-s03-06-a", label: "아이 것은 모두 유기농", valueLabel: "전부 유기농" },
      { id: "c100-s03-06-b", label: "자주 먹는 몇 가지만", valueLabel: "일부만" },
      { id: "c100-s03-06-c", label: "예산 안에서만", valueLabel: "예산 안에서" },
      { id: "c100-s03-06-d", label: "일반 제품으로 충분하다", valueLabel: "일반 제품" }
    ]
  },
  {
    id: "c100-s03-07",
    sectionId: "s03",
    title: "예방접종과 선택접종은 어떤 원칙으로 결정할까요?",
    example: "선택접종 비용이 회당 10만 원이 넘습니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s03-07-a", label: "필수와 선택 모두 다 맞힌다", valueLabel: "전부" },
      { id: "c100-s03-07-b", label: "필수만", valueLabel: "필수만" },
      { id: "c100-s03-07-c", label: "의사가 권하는 선택접종까지", valueLabel: "의사 권고" },
      { id: "c100-s03-07-d", label: "비용을 보고 정한다", valueLabel: "비용 기준" }
    ]
  },
  {
    id: "c100-s03-08",
    sectionId: "s03",
    title: "가벼운 증상에도 바로 병원에 갈까요?",
    example: "밤에 아이가 미열이 납니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s03-08-a", label: "바로 간다", valueLabel: "바로" },
      { id: "c100-s03-08-b", label: "하루 지켜본 뒤", valueLabel: "하루 뒤" },
      { id: "c100-s03-08-c", label: "열 수치나 정한 기준을 넘으면", valueLabel: "기준 넘으면" },
      { id: "c100-s03-08-d", label: "전화 상담 뒤 정한다", valueLabel: "전화 상담" }
    ]
  },
  {
    id: "c100-s03-09",
    sectionId: "s03",
    title: "건강·발달 정보를 커뮤니티와 전문가 중 어디에서 먼저 찾을까요?",
    example: "발진이 생겨 검색부터 하게 됩니다.",
    mood: "희망",
    choices: [
      { id: "c100-s03-09-a", label: "커뮤니티와 검색", valueLabel: "커뮤니티" },
      { id: "c100-s03-09-b", label: "소아과나 상담 전화", valueLabel: "전문가" },
      { id: "c100-s03-09-c", label: "육아 경험 있는 가족", valueLabel: "가족" },
      { id: "c100-s03-09-d", label: "공식 기관 자료", valueLabel: "공식 자료" }
    ]
  },
  {
    id: "c100-s03-10",
    sectionId: "s03",
    title: "아이의 체중과 외모에 관한 가족의 말을 어떻게 제한할까요?",
    example: "식사 자리에서 아이 체형 이야기가 농담처럼 반복됩니다.",
    mood: "여운",
    choices: [
      { id: "c100-s03-10-a", label: "그 자리에서 멈춰 달라고 한다", valueLabel: "즉시" },
      { id: "c100-s03-10-b", label: "아이 없는 자리에서 따로 말한다", valueLabel: "따로" },
      { id: "c100-s03-10-c", label: "그 가족의 자녀인 쪽이 말한다", valueLabel: "자기 가족은 자기가" },
      { id: "c100-s03-10-d", label: "아이에게 나중에 다르게 설명한다", valueLabel: "아이에게 설명" }
    ]
  },
  {
    id: "c100-s04-01",
    sectionId: "s04",
    title: "떼쓰는 아이에게 공감과 규칙 중 무엇을 먼저 보여줄까요?",
    example: "마트 바닥에 누워 우는 아이 앞에 두 부모의 순서가 다릅니다.",
    mood: "미소",
    choices: [
      { id: "c100-s04-01-a", label: "먼저 안아 주고 진정되면 규칙을 말한다", valueLabel: "공감 먼저" },
      { id: "c100-s04-01-b", label: "규칙을 먼저 말하고 그 뒤 달랜다", valueLabel: "규칙 먼저" },
      { id: "c100-s04-01-c", label: "진정될 때까지 기다린다", valueLabel: "기다림" },
      { id: "c100-s04-01-d", label: "자리를 옮긴 뒤 이야기한다", valueLabel: "자리 이동" }
    ]
  },
  {
    id: "c100-s04-02",
    sectionId: "s04",
    title: "훈육 중 목소리를 높이는 것은 어디까지 허용되나요?",
    example: "위험한 행동에 큰 소리가 나왔습니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s04-02-a", label: "어떤 경우에도 높이지 않는다", valueLabel: "금지" },
      { id: "c100-s04-02-b", label: "위험할 때만", valueLabel: "위험할 때만" },
      { id: "c100-s04-02-c", label: "두 번 말해도 안 들으면", valueLabel: "반복 뒤" },
      { id: "c100-s04-02-d", label: "소리치는 것은 훈육의 일부다", valueLabel: "허용" }
    ]
  },
  {
    id: "c100-s04-03",
    sectionId: "s04",
    title: "체벌은 어떤 상황에서도 금지할까요?",
    example: "위험한 행동에 한 부모가 손을 들었고 다른 부모가 막았습니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s04-03-a", label: "어떤 경우에도 금지", valueLabel: "완전 금지" },
      { id: "c100-s04-03-b", label: "손바닥 정도는 위험할 때만", valueLabel: "위험할 때만" },
      { id: "c100-s04-03-c", label: "체벌 대신 다른 벌을 정해 둔다", valueLabel: "대체 벌" },
      { id: "c100-s04-03-d", label: "부모 재량", valueLabel: "재량" }
    ]
  },
  {
    id: "c100-s04-04",
    sectionId: "s04",
    title: "타임아웃과 자연적 결과 중 무엇을 사용할까요?",
    example: "장난감을 던진 아이에게 어떻게 할지 정해야 합니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s04-04-a", label: "타임아웃", valueLabel: "타임아웃" },
      { id: "c100-s04-04-b", label: "자연적 결과(던진 장난감은 치운다)", valueLabel: "자연적 결과" },
      { id: "c100-s04-04-c", label: "말로 설명만", valueLabel: "설명만" },
      { id: "c100-s04-04-d", label: "상황마다 다르게", valueLabel: "상황별" }
    ]
  },
  {
    id: "c100-s04-05",
    sectionId: "s04",
    title: "부모 앞에서 서로 다른 훈육 결정을 내리면 누가 따를까요?",
    example: "한 사람은 안 된다고, 다른 사람은 된다고 했습니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s04-05-a", label: "먼저 말한 사람", valueLabel: "먼저 말한 쪽" },
      { id: "c100-s04-05-b", label: "더 엄한 쪽", valueLabel: "엄한 쪽" },
      { id: "c100-s04-05-c", label: "그 상황을 맡고 있던 사람", valueLabel: "담당하던 쪽" },
      { id: "c100-s04-05-d", label: "아이 앞에서 정하지 않고 나중에", valueLabel: "나중에 정함" }
    ]
  },
  {
    id: "c100-s04-06",
    sectionId: "s04",
    title: "한 부모가 내린 벌을 다른 부모가 취소할 수 있나요?",
    example: "한 사람이 정한 벌이 과하다고 느껴집니다.",
    mood: "안도",
    choices: [
      { id: "c100-s04-06-a", label: "취소하지 않고 나중에 이야기한다", valueLabel: "취소 불가" },
      { id: "c100-s04-06-b", label: "아이 앞에서라도 취소한다", valueLabel: "취소 가능" },
      { id: "c100-s04-06-c", label: "벌을 준 사람에게 조용히 말해 스스로 바꾸게 한다", valueLabel: "본인이 바꿈" },
      { id: "c100-s04-06-d", label: "안전 문제일 때만 취소한다", valueLabel: "안전 예외" }
    ]
  },
  {
    id: "c100-s04-07",
    sectionId: "s04",
    title: "사과를 강요하는 것과 스스로 준비될 때까지 기다리는 것 중 무엇이 좋을까요?",
    example: "친구를 밀고도 사과하지 않으려 합니다.",
    mood: "웃음",
    choices: [
      { id: "c100-s04-07-a", label: "그 자리에서 사과하게 한다", valueLabel: "바로 사과" },
      { id: "c100-s04-07-b", label: "준비될 때까지 기다린다", valueLabel: "기다림" },
      { id: "c100-s04-07-c", label: "부모가 대신 사과하고 나중에 설명한다", valueLabel: "부모가 대신" },
      { id: "c100-s04-07-d", label: "사과 대신 다른 행동으로 갚게 한다", valueLabel: "행동으로" }
    ]
  },
  {
    id: "c100-s04-08",
    sectionId: "s04",
    title: "공공장소에서 큰 소동이 생기면 즉시 자리를 떠날까요?",
    example: "식당에서 아이가 소리 지르며 웁니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s04-08-a", label: "바로 나간다", valueLabel: "바로 나감" },
      { id: "c100-s04-08-b", label: "진정시켜 보고 안 되면 나간다", valueLabel: "시도 뒤" },
      { id: "c100-s04-08-c", label: "한 사람만 데리고 나가고 다른 사람은 남는다", valueLabel: "한 명만" },
      { id: "c100-s04-08-d", label: "남아서 달랜다", valueLabel: "남음" }
    ]
  },
  {
    id: "c100-s04-09",
    sectionId: "s04",
    title: "아이의 거짓말을 발견했을 때 처벌과 이유 탐색 중 무엇을 먼저 할까요?",
    example: "아이가 컵을 깨고 안 그랬다고 합니다.",
    mood: "희망",
    choices: [
      { id: "c100-s04-09-a", label: "왜 거짓말했는지 먼저 묻는다", valueLabel: "이유 먼저" },
      { id: "c100-s04-09-b", label: "거짓말은 벌을 준다", valueLabel: "벌 먼저" },
      { id: "c100-s04-09-c", label: "사실대로 말하면 벌은 없다고 한다", valueLabel: "정직 보상" },
      { id: "c100-s04-09-d", label: "모른 척하고 지켜본다", valueLabel: "지켜봄" }
    ]
  },
  {
    id: "c100-s04-10",
    sectionId: "s04",
    title: "부모가 감정적으로 폭발했을 때 아이에게 어떻게 회복을 보여줄까요?",
    example: "큰소리를 냈고 아이가 놀라 굳었습니다.",
    mood: "여운",
    choices: [
      { id: "c100-s04-10-a", label: "바로 사과한다", valueLabel: "바로 사과" },
      { id: "c100-s04-10-b", label: "진정한 뒤 무슨 일이었는지 설명한다", valueLabel: "나중에 설명" },
      { id: "c100-s04-10-c", label: "다른 부모가 아이를 먼저 달랜다", valueLabel: "다른 부모가" },
      { id: "c100-s04-10-d", label: "사과하지 않고 평소처럼 돌아간다", valueLabel: "평소처럼" }
    ]
  },
  {
    id: "c100-s05-01",
    sectionId: "s05",
    title: "첫 영상 노출 시기를 언제로 정할까요?",
    example: "식당에서 옆 테이블 아기가 영상을 보고 있습니다.",
    mood: "미소",
    choices: [
      { id: "c100-s05-01-a", label: "두 돌 전에는 없다", valueLabel: "두 돌 이후" },
      { id: "c100-s05-01-b", label: "돌 이후 짧게", valueLabel: "돌 이후" },
      { id: "c100-s05-01-c", label: "영상통화만 예외", valueLabel: "통화만" },
      { id: "c100-s05-01-d", label: "시기를 정하지 않는다", valueLabel: "정하지 않음" }
    ]
  },
  {
    id: "c100-s05-02",
    sectionId: "s05",
    title: "스크린 시간은 분 단위 제한과 콘텐츠 중심 중 무엇이 중요할까요?",
    example: "하루 30분 제한과 좋은 콘텐츠 사이에서 의견이 갈립니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s05-02-a", label: "시간 제한", valueLabel: "시간" },
      { id: "c100-s05-02-b", label: "콘텐츠 기준", valueLabel: "콘텐츠" },
      { id: "c100-s05-02-c", label: "둘 다 정한다", valueLabel: "둘 다" },
      { id: "c100-s05-02-d", label: "함께 보는지 여부", valueLabel: "함께 보기" }
    ]
  },
  {
    id: "c100-s05-03",
    sectionId: "s05",
    title: "식사 중 영상을 보여줄 수 있나요?",
    example: "영상을 틀면 밥을 잘 먹습니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s05-03-a", label: "안 된다", valueLabel: "금지" },
      { id: "c100-s05-03-b", label: "외식할 때만", valueLabel: "외식만" },
      { id: "c100-s05-03-c", label: "안 먹을 때만", valueLabel: "안 먹을 때만" },
      { id: "c100-s05-03-d", label: "된다", valueLabel: "허용" }
    ]
  },
  {
    id: "c100-s05-04",
    sectionId: "s05",
    title: "부모가 지쳤을 때 스크린을 돌봄 도구로 사용하는 것을 허용할까요?",
    example: "저녁 준비와 급한 업무가 겹쳤습니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s05-04-a", label: "그런 날은 써도 된다", valueLabel: "허용" },
      { id: "c100-s05-04-b", label: "30분 같은 상한을 두고 쓴다", valueLabel: "상한 안에서" },
      { id: "c100-s05-04-c", label: "다른 방법(음악·놀이)을 먼저 쓴다", valueLabel: "대안 먼저" },
      { id: "c100-s05-04-d", label: "쓰지 않는다", valueLabel: "금지" }
    ]
  },
  {
    id: "c100-s05-05",
    sectionId: "s05",
    title: "유튜브 자동재생과 숏폼 콘텐츠를 금지할까요?",
    example: "한 편이 끝나면 다음 영상이 자동으로 이어집니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s05-05-a", label: "자동재생과 숏폼 모두 금지", valueLabel: "모두 금지" },
      { id: "c100-s05-05-b", label: "자동재생만 끈다", valueLabel: "자동재생만" },
      { id: "c100-s05-05-c", label: "부모가 고른 것만", valueLabel: "부모 선택만" },
      { id: "c100-s05-05-d", label: "금지하지 않는다", valueLabel: "허용" }
    ]
  },
  {
    id: "c100-s05-06",
    sectionId: "s05",
    title: "아이 사진과 영상을 SNS에 올릴 수 있나요?",
    example: "아이 사진을 올리면 반응이 좋습니다.",
    mood: "안도",
    choices: [
      { id: "c100-s05-06-a", label: "공개 계정에 올린다", valueLabel: "공개" },
      { id: "c100-s05-06-b", label: "비공개 계정에만", valueLabel: "비공개만" },
      { id: "c100-s05-06-c", label: "얼굴이 안 나오게만", valueLabel: "얼굴 가림" },
      { id: "c100-s05-06-d", label: "올리지 않는다", valueLabel: "안 올림" }
    ]
  },
  {
    id: "c100-s05-07",
    sectionId: "s05",
    title: "조부모와 영상통화는 스크린 시간에 포함할까요?",
    example: "조부모가 매일 영상통화를 걸어옵니다.",
    mood: "웃음",
    choices: [
      { id: "c100-s05-07-a", label: "포함하지 않는다", valueLabel: "제외" },
      { id: "c100-s05-07-b", label: "포함한다", valueLabel: "포함" },
      { id: "c100-s05-07-c", label: "시간은 제외하되 횟수는 정한다", valueLabel: "횟수만 제한" },
      { id: "c100-s05-07-d", label: "아이가 원할 때만", valueLabel: "아이가 원할 때" }
    ]
  },
  {
    id: "c100-s05-08",
    sectionId: "s05",
    title: "첫 스마트폰을 언제 어떤 조건으로 줄까요?",
    example: "반 친구 대부분이 스마트폰을 갖고 있습니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s05-08-a", label: "초등 고학년", valueLabel: "초등 고학년" },
      { id: "c100-s05-08-b", label: "중학교 입학", valueLabel: "중학교" },
      { id: "c100-s05-08-c", label: "필요할 때 키즈폰부터", valueLabel: "키즈폰" },
      { id: "c100-s05-08-d", label: "아이가 원하면 언제든", valueLabel: "원하면" }
    ]
  },
  {
    id: "c100-s05-09",
    sectionId: "s05",
    title: "부모가 아이의 메시지와 검색 기록을 확인할 수 있나요?",
    example: "아이 행동이 달라져 휴대폰을 보고 싶어집니다.",
    mood: "희망",
    choices: [
      { id: "c100-s05-09-a", label: "볼 수 있다고 미리 알리고 본다", valueLabel: "알리고 봄" },
      { id: "c100-s05-09-b", label: "걱정될 때만 아이와 함께 본다", valueLabel: "함께 봄" },
      { id: "c100-s05-09-c", label: "안전 문제가 있을 때만", valueLabel: "안전 문제 시" },
      { id: "c100-s05-09-d", label: "보지 않는다", valueLabel: "보지 않음" }
    ]
  },
  {
    id: "c100-s05-10",
    sectionId: "s05",
    title: "부모 자신도 식사·침실에서 휴대폰 규칙을 지켜야 할까요?",
    example: "아이 휴대폰은 막으면서 부모에게 업무 메시지가 옵니다.",
    mood: "여운",
    choices: [
      { id: "c100-s05-10-a", label: "부모도 똑같이", valueLabel: "똑같이" },
      { id: "c100-s05-10-b", label: "업무만 예외", valueLabel: "업무 예외" },
      { id: "c100-s05-10-c", label: "아이 앞에서만 지킨다", valueLabel: "아이 앞에서만" },
      { id: "c100-s05-10-d", label: "부모는 예외", valueLabel: "부모 예외" }
    ]
  },
  {
    id: "c100-s06-01",
    sectionId: "s06",
    title: "어린이집을 빨리 보내는 것과 가정 돌봄 중 무엇을 우선할까요?",
    example: "복직이 다가와 어린이집 자리를 알아봐야 합니다.",
    mood: "미소",
    choices: [
      { id: "c100-s06-01-a", label: "돌 전이라도 보낸다", valueLabel: "빨리 보냄" },
      { id: "c100-s06-01-b", label: "두 돌까지 집에서", valueLabel: "두 돌까지 집" },
      { id: "c100-s06-01-c", label: "복직 시점에 맞춘다", valueLabel: "복직 기준" },
      { id: "c100-s06-01-d", label: "조부모 돌봄 뒤 보낸다", valueLabel: "조부모 뒤" }
    ]
  },
  {
    id: "c100-s06-02",
    sectionId: "s06",
    title: "국공립·민간·가정 어린이집 선택에서 무엇이 가장 중요한가요?",
    example: "집 앞 가정 어린이집과 먼 국공립 사이입니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s06-02-a", label: "거리", valueLabel: "거리" },
      { id: "c100-s06-02-b", label: "교사와 분위기", valueLabel: "교사" },
      { id: "c100-s06-02-c", label: "비용", valueLabel: "비용" },
      { id: "c100-s06-02-d", label: "프로그램", valueLabel: "프로그램" }
    ]
  },
  {
    id: "c100-s06-03",
    sectionId: "s06",
    title: "아이가 울며 등원을 거부하면 얼마나 적응을 기다릴까요?",
    example: "등원할 때마다 아이가 웁니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s06-03-a", label: "1주일", valueLabel: "1주" },
      { id: "c100-s06-03-b", label: "한 달", valueLabel: "한 달" },
      { id: "c100-s06-03-c", label: "교사와 상의해 정한다", valueLabel: "교사와 상의" },
      { id: "c100-s06-03-d", label: "울면 바로 그만둔다", valueLabel: "바로 중단" }
    ]
  },
  {
    id: "c100-s06-04",
    sectionId: "s06",
    title: "교사와 갈등이 생기면 바로 문제를 제기할까요?",
    example: "아이 말과 교사 설명이 다릅니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s06-04-a", label: "바로 면담을 요청한다", valueLabel: "바로" },
      { id: "c100-s06-04-b", label: "며칠 지켜본 뒤", valueLabel: "지켜본 뒤" },
      { id: "c100-s06-04-c", label: "원장에게 말한다", valueLabel: "원장에게" },
      { id: "c100-s06-04-d", label: "기관을 옮긴다", valueLabel: "옮김" }
    ]
  },
  {
    id: "c100-s06-05",
    sectionId: "s06",
    title: "한글·영어·수학 선행교육을 언제 시작할까요?",
    example: "또래가 학원을 시작했다는 이야기를 들었습니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s06-05-a", label: "5세 전후", valueLabel: "5세" },
      { id: "c100-s06-05-b", label: "초등 입학 직전", valueLabel: "입학 직전" },
      { id: "c100-s06-05-c", label: "아이가 관심 보일 때", valueLabel: "관심 보일 때" },
      { id: "c100-s06-05-d", label: "선행은 하지 않는다", valueLabel: "하지 않음" }
    ]
  },
  {
    id: "c100-s06-06",
    sectionId: "s06",
    title: "예체능과 학습 사교육 예산의 상한을 정할까요?",
    example: "학원비가 월 50만 원을 넘기 시작했습니다.",
    mood: "안도",
    choices: [
      { id: "c100-s06-06-a", label: "월 소득의 일정 비율로 정한다", valueLabel: "소득 비율" },
      { id: "c100-s06-06-b", label: "과목 수로 제한한다", valueLabel: "과목 수" },
      { id: "c100-s06-06-c", label: "정하지 않는다", valueLabel: "상한 없음" },
      { id: "c100-s06-06-d", label: "학습만 하고 예체능은 안 한다", valueLabel: "학습만" }
    ]
  },
  {
    id: "c100-s06-07",
    sectionId: "s06",
    title: "다른 아이와 비교하는 말을 가족에게 금지할까요?",
    example: "사촌과 비교하는 말이 식사 자리에서 나옵니다.",
    mood: "웃음",
    choices: [
      { id: "c100-s06-07-a", label: "금지한다고 분명히 말한다", valueLabel: "금지" },
      { id: "c100-s06-07-b", label: "아이 없는 자리에서만 하게 한다", valueLabel: "아이 없을 때만" },
      { id: "c100-s06-07-c", label: "그 가족의 자녀인 쪽이 말한다", valueLabel: "자기 가족은 자기가" },
      { id: "c100-s06-07-d", label: "넘긴다", valueLabel: "넘김" }
    ]
  },
  {
    id: "c100-s06-08",
    sectionId: "s06",
    title: "아이가 학원을 싫어해도 일정 기간 계속하게 할 수 있나요?",
    example: "아이가 피아노를 그만두고 싶다고 합니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s06-08-a", label: "바로 그만둔다", valueLabel: "바로 중단" },
      { id: "c100-s06-08-b", label: "정한 기간(한 학기)까지는 한다", valueLabel: "기간까지" },
      { id: "c100-s06-08-c", label: "이유를 듣고 정한다", valueLabel: "이유 듣고" },
      { id: "c100-s06-08-d", label: "부모가 필요하다고 보면 계속", valueLabel: "부모 판단" }
    ]
  },
  {
    id: "c100-s06-09",
    sectionId: "s06",
    title: "부모가 원하는 교육과 아이가 원하는 활동이 다르면 무엇을 우선할까요?",
    example: "부모는 영어, 아이는 축구를 원합니다.",
    mood: "희망",
    choices: [
      { id: "c100-s06-09-a", label: "아이가 원하는 것", valueLabel: "아이" },
      { id: "c100-s06-09-b", label: "부모가 원하는 것", valueLabel: "부모" },
      { id: "c100-s06-09-c", label: "둘 다 하나씩", valueLabel: "하나씩" },
      { id: "c100-s06-09-d", label: "번갈아 정한다", valueLabel: "번갈아" }
    ]
  },
  {
    id: "c100-s06-10",
    sectionId: "s06",
    title: "교육비 때문에 부모의 노후 준비를 줄일 수 있나요?",
    example: "학원비를 내려면 연금 납입을 줄여야 합니다.",
    mood: "여운",
    choices: [
      { id: "c100-s06-10-a", label: "노후는 줄이지 않는다", valueLabel: "노후 우선" },
      { id: "c100-s06-10-b", label: "일정 기간만 줄인다", valueLabel: "기간 한정" },
      { id: "c100-s06-10-c", label: "아이 교육이 우선이다", valueLabel: "교육 우선" },
      { id: "c100-s06-10-d", label: "다른 지출을 먼저 줄인다", valueLabel: "다른 지출 먼저" }
    ]
  },
  {
    id: "c100-s07-01",
    sectionId: "s07",
    title: "조부모가 돌봐줄 때 부모 규칙을 얼마나 따라야 할까요?",
    example: "조부모 집에서는 우리 집 규칙이 지켜지지 않습니다.",
    mood: "미소",
    choices: [
      { id: "c100-s07-01-a", label: "모두 따라 달라고 한다", valueLabel: "전부" },
      { id: "c100-s07-01-b", label: "안전과 관련된 것만", valueLabel: "안전만" },
      { id: "c100-s07-01-c", label: "서너 가지 핵심만", valueLabel: "핵심만" },
      { id: "c100-s07-01-d", label: "조부모 방식에 맡긴다", valueLabel: "맡김" }
    ]
  },
  {
    id: "c100-s07-02",
    sectionId: "s07",
    title: "무료 돌봄을 받으면 간섭도 어느 정도 감수해야 할까요?",
    example: "무료 돌봄 덕에 일하지만 귀가 시간까지 의견을 듣습니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s07-02-a", label: "간섭은 받지 않고 도움만 받는다", valueLabel: "도움만" },
      { id: "c100-s07-02-b", label: "돌봄 시간 안의 일은 조부모가 정한다", valueLabel: "돌봄 시간만" },
      { id: "c100-s07-02-c", label: "의견은 듣되 결정은 우리가", valueLabel: "듣기만" },
      { id: "c100-s07-02-d", label: "간섭이 크면 유료 돌봄으로 바꾼다", valueLabel: "유료로 전환" }
    ]
  },
  {
    id: "c100-s07-03",
    sectionId: "s07",
    title: "양가 조부모에게 아이를 만나는 시간을 똑같이 배분해야 할까요?",
    example: "한쪽 조부모만 매주 만납니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s07-03-a", label: "똑같이 나눈다", valueLabel: "똑같이" },
      { id: "c100-s07-03-b", label: "가까운 쪽이 더 자주", valueLabel: "가까운 쪽" },
      { id: "c100-s07-03-c", label: "원하는 만큼 각자", valueLabel: "각자 원하는 만큼" },
      { id: "c100-s07-03-d", label: "아이가 편한 쪽", valueLabel: "아이 기준" }
    ]
  },
  {
    id: "c100-s07-04",
    sectionId: "s07",
    title: "조부모가 부모를 무시하고 아이에게 직접 약속해도 될까요?",
    example: "부모 허락 없이 여행을 약속했습니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s07-04-a", label: "안 된다고 분명히 말한다", valueLabel: "불가" },
      { id: "c100-s07-04-b", label: "작은 것은 괜찮다", valueLabel: "작은 것만" },
      { id: "c100-s07-04-c", label: "그 가족의 자녀인 쪽이 말한다", valueLabel: "자기 가족은 자기가" },
      { id: "c100-s07-04-d", label: "약속은 지키게 하고 다음에 말한다", valueLabel: "이번만 지킴" }
    ]
  },
  {
    id: "c100-s07-05",
    sectionId: "s07",
    title: "베이비시터·가사도우미 이용에 얼마까지 쓸까요?",
    example: "정기 도우미를 쓰면 저축을 줄여야 합니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s07-05-a", label: "소득의 일정 비율까지", valueLabel: "소득 비율" },
      { id: "c100-s07-05-b", label: "저축을 유지하는 범위", valueLabel: "저축 유지" },
      { id: "c100-s07-05-c", label: "필요하면 상한 없이", valueLabel: "상한 없음" },
      { id: "c100-s07-05-d", label: "쓰지 않는다", valueLabel: "안 씀" }
    ]
  },
  {
    id: "c100-s07-06",
    sectionId: "s07",
    title: "도우미 집에 CCTV를 설치할 수 있나요?",
    example: "도우미가 오는 시간에 집을 비웁니다.",
    mood: "안도",
    choices: [
      { id: "c100-s07-06-a", label: "알리고 설치한다", valueLabel: "알리고 설치" },
      { id: "c100-s07-06-b", label: "설치하지 않는다", valueLabel: "설치 안 함" },
      { id: "c100-s07-06-c", label: "거실만", valueLabel: "거실만" },
      { id: "c100-s07-06-d", label: "도우미가 동의하면", valueLabel: "동의 시" }
    ]
  },
  {
    id: "c100-s07-07",
    sectionId: "s07",
    title: "아픈 조부모의 돌봄 요청과 아이 돌봄이 겹치면 무엇을 우선할까요?",
    example: "조부모 입원과 아이 돌봄이 같은 주에 겹쳤습니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s07-07-a", label: "아이 돌봄", valueLabel: "아이" },
      { id: "c100-s07-07-b", label: "조부모 돌봄", valueLabel: "조부모" },
      { id: "c100-s07-07-c", label: "각자 나눠 맡는다", valueLabel: "나눔" },
      { id: "c100-s07-07-d", label: "외부 도움을 사서 둘 다", valueLabel: "외부 도움" }
    ]
  },
  {
    id: "c100-s07-08",
    sectionId: "s07",
    title: "친척이 아이에게 원치 않는 신체 접촉을 요구하면 어떻게 막을까요?",
    example: "아이가 싫다는데 뽀뽀를 요구합니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s07-08-a", label: "그 자리에서 아이 편을 든다", valueLabel: "즉시 아이 편" },
      { id: "c100-s07-08-b", label: "아이가 스스로 거절하게 가르친다", valueLabel: "아이가 거절" },
      { id: "c100-s07-08-c", label: "나중에 따로 말한다", valueLabel: "따로 말함" },
      { id: "c100-s07-08-d", label: "예의라고 아이를 설득한다", valueLabel: "아이 설득" }
    ]
  },
  {
    id: "c100-s07-09",
    sectionId: "s07",
    title: "가족이 아이의 사진을 단체방이나 SNS에 공유할 수 있나요?",
    example: "이모가 아이 사진을 SNS에 올렸습니다.",
    mood: "희망",
    choices: [
      { id: "c100-s07-09-a", label: "단체방만 되고 SNS는 안 된다", valueLabel: "단체방만" },
      { id: "c100-s07-09-b", label: "허락받으면 된다", valueLabel: "허락 시" },
      { id: "c100-s07-09-c", label: "모두 안 된다", valueLabel: "모두 금지" },
      { id: "c100-s07-09-d", label: "모두 된다", valueLabel: "모두 허용" }
    ]
  },
  {
    id: "c100-s07-10",
    sectionId: "s07",
    title: "조부모의 종교·정치·성 역할 교육은 어디까지 허용할까요?",
    example: "조부모가 아이에게 기도를 시키고 \"남자는\"이라는 말을 합니다.",
    mood: "여운",
    choices: [
      { id: "c100-s07-10-a", label: "어떤 것도 하지 말라고 한다", valueLabel: "모두 금지" },
      { id: "c100-s07-10-b", label: "종교는 되고 성 역할 말은 안 된다", valueLabel: "일부만" },
      { id: "c100-s07-10-c", label: "조부모 집에서는 자유", valueLabel: "조부모 집 자유" },
      { id: "c100-s07-10-d", label: "아이에게 집에서 다르게 설명한다", valueLabel: "집에서 설명" }
    ]
  },
  {
    id: "c100-s08-01",
    sectionId: "s08",
    title: "육아 중 부부 데이트를 위해 아이를 맡길 수 있나요?",
    example: "몇 달째 둘만의 대화가 없습니다.",
    mood: "미소",
    choices: [
      { id: "c100-s08-01-a", label: "한 달에 한 번은 맡기고 나간다", valueLabel: "월 1회" },
      { id: "c100-s08-01-b", label: "아이가 잠든 뒤 집에서 데이트한다", valueLabel: "집에서" },
      { id: "c100-s08-01-c", label: "아이를 데리고 함께 나간다", valueLabel: "함께 외출" },
      { id: "c100-s08-01-d", label: "아이가 클 때까지 미룬다", valueLabel: "미룸" }
    ]
  },
  {
    id: "c100-s08-02",
    sectionId: "s08",
    title: "각자의 취미와 친구 만남 시간을 어떻게 공평하게 보장할까요?",
    example: "한 사람만 주말에 외출합니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s08-02-a", label: "주말 반나절씩 번갈아", valueLabel: "번갈아" },
      { id: "c100-s08-02-b", label: "각자 주 1회 저녁", valueLabel: "주 1회" },
      { id: "c100-s08-02-c", label: "필요할 때 말하고 조율", valueLabel: "그때 조율" },
      { id: "c100-s08-02-d", label: "육아 중에는 둘 다 줄인다", valueLabel: "둘 다 줄임" }
    ]
  },
  {
    id: "c100-s08-03",
    sectionId: "s08",
    title: "육아 피로로 성생활이 줄어들 때 어떻게 대화할까요?",
    example: "몇 달째 친밀감이 없고 말도 꺼내지 못합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s08-03-a", label: "느끼는 쪽이 바로 말한다", valueLabel: "바로 말함" },
      { id: "c100-s08-03-b", label: "정기 대화에서 꺼낸다", valueLabel: "정기 대화" },
      { id: "c100-s08-03-c", label: "말보다 시간을 먼저 만든다", valueLabel: "시간 먼저" },
      { id: "c100-s08-03-d", label: "상담사와 이야기한다", valueLabel: "상담" }
    ]
  },
  {
    id: "c100-s08-04",
    sectionId: "s08",
    title: "아이 앞에서 부부가 다투는 것을 어디까지 피해야 할까요?",
    example: "아이가 두 사람의 표정을 살피기 시작했습니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s08-04-a", label: "아이 앞에서는 절대 안 한다", valueLabel: "절대 금지" },
      { id: "c100-s08-04-b", label: "소리 높이지 않으면 된다", valueLabel: "조용하면 됨" },
      { id: "c100-s08-04-c", label: "다투더라도 화해도 보여 준다", valueLabel: "화해까지" },
      { id: "c100-s08-04-d", label: "피할 수 없다", valueLabel: "피하지 않음" }
    ]
  },
  {
    id: "c100-s08-05",
    sectionId: "s08",
    title: "출산 몇 달 뒤 우울이 의심되면 무엇부터 할까요?",
    example: "출산 넉 달째, 아이를 재우고도 눈물이 나고 아무것도 하기 싫은 날이 2주 넘게 이어집니다.",
    mood: "조심스러움",
    choices: [
      { id: "c100-s08-05-a", label: "보건소나 정신건강복지센터에 바로 검사를 예약한다", valueLabel: "바로 검사" },
      { id: "c100-s08-05-b", label: "다음 산부인과·소아과 방문 때 함께 이야기한다", valueLabel: "다음 진료 때" },
      { id: "c100-s08-05-c", label: "잠과 도움을 먼저 늘리고 2주 더 지켜본다", valueLabel: "도움 먼저" },
      { id: "c100-s08-05-d", label: "산후에 흔한 일이니 그냥 지켜본다", valueLabel: "지켜봄" }
    ]
  },
  {
    id: "c100-s08-06",
    sectionId: "s08",
    title: "수유 중에 우울증 약 치료를 권받으면 어떻게 정할까요?",
    example: "의사가 수유 중에도 쓸 수 있는 약을 권했지만 한 사람은 약이 아기에게 갈까 걱정합니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s08-06-a", label: "의사 설명을 믿고 약을 시작한다", valueLabel: "약 시작" },
      { id: "c100-s08-06-b", label: "약 대신 상담 치료부터 해 본다", valueLabel: "상담 우선" },
      { id: "c100-s08-06-c", label: "약을 먹는 동안 분유로 바꾼다", valueLabel: "분유 전환" },
      { id: "c100-s08-06-d", label: "약 없이 버티고 수유를 지킨다", valueLabel: "약 없이" }
    ]
  },
  {
    id: "c100-s08-07",
    sectionId: "s08",
    title: "파트너가 우울해 보이면 누가 어떻게 꺼낼까요?",
    example: "출산 뒤 파트너가 말수가 줄고 밤마다 혼자 술을 마시기 시작했습니다.",
    mood: "안도",
    choices: [
      { id: "c100-s08-07-a", label: "알아챈 쪽이 오늘 저녁 바로 묻는다", valueLabel: "바로 묻기" },
      { id: "c100-s08-07-b", label: "아이 없는 시간을 만들어 천천히 묻는다", valueLabel: "시간 만들어" },
      { id: "c100-s08-07-c", label: "파트너의 친구나 가족에게 살펴봐 달라고 한다", valueLabel: "주변에 부탁" },
      { id: "c100-s08-07-d", label: "본인이 말할 때까지 기다린다", valueLabel: "기다림" }
    ]
  },
  {
    id: "c100-s08-08",
    sectionId: "s08",
    title: "부부 상담을 시작할 기준을 미리 정할까요?",
    example: "다툼이 반복되는데 상담은 과하다는 말이 나옵니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s08-08-a", label: "한 사람이 원하면", valueLabel: "한 명이 원하면" },
      { id: "c100-s08-08-b", label: "같은 다툼이 세 번 반복되면", valueLabel: "반복 기준" },
      { id: "c100-s08-08-c", label: "아이가 영향을 받으면", valueLabel: "아이 영향 시" },
      { id: "c100-s08-08-d", label: "정하지 않는다", valueLabel: "정하지 않음" }
    ]
  },
  {
    id: "c100-s08-09",
    sectionId: "s08",
    title: "둘째 계획은 누가 더 힘든지를 어떻게 반영해 결정할까요?",
    example: "첫째도 안정되지 않았는데 둘째 이야기가 나옵니다.",
    mood: "희망",
    choices: [
      { id: "c100-s08-09-a", label: "출산하는 사람이 정한다", valueLabel: "출산자 결정" },
      { id: "c100-s08-09-b", label: "둘 다 원할 때만", valueLabel: "둘 다 원할 때" },
      { id: "c100-s08-09-c", label: "주 양육자가 정한다", valueLabel: "주 양육자" },
      { id: "c100-s08-09-d", label: "나이와 경제 조건으로 정한다", valueLabel: "조건으로" }
    ]
  },
  {
    id: "c100-s08-10",
    sectionId: "s08",
    title: "가족이 \"산후엔 다 그래\"라고 넘길 때 두 사람은 어떻게 할까요?",
    example: "우울이 심하다고 말했더니 어머니가 다들 겪는 일이라며 참으라고 합니다.",
    mood: "여운",
    choices: [
      { id: "c100-s08-10-a", label: "가족에게 진단과 치료 계획을 분명히 설명한다", valueLabel: "설명함" },
      { id: "c100-s08-10-b", label: "가족 말은 듣지 않고 둘이서 치료를 진행한다", valueLabel: "둘이서 진행" },
      { id: "c100-s08-10-c", label: "의사 소견서를 보여 준다", valueLabel: "소견서로" },
      { id: "c100-s08-10-d", label: "가족 말대로 조금 더 참아 본다", valueLabel: "참아 봄" }
    ]
  },
  {
    id: "c100-s09-01",
    sectionId: "s09",
    title: "육아비는 소득 비율과 절반 분담 중 무엇이 공정할까요?",
    example: "소득은 다르고 무급 돌봄 시간도 다릅니다.",
    mood: "미소",
    choices: [
      { id: "c100-s09-01-a", label: "절반씩", valueLabel: "절반" },
      { id: "c100-s09-01-b", label: "소득 비율", valueLabel: "소득 비율" },
      { id: "c100-s09-01-c", label: "돌봄 시간을 반영해 조정", valueLabel: "돌봄 반영" },
      { id: "c100-s09-01-d", label: "공동 계좌에서 나누지 않는다", valueLabel: "나누지 않음" }
    ]
  },
  {
    id: "c100-s09-02",
    sectionId: "s09",
    title: "한 사람이 경력 단절을 감수하면 공동자산에서 어떻게 보상할까요?",
    example: "한 사람이 근무시간 축소를 받아들였습니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s09-02-a", label: "자산 명의를 나눈다", valueLabel: "명의 분할" },
      { id: "c100-s09-02-b", label: "개인 연금·저축을 더 넣는다", valueLabel: "연금 보전" },
      { id: "c100-s09-02-c", label: "복귀 비용을 공동 부담한다", valueLabel: "복귀 지원" },
      { id: "c100-s09-02-d", label: "보상하지 않는다", valueLabel: "보상 없음" }
    ]
  },
  {
    id: "c100-s09-03",
    sectionId: "s09",
    title: "맞벌이와 외벌이 중 무엇을 언제 재검토할까요?",
    example: "돌봄 공백에 한 사람 퇴직 이야기가 나옵니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s09-03-a", label: "매년", valueLabel: "매년" },
      { id: "c100-s09-03-b", label: "아이 입학 같은 시점마다", valueLabel: "전환 시점" },
      { id: "c100-s09-03-c", label: "소득이 바뀔 때", valueLabel: "소득 변화 시" },
      { id: "c100-s09-03-d", label: "한 번 정하면 유지", valueLabel: "유지" }
    ]
  },
  {
    id: "c100-s09-04",
    sectionId: "s09",
    title: "육아휴직 이후 승진·이직 손실을 부부 문제로 볼까요?",
    example: "휴직한 사람만 승진에서 밀렸습니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s09-04-a", label: "부부 공동 손실로 본다", valueLabel: "공동 손실" },
      { id: "c100-s09-04-b", label: "다음 휴직은 상대가", valueLabel: "다음엔 교대" },
      { id: "c100-s09-04-c", label: "금전으로 보상", valueLabel: "금전 보상" },
      { id: "c100-s09-04-d", label: "개인 문제", valueLabel: "개인 문제" }
    ]
  },
  {
    id: "c100-s09-05",
    sectionId: "s09",
    title: "아이를 위해 더 넓은 집이나 좋은 학군으로 이사할까요?",
    example: "학군 좋은 동네는 집값이 두 배입니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s09-05-a", label: "무리해서라도 이사", valueLabel: "이사" },
      { id: "c100-s09-05-b", label: "예산 안에서만", valueLabel: "예산 안에서" },
      { id: "c100-s09-05-c", label: "입학 전까지 지켜본다", valueLabel: "지켜봄" },
      { id: "c100-s09-05-d", label: "이사하지 않는다", valueLabel: "안 함" }
    ]
  },
  {
    id: "c100-s09-06",
    sectionId: "s09",
    title: "아기용품은 새것·중고·대여 중 무엇을 기본으로 할까요?",
    example: "유모차 새것은 100만 원이 넘습니다.",
    mood: "안도",
    choices: [
      { id: "c100-s09-06-a", label: "새것", valueLabel: "새것" },
      { id: "c100-s09-06-b", label: "중고", valueLabel: "중고" },
      { id: "c100-s09-06-c", label: "대여", valueLabel: "대여" },
      { id: "c100-s09-06-d", label: "안전 용품만 새것", valueLabel: "안전만 새것" }
    ]
  },
  {
    id: "c100-s09-07",
    sectionId: "s09",
    title: "아이에게 드는 비용을 얼마나 투명하게 기록할까요?",
    example: "아이 지출이 어디로 나가는지 모릅니다.",
    mood: "웃음",
    choices: [
      { id: "c100-s09-07-a", label: "앱으로 전부 기록", valueLabel: "전부 기록" },
      { id: "c100-s09-07-b", label: "큰 지출만", valueLabel: "큰 것만" },
      { id: "c100-s09-07-c", label: "월 한도만 정한다", valueLabel: "한도만" },
      { id: "c100-s09-07-d", label: "기록하지 않는다", valueLabel: "기록 없음" }
    ]
  },
  {
    id: "c100-s09-08",
    sectionId: "s09",
    title: "아이 통장과 증여·저축은 어느 수준부터 시작할까요?",
    example: "돌 축하금을 어디에 둘지 정해야 합니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s09-08-a", label: "태어나자마자 매월 정액", valueLabel: "매월 정액" },
      { id: "c100-s09-08-b", label: "축하금과 용돈만", valueLabel: "받은 돈만" },
      { id: "c100-s09-08-c", label: "초등 입학부터", valueLabel: "입학부터" },
      { id: "c100-s09-08-d", label: "따로 하지 않는다", valueLabel: "안 함" }
    ]
  },
  {
    id: "c100-s09-09",
    sectionId: "s09",
    title: "부모 지원금이나 양가 도움을 받을 때 형평성을 따질까요?",
    example: "한쪽 부모만 매달 돈을 보냅니다.",
    mood: "희망",
    choices: [
      { id: "c100-s09-09-a", label: "양쪽 똑같이 받거나 둘 다 안 받는다", valueLabel: "똑같이" },
      { id: "c100-s09-09-b", label: "주는 대로 받는다", valueLabel: "주는 대로" },
      { id: "c100-s09-09-c", label: "받되 조건은 없어야", valueLabel: "조건 없이" },
      { id: "c100-s09-09-d", label: "받지 않는다", valueLabel: "안 받음" }
    ]
  },
  {
    id: "c100-s09-10",
    sectionId: "s09",
    title: "부모의 노동시간을 줄이기 위해 생활수준을 낮출 수 있나요?",
    example: "한 사람이 근무를 줄이면 소득이 30% 줍니다.",
    mood: "여운",
    choices: [
      { id: "c100-s09-10-a", label: "낮춘다", valueLabel: "낮춤" },
      { id: "c100-s09-10-b", label: "일정 기간만", valueLabel: "기간 한정" },
      { id: "c100-s09-10-c", label: "외식·여행 정도만", valueLabel: "일부만" },
      { id: "c100-s09-10-d", label: "낮추지 않는다", valueLabel: "유지" }
    ]
  },
  {
    id: "c100-s10-01",
    sectionId: "s10",
    title: "아이의 발달이 늦어 보이면 언제 검사를 받을까요?",
    example: "검진에서 조금 더 지켜보자는 말을 들었습니다.",
    mood: "미소",
    choices: [
      { id: "c100-s10-01-a", label: "걱정되면 바로", valueLabel: "바로" },
      { id: "c100-s10-01-b", label: "다음 검진까지", valueLabel: "다음 검진" },
      { id: "c100-s10-01-c", label: "의사가 권하면", valueLabel: "의사 권고" },
      { id: "c100-s10-01-d", label: "어린이집 교사 의견을 듣고", valueLabel: "교사 의견" }
    ]
  },
  {
    id: "c100-s10-02",
    sectionId: "s10",
    title: "진단이나 치료 제안을 가족이 반대하면 무엇을 우선할까요?",
    example: "조부모가 \"크면 다 괜찮아진다\"며 반대합니다.",
    mood: "호기심",
    choices: [
      { id: "c100-s10-02-a", label: "전문가 권고", valueLabel: "전문가" },
      { id: "c100-s10-02-b", label: "부모 판단", valueLabel: "부모" },
      { id: "c100-s10-02-c", label: "한 번 더 검사 뒤", valueLabel: "재검사" },
      { id: "c100-s10-02-d", label: "가족 뜻", valueLabel: "가족" }
    ]
  },
  {
    id: "c100-s10-03",
    sectionId: "s10",
    title: "아이의 기질을 문제행동과 어떻게 구분할까요?",
    example: "아이가 낯선 곳에서 늘 웁니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "c100-s10-03-a", label: "전문가 평가", valueLabel: "전문가" },
      { id: "c100-s10-03-b", label: "다른 상황에서도 반복되는지", valueLabel: "반복 여부" },
      { id: "c100-s10-03-c", label: "또래와 비교", valueLabel: "또래 비교" },
      { id: "c100-s10-03-d", label: "구분하지 않고 받아들인다", valueLabel: "구분 안 함" }
    ]
  },
  {
    id: "c100-s10-04",
    sectionId: "s10",
    title: "놀이터와 야외활동에서 위험을 어느 정도 허용할까요?",
    example: "아이가 높은 정글짐에 오르려 합니다.",
    mood: "현실감",
    choices: [
      { id: "c100-s10-04-a", label: "다칠 수 있는 것은 막는다", valueLabel: "막음" },
      { id: "c100-s10-04-b", label: "큰 부상 위험만 막는다", valueLabel: "큰 위험만" },
      { id: "c100-s10-04-c", label: "옆에서 지켜보며 두게 한다", valueLabel: "지켜봄" },
      { id: "c100-s10-04-d", label: "아이가 스스로 판단하게 둔다", valueLabel: "아이 판단" }
    ]
  },
  {
    id: "c100-s10-05",
    sectionId: "s10",
    title: "아이 혼자 심부름·등하교를 언제 허용할까요?",
    example: "아이가 혼자 해보겠다고 합니다.",
    mood: "걱정",
    choices: [
      { id: "c100-s10-05-a", label: "초등 1학년", valueLabel: "1학년" },
      { id: "c100-s10-05-b", label: "초등 3~4학년", valueLabel: "3~4학년" },
      { id: "c100-s10-05-c", label: "아이가 원하면 연습 뒤", valueLabel: "연습 뒤" },
      { id: "c100-s10-05-d", label: "가능한 한 늦게", valueLabel: "늦게" }
    ]
  },
  {
    id: "c100-s10-06",
    sectionId: "s10",
    title: "아이의 방과 물건을 부모가 허락 없이 볼 수 있나요?",
    example: "아이 행동이 달라져 방을 보고 싶어집니다.",
    mood: "안도",
    choices: [
      { id: "c100-s10-06-a", label: "안전 걱정이 있을 때만", valueLabel: "안전 시만" },
      { id: "c100-s10-06-b", label: "알리고 본다", valueLabel: "알리고" },
      { id: "c100-s10-06-c", label: "볼 수 있다", valueLabel: "허용" },
      { id: "c100-s10-06-d", label: "보지 않는다", valueLabel: "금지" }
    ]
  },
  {
    id: "c100-s10-07",
    sectionId: "s10",
    title: "아이의 머리·옷·취향 선택권을 어디까지 인정할까요?",
    example: "아이가 머리를 파랗게 염색하고 싶어 합니다.",
    mood: "웃음",
    choices: [
      { id: "c100-s10-07-a", label: "전부 아이 뜻", valueLabel: "전부" },
      { id: "c100-s10-07-b", label: "학교 규정 안에서", valueLabel: "규정 안에서" },
      { id: "c100-s10-07-c", label: "되돌릴 수 있는 것만", valueLabel: "되돌릴 수 있는 것" },
      { id: "c100-s10-07-d", label: "부모가 정한다", valueLabel: "부모" }
    ]
  },
  {
    id: "c100-s10-08",
    sectionId: "s10",
    title: "성교육과 신체 경계 교육을 언제 누가 시작할까요?",
    example: "아이가 몸에 대해 묻기 시작했습니다.",
    mood: "진지함",
    choices: [
      { id: "c100-s10-08-a", label: "3~4세부터 부모가", valueLabel: "3~4세 부모" },
      { id: "c100-s10-08-b", label: "초등부터 부모가", valueLabel: "초등 부모" },
      { id: "c100-s10-08-c", label: "기관과 학교에 맡긴다", valueLabel: "기관" },
      { id: "c100-s10-08-d", label: "물어볼 때마다 답한다", valueLabel: "물을 때" }
    ]
  },
  {
    id: "c100-s10-09",
    sectionId: "s10",
    title: "아이에게 가족의 경제·갈등 상황을 어디까지 설명할까요?",
    example: "아이가 외식이 줄어든 이유를 묻습니다.",
    mood: "희망",
    choices: [
      { id: "c100-s10-09-a", label: "사실대로", valueLabel: "사실대로" },
      { id: "c100-s10-09-b", label: "아이 수준으로 줄여서", valueLabel: "줄여서" },
      { id: "c100-s10-09-c", label: "안심시키는 말만", valueLabel: "안심만" },
      { id: "c100-s10-09-d", label: "말하지 않는다", valueLabel: "말 안 함" }
    ]
  },
  {
    id: "c100-s10-10",
    sectionId: "s10",
    title: "부모의 가치와 다른 정체성·진로를 아이가 선택하면 어떻게 지지할까요?",
    example: "아이가 부모 기대와 다른 길을 말합니다.",
    mood: "여운",
    choices: [
      { id: "c100-s10-10-a", label: "조건 없이 지지", valueLabel: "무조건 지지" },
      { id: "c100-s10-10-b", label: "지지하되 걱정도 말한다", valueLabel: "지지와 걱정" },
      { id: "c100-s10-10-c", label: "시간을 두고 지켜본다", valueLabel: "지켜봄" },
      { id: "c100-s10-10-d", label: "부모 뜻을 설득한다", valueLabel: "설득" }
    ]
  }
  ]
});

export const parenting100Questions = parenting100Pack.orderedQuestions;
