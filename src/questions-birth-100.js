/**
 * 출산 100제 — a site pack. Generated; do not edit by hand.
 *
 * Source: `question-packs/birth.html`, the editorial review build.
 * Regenerate: `node scripts/build-site-packs.mjs birth`. `test/site-packs.test.js` fails if
 * this file and that one disagree.
 *
 * The source's last section — the emergency appendix — is not here on purpose. It is a quiz with
 * right and wrong answers about emergencies, which cannot live inside a site whose whole contract is
 * that there is no score and no verdict, and `question-packs/README.md` requires medical review
 * before that material is promoted to any runtime.
 */
import { definePack, PACK_SURFACE } from "./pack-schema.js";

export const birth100Pack = definePack({
  id: "birth-100",
  surface: PACK_SURFACE.site,
  audience: "couple",
  version: "2026-09-28",
  locale: "ko-KR",
  title: "출산 100제",
  sections: [
  { id: "s01", title: "다가오는 날", blurb: "어느 병원에서, 어떤 방식으로. 출산 전에 정해 두는 큰 선택에 두 사람이 무엇을 믿는지 보여요." },
  { id: "s02", title: "진통이 시작되면", blurb: "신호가 애매한 밤, 병원까지의 길. 첫 움직임을 어떻게 시작하는지에 두 사람의 결이 보여요." },
  { id: "s03", title: "결정의 순간", blurb: "응급 제왕절개, 동의서, 설명이 부족한 순간. 시간이 없을 때 두 사람이 무엇을 붙잡는지 보여요." },
  { id: "s04", title: "곁에 있는 사람", blurb: "분만실에 누가 들어올지, 첫 사진을 누가 언제 보낼지. 그날 문을 얼마나 여는지에 경계가 보여요." },
  { id: "s05", title: "처음 만나는 순간", blurb: "첫 안기, 이름, 첫 얼굴 공개. 아기를 처음 만난 날 무엇을 먼저 하는지에 두 사람의 마음이 보여요." },
  { id: "s06", title: "병실에서의 며칠", blurb: "휴식, 간병, 병실 비용, 퇴원. 입원한 며칠 동안 누가 무엇을 맡는지에 두 사람의 방식이 보여요." },
  { id: "s07", title: "먹이는 일", blurb: "모유, 분유, 밤 수유, 유축. 누가 무엇을 얼마나 먹일지에 두 사람의 기준이 보여요." },
  { id: "s08", title: "찾아오는 사람들", blurb: "면회, 방문, 위생 요구, 단체방. 아기를 보러 오는 사람들 앞에서 문을 어디까지 여는지 보여요." },
  { id: "s09", title: "몸을 되찾는 시간", blurb: "조리원, 도우미, 수면, 성생활, 우울. 몸과 마음을 회복하는 방식에 두 사람의 우선순위가 보여요." },
  { id: "s10", title: "계획이 흔들릴 때", blurb: "신생아집중치료실, 응급 치료, 트라우마, 갈등. 가장 어려운 순간에 두 사람이 무엇을 붙잡는지 보여요." }
  ],
  questions: [
  {
    id: "b100-s01-01",
    sectionId: "s01",
    title: "종합병원·여성병원·조산원 중 무엇을 가장 우선해 선택할까요?",
    example: "가까운 여성병원, 먼 종합병원, 원하는 방식의 조산원이 후보입니다.",
    mood: "미소",
    choices: [
      { id: "b100-s01-01-a", label: "응급 대응이 되는 종합병원", valueLabel: "응급 대응" },
      { id: "b100-s01-01-b", label: "집에서 가까운 여성병원", valueLabel: "거리" },
      { id: "b100-s01-01-c", label: "원하는 출산 방식을 지켜 주는 조산원이나 자연주의 병원", valueLabel: "출산 방식" },
      { id: "b100-s01-01-d", label: "임신 기간 다닌 병원 그대로", valueLabel: "다니던 곳" }
    ]
  },
  {
    id: "b100-s01-02",
    sectionId: "s01",
    title: "자연분만과 제왕절개에 대한 희망이 의료진 권고와 다르면 무엇을 우선할까요?",
    example: "마지막 진료에서 의료진이 처음 계획과 다른 분만 방식을 권했습니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s01-02-a", label: "의료진 권고를 따른다", valueLabel: "의료진 권고" },
      { id: "b100-s01-02-b", label: "출산하는 사람의 희망을 지킨다", valueLabel: "당사자 희망" },
      { id: "b100-s01-02-c", label: "다른 병원에서 한 번 더 의견을 듣고 정한다", valueLabel: "2차 소견" },
      { id: "b100-s01-02-d", label: "위험이 얼마나 되는지 숫자로 듣고 그때 정한다", valueLabel: "위험 수치로" }
    ]
  },
  {
    id: "b100-s01-03",
    sectionId: "s01",
    title: "무통주사 사용 여부는 언제 결정하는 것이 좋을까요?",
    example: "진통이 빨라져 지금 정해야 효과가 있다는 말을 들었습니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "b100-s01-03-a", label: "출산 전에 정해 두고 그대로 한다", valueLabel: "미리 확정" },
      { id: "b100-s01-03-b", label: "진통 중 산모가 원하면 그때 바로 맞는다", valueLabel: "당사자가 그때" },
      { id: "b100-s01-03-c", label: "의료진이 권하는 시점에 맞춘다", valueLabel: "의료진 시점" },
      { id: "b100-s01-03-d", label: "처음부터 맞지 않기로 한다", valueLabel: "사용 안 함" }
    ]
  },
  {
    id: "b100-s01-04",
    sectionId: "s01",
    title: "유도분만 제안을 받으면 어떤 기준으로 판단할까요?",
    example: "예정일이 지나 의료진이 유도분만 날짜를 잡자고 합니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s01-04-a", label: "의료진이 권하면 그날로 한다", valueLabel: "권하면 바로" },
      { id: "b100-s01-04-b", label: "정해 둔 기한(예: 41주)까지는 기다린다", valueLabel: "기한까지 기다림" },
      { id: "b100-s01-04-c", label: "태아 상태 검사 결과가 나쁠 때만 한다", valueLabel: "검사 결과로" },
      { id: "b100-s01-04-d", label: "산모 몸이 힘들면 산모가 정한다", valueLabel: "산모 컨디션" }
    ]
  },
  {
    id: "b100-s01-05",
    sectionId: "s01",
    title: "브이백이나 계획 제왕절개처럼 선택지가 여러 개일 때 최종 결정은 어떻게 할까요?",
    example: "첫째를 제왕절개로 낳아 이번엔 브이백을 시도할지 정해야 합니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s01-05-a", label: "출산하는 사람이 정한다", valueLabel: "당사자 결정" },
      { id: "b100-s01-05-b", label: "의료진이 더 안전하다고 하는 쪽", valueLabel: "더 안전한 쪽" },
      { id: "b100-s01-05-c", label: "회복이 빠른 쪽", valueLabel: "회복 속도" },
      { id: "b100-s01-05-d", label: "두 사람이 합의될 때까지 이야기한다", valueLabel: "합의" }
    ]
  },
  {
    id: "b100-s01-06",
    sectionId: "s01",
    title: "출산 병원의 거리와 의료 대응 수준 중 무엇이 더 중요할까요?",
    example: "가까운 병원은 응급 수술이 안 되고, 큰 병원은 50분 거리입니다.",
    mood: "안도",
    choices: [
      { id: "b100-s01-06-a", label: "멀어도 응급 대응이 되는 큰 병원", valueLabel: "대응 수준" },
      { id: "b100-s01-06-b", label: "가까운 병원에 다니고 응급 때 이송을 믿는다", valueLabel: "거리" },
      { id: "b100-s01-06-c", label: "예정일 한 달 전에 큰 병원 근처로 거처를 옮긴다", valueLabel: "거처 이동" },
      { id: "b100-s01-06-d", label: "진료는 가까운 곳, 출산만 큰 병원에서", valueLabel: "진료와 출산 분리" }
    ]
  },
  {
    id: "b100-s01-07",
    sectionId: "s01",
    title: "분만실 환경과 의료진 성별에 관한 선호를 어디까지 요청할까요?",
    example: "여성 의료진, 조명, 음악 같은 희망 사항을 병원에 전할지 고민됩니다.",
    mood: "웃음",
    choices: [
      { id: "b100-s01-07-a", label: "원하는 것을 모두 적어 병원에 미리 요청한다", valueLabel: "전부 요청" },
      { id: "b100-s01-07-b", label: "의료진 성별처럼 중요한 한두 가지만 요청한다", valueLabel: "핵심만" },
      { id: "b100-s01-07-c", label: "병원이 제공하는 대로 따른다", valueLabel: "요청 없음" },
      { id: "b100-s01-07-d", label: "요청이 되는 병원으로 병원을 바꾼다", valueLabel: "병원 선택" }
    ]
  },
  {
    id: "b100-s01-08",
    sectionId: "s01",
    title: "둘라·조산사 같은 별도 출산 지원을 이용할까요?",
    example: "첫 출산이라 진통 중 도와줄 경험자가 있으면 안심될 것 같습니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s01-08-a", label: "비용을 들여 둘라나 조산사를 부른다", valueLabel: "전문 지원" },
      { id: "b100-s01-08-b", label: "파트너가 출산 교육을 받아 그 역할을 맡는다", valueLabel: "파트너가 준비" },
      { id: "b100-s01-08-c", label: "출산 경험이 있는 가족에게 함께 있어 달라고 한다", valueLabel: "가족 경험자" },
      { id: "b100-s01-08-d", label: "병원 의료진만으로 충분하다", valueLabel: "의료진만" }
    ]
  },
  {
    id: "b100-s01-09",
    sectionId: "s01",
    title: "출산 계획서를 얼마나 구체적으로 작성할까요?",
    example: "병원에서 출산 계획서 양식을 주었습니다.",
    mood: "희망",
    choices: [
      { id: "b100-s01-09-a", label: "진통·분만·직후까지 항목별로 자세히 적는다", valueLabel: "자세히" },
      { id: "b100-s01-09-b", label: "꼭 지키고 싶은 서너 가지만 적는다", valueLabel: "핵심만" },
      { id: "b100-s01-09-c", label: "적지 않고 그때그때 의료진과 정한다", valueLabel: "작성 안 함" },
      { id: "b100-s01-09-d", label: "파트너가 지켜야 할 역할 위주로 적는다", valueLabel: "파트너 역할 중심" }
    ]
  },
  {
    id: "b100-s01-10",
    sectionId: "s01",
    title: "계획과 다른 분만이 되더라도 성공적인 출산으로 받아들이기 위한 기준은 무엇인가요?",
    example: "자연분만을 준비했지만 응급 제왕절개로 아기를 만났습니다.",
    mood: "여운",
    choices: [
      { id: "b100-s01-10-a", label: "산모와 아기가 무사하면 그것으로 성공이다", valueLabel: "무사하면 성공" },
      { id: "b100-s01-10-b", label: "그 순간 최선의 선택을 했으면 성공이다", valueLabel: "최선의 선택" },
      { id: "b100-s01-10-c", label: "성공과 실패라는 말 자체를 쓰지 않는다", valueLabel: "평가하지 않기" },
      { id: "b100-s01-10-d", label: "아쉬움은 아쉬움대로 말하고 인정한다", valueLabel: "아쉬움 인정" }
    ]
  },
  {
    id: "b100-s02-01",
    sectionId: "s02",
    title: "진통 신호가 애매할 때 병원에 연락하거나 이동할 기준은 무엇인가요?",
    example: "밤 11시, 불규칙한 통증이 두 시간째 이어집니다.",
    mood: "미소",
    choices: [
      { id: "b100-s02-01-a", label: "조금이라도 이상하면 바로 병원으로 간다", valueLabel: "즉시 이동" },
      { id: "b100-s02-01-b", label: "병원에 전화해 안내대로 한다", valueLabel: "전화로 확인" },
      { id: "b100-s02-01-c", label: "교육받은 간격(예: 5분 간격 1시간)까지 기다린다", valueLabel: "간격 기준" },
      { id: "b100-s02-01-d", label: "산모의 느낌을 믿고 산모가 정한다", valueLabel: "산모 판단" }
    ]
  },
  {
    id: "b100-s02-02",
    sectionId: "s02",
    title: "진통이 시작되면 가족에게 바로 알릴까요?",
    example: "진통이 왔지만 병원에서도 아직 진행을 확신하지 못합니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s02-02-a", label: "진통 시작과 동시에 양가에 알린다", valueLabel: "바로 알림" },
      { id: "b100-s02-02-b", label: "입원이 확정되면 알린다", valueLabel: "입원 뒤" },
      { id: "b100-s02-02-c", label: "아기가 태어난 뒤에 알린다", valueLabel: "출산 뒤" },
      { id: "b100-s02-02-d", label: "도움을 줄 한 사람에게만 미리 알린다", valueLabel: "한 사람만" }
    ]
  },
  {
    id: "b100-s02-03",
    sectionId: "s02",
    title: "병원 이동 수단과 대체 운전자는 누구로 정할까요?",
    example: "파트너가 야근 중일 때 진통이 올 수 있습니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "b100-s02-03-a", label: "파트너가 운전하고, 없으면 택시나 구급차", valueLabel: "파트너 또는 택시" },
      { id: "b100-s02-03-b", label: "가까이 사는 가족을 대체 운전자로 정해 둔다", valueLabel: "가족 대기" },
      { id: "b100-s02-03-c", label: "처음부터 택시나 구급차를 부르기로 한다", valueLabel: "차 안 쓰기" },
      { id: "b100-s02-03-d", label: "예정일 전후에는 파트너가 집에서 대기한다", valueLabel: "파트너 대기" }
    ]
  },
  {
    id: "b100-s02-04",
    sectionId: "s02",
    title: "파트너가 멀리 있을 때 먼저 병원에 갈지 기다릴지 어떻게 정할까요?",
    example: "파트너가 두 시간 거리에 있을 때 진통이 시작됐습니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s02-04-a", label: "기다리지 않고 혼자 먼저 병원에 간다", valueLabel: "먼저 간다" },
      { id: "b100-s02-04-b", label: "가족이나 친구와 먼저 가고 파트너는 병원에서 만난다", valueLabel: "동행자와 먼저" },
      { id: "b100-s02-04-c", label: "병원 안내에 따라 갈 때가 될 때까지 집에서 기다린다", valueLabel: "병원 안내대로" },
      { id: "b100-s02-04-d", label: "파트너 도착까지 기다린다", valueLabel: "파트너 기다림" }
    ]
  },
  {
    id: "b100-s02-05",
    sectionId: "s02",
    title: "진통 중 파트너가 해야 할 역할을 어디까지 구체적으로 정할까요?",
    example: "파트너는 무엇부터 해야 할지 몰라 지시를 기다립니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s02-05-a", label: "시간대별 할 일 목록을 만들어 그대로 한다", valueLabel: "목록대로" },
      { id: "b100-s02-05-b", label: "물·마사지·의료진 소통 같은 큰 역할만 정한다", valueLabel: "큰 역할만" },
      { id: "b100-s02-05-c", label: "정하지 않고 산모가 그때그때 말한다", valueLabel: "그때그때" },
      { id: "b100-s02-05-d", label: "둘라나 간호사에게 맡기고 파트너는 곁에만 있는다", valueLabel: "곁에만" }
    ]
  },
  {
    id: "b100-s02-06",
    sectionId: "s02",
    title: "진통 중 사진과 영상을 촬영해도 될까요?",
    example: "파트너가 진통 중 산모 모습을 찍으려 합니다.",
    mood: "안도",
    choices: [
      { id: "b100-s02-06-a", label: "찍지 않는다", valueLabel: "촬영 안 함" },
      { id: "b100-s02-06-b", label: "산모가 허락한 순간만 찍는다", valueLabel: "허락한 순간만" },
      { id: "b100-s02-06-c", label: "파트너 판단으로 찍되 공유는 산모가 정한다", valueLabel: "찍고 공유는 산모" },
      { id: "b100-s02-06-d", label: "자유롭게 찍어 기록으로 남긴다", valueLabel: "자유 촬영" }
    ]
  },
  {
    id: "b100-s02-07",
    sectionId: "s02",
    title: "산모가 말을 하기 어려울 때 의료진과 소통할 대리인은 누구인가요?",
    example: "진통이 심해 산모가 설명을 듣거나 답하기 어렵습니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s02-07-a", label: "파트너", valueLabel: "파트너" },
      { id: "b100-s02-07-b", label: "산모의 어머니", valueLabel: "친정 어머니" },
      { id: "b100-s02-07-c", label: "둘라나 조산사", valueLabel: "전문 지원자" },
      { id: "b100-s02-07-d", label: "미리 적어 둔 출산 계획서", valueLabel: "계획서" }
    ]
  },
  {
    id: "b100-s02-08",
    sectionId: "s02",
    title: "진통 중 원치 않는 응원·접촉·조언을 중단시키는 신호를 정할까요?",
    example: "손을 잡아 주길 바랐지만 실제로는 접촉이 힘들어졌습니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s02-08-a", label: "손을 드는 것 같은 신호 하나를 정해 둔다", valueLabel: "신호 정함" },
      { id: "b100-s02-08-b", label: "\"그만\"이라고 말하면 바로 멈추기로 한다", valueLabel: "말로 하기" },
      { id: "b100-s02-08-c", label: "산모가 말하기 전에는 아무것도 하지 않는다", valueLabel: "먼저 하지 않기" },
      { id: "b100-s02-08-d", label: "신호 없이 파트너가 표정을 보고 판단한다", valueLabel: "파트너 판단" }
    ]
  },
  {
    id: "b100-s02-09",
    sectionId: "s02",
    title: "첫째·반려동물·집안일의 긴급 돌봄은 누가 맡을까요?",
    example: "새벽에 진통이 와 첫째와 강아지를 두고 갈 수 없습니다.",
    mood: "희망",
    choices: [
      { id: "b100-s02-09-a", label: "가까이 사는 가족이 집으로 온다", valueLabel: "가족이 집으로" },
      { id: "b100-s02-09-b", label: "첫째와 반려동물을 가족 집에 미리 맡겨 둔다", valueLabel: "미리 맡김" },
      { id: "b100-s02-09-c", label: "파트너가 집에 남고 산모는 다른 동행자와 간다", valueLabel: "파트너가 집에" },
      { id: "b100-s02-09-d", label: "이웃이나 친구에게 부탁한다", valueLabel: "이웃·친구" }
    ]
  },
  {
    id: "b100-s02-10",
    sectionId: "s02",
    title: "출산 가방과 서류가 준비되지 않았을 때 무엇을 포기하고 무엇을 챙길까요?",
    example: "예정일보다 일찍 양수가 터졌는데 가방은 절반만 쌌습니다.",
    mood: "여운",
    choices: [
      { id: "b100-s02-10-a", label: "아무것도 챙기지 않고 바로 병원으로 간다", valueLabel: "바로 출발" },
      { id: "b100-s02-10-b", label: "신분증과 산모수첩만 챙긴다", valueLabel: "서류만" },
      { id: "b100-s02-10-c", label: "산모는 먼저 가고 파트너가 나중에 챙겨 온다", valueLabel: "나중에 가져옴" },
      { id: "b100-s02-10-d", label: "5분 안에 챙길 수 있는 만큼 챙긴다", valueLabel: "5분만" }
    ]
  },
  {
    id: "b100-s03-01",
    sectionId: "s03",
    title: "응급 제왕절개가 필요하다는 설명을 들으면 파트너는 어떤 역할을 해야 할까요?",
    example: "진행이 멈춰 의료진이 지금 수술해야 한다고 말합니다.",
    mood: "미소",
    choices: [
      { id: "b100-s03-01-a", label: "의료진에게 이유와 위험을 묻고 산모에게 전한다", valueLabel: "질문과 전달" },
      { id: "b100-s03-01-b", label: "산모 곁에서 안심시키는 데 집중한다", valueLabel: "안심시키기" },
      { id: "b100-s03-01-c", label: "산모가 정하도록 아무 말도 보태지 않는다", valueLabel: "개입 안 함" },
      { id: "b100-s03-01-d", label: "의료진 판단을 그대로 따르자고 말한다", valueLabel: "의료진 따르기" }
    ]
  },
  {
    id: "b100-s03-02",
    sectionId: "s03",
    title: "회음절개·촉진제·흡입분만 등 개입 설명을 얼마나 자세히 듣고 싶나요?",
    example: "진행이 느려 의료진이 처치를 차례로 제안합니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s03-02-a", label: "이유·대안·위험을 모두 듣고 정한다", valueLabel: "전부 듣기" },
      { id: "b100-s03-02-b", label: "무엇을 하는지만 짧게 듣고 맡긴다", valueLabel: "요점만" },
      { id: "b100-s03-02-c", label: "설명은 파트너가 듣고 산모는 결과만 듣는다", valueLabel: "파트너가 듣기" },
      { id: "b100-s03-02-d", label: "미리 동의해 두고 그 순간에는 듣지 않는다", valueLabel: "사전 동의" }
    ]
  },
  {
    id: "b100-s03-03",
    sectionId: "s03",
    title: "태아와 산모의 위험이 충돌하는 상황에서 어떤 원칙을 우선할까요?",
    example: "의료진이 산모 위험을 줄이면 아기 위험이 커진다고 설명합니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s03-03-a", label: "산모의 안전을 먼저 지킨다", valueLabel: "산모 우선" },
      { id: "b100-s03-03-b", label: "아기의 안전을 먼저 지킨다", valueLabel: "아기 우선" },
      { id: "b100-s03-03-c", label: "의료진 권고를 따른다", valueLabel: "의료진 판단" },
      { id: "b100-s03-03-d", label: "산모가 그 순간에 정한다", valueLabel: "산모가 결정" }
    ]
  },
  {
    id: "b100-s03-04",
    sectionId: "s03",
    title: "의료진의 설명이 충분하지 않다고 느끼면 재설명을 요구할 사람은 누구인가요?",
    example: "설명이 빨라 두 사람이 서로 다르게 이해했습니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s03-04-a", label: "파트너가 그 자리에서 다시 묻는다", valueLabel: "파트너" },
      { id: "b100-s03-04-b", label: "산모가 직접 묻는다", valueLabel: "산모" },
      { id: "b100-s03-04-c", label: "간호사에게 따로 물어본다", valueLabel: "간호사에게" },
      { id: "b100-s03-04-d", label: "나중에 기록을 요청해 확인한다", valueLabel: "기록 요청" }
    ]
  },
  {
    id: "b100-s03-05",
    sectionId: "s03",
    title: "동의서에 서명해야 할 때 산모가 결정하기 어려우면 누가 대리할까요?",
    example: "약물 때문에 산모가 충분히 대화하기 어렵습니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s03-05-a", label: "파트너가 미리 들은 산모의 뜻대로 서명한다", valueLabel: "파트너가 대리" },
      { id: "b100-s03-05-b", label: "산모가 조금이라도 답할 수 있으면 산모가 한다", valueLabel: "산모가 끝까지" },
      { id: "b100-s03-05-c", label: "의료진 권고대로 한다", valueLabel: "의료진 권고" },
      { id: "b100-s03-05-d", label: "산모의 부모에게 함께 묻는다", valueLabel: "부모와 함께" }
    ]
  },
  {
    id: "b100-s03-06",
    sectionId: "s03",
    title: "의료 과정에서 존중받지 못한다고 느끼면 즉시 문제를 제기할까요?",
    example: "예고 없이 인력이 들어와 민감한 처치가 이어집니다.",
    mood: "안도",
    choices: [
      { id: "b100-s03-06-a", label: "그 자리에서 바로 말한다", valueLabel: "즉시 제기" },
      { id: "b100-s03-06-b", label: "처치가 끝난 뒤 담당자에게 말한다", valueLabel: "끝난 뒤" },
      { id: "b100-s03-06-c", label: "퇴원 후 병원에 공식적으로 전달한다", valueLabel: "퇴원 뒤 공식" },
      { id: "b100-s03-06-d", label: "출산이 우선이니 넘어간다", valueLabel: "넘어감" }
    ]
  },
  {
    id: "b100-s03-07",
    sectionId: "s03",
    title: "출산 중 실습생이나 추가 인력의 참관을 허용할까요?",
    example: "교육 병원이라 실습생 참관을 요청받았습니다.",
    mood: "조심스러움",
    choices: [
      { id: "b100-s03-07-a", label: "허용하지 않는다", valueLabel: "불허" },
      { id: "b100-s03-07-b", label: "산모가 그때 편하면 허용한다", valueLabel: "산모가 그때" },
      { id: "b100-s03-07-c", label: "미리 인원과 역할을 듣고 정한다", valueLabel: "사전 확인 뒤" },
      { id: "b100-s03-07-d", label: "병원 방침대로 따른다", valueLabel: "병원 방침" }
    ]
  },
  {
    id: "b100-s03-08",
    sectionId: "s03",
    title: "통증 표현을 의료진이 가볍게 여긴다고 느낄 때 어떻게 대응할까요?",
    example: "아프다고 했지만 \"원래 그렇다\"는 답만 돌아옵니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s03-08-a", label: "파트너가 다시 확인해 달라고 강하게 요청한다", valueLabel: "파트너가 요구" },
      { id: "b100-s03-08-b", label: "다른 의료진이나 담당 교수를 불러 달라고 한다", valueLabel: "다른 의료진" },
      { id: "b100-s03-08-c", label: "통증 정도를 숫자로 말해 기록을 남긴다", valueLabel: "숫자로 기록" },
      { id: "b100-s03-08-d", label: "일단 참고 뒤에 이야기한다", valueLabel: "참고 나중에" }
    ]
  },
  {
    id: "b100-s03-09",
    sectionId: "s03",
    title: "파트너가 의료진 판단에 이견이 있어도 산모의 선택을 우선할 수 있나요?",
    example: "의료진과 산모의 뜻이 같고 파트너만 생각이 다릅니다.",
    mood: "희망",
    choices: [
      { id: "b100-s03-09-a", label: "산모의 선택을 그대로 따른다", valueLabel: "산모 우선" },
      { id: "b100-s03-09-b", label: "한 번은 의견을 말하고 그 뒤 산모를 따른다", valueLabel: "한 번 말하고" },
      { id: "b100-s03-09-c", label: "의료진에게 다시 설명을 요청한다", valueLabel: "재설명 요청" },
      { id: "b100-s03-09-d", label: "파트너 의견이 반영될 때까지 이야기한다", valueLabel: "합의까지" }
    ]
  },
  {
    id: "b100-s03-10",
    sectionId: "s03",
    title: "출산 후 의료 기록을 검토하거나 설명을 다시 요청할 기준은 무엇인가요?",
    example: "출산이 왜 그렇게 진행됐는지 두 사람의 기억이 다릅니다.",
    mood: "여운",
    choices: [
      { id: "b100-s03-10-a", label: "이해되지 않는 것이 하나라도 있으면 요청한다", valueLabel: "궁금하면 바로" },
      { id: "b100-s03-10-b", label: "몸에 문제가 남았을 때만 요청한다", valueLabel: "문제 있을 때" },
      { id: "b100-s03-10-c", label: "다음 출산을 계획할 때 요청한다", valueLabel: "다음 출산 전" },
      { id: "b100-s03-10-d", label: "요청하지 않는다", valueLabel: "요청 안 함" }
    ]
  },
  {
    id: "b100-s04-01",
    sectionId: "s04",
    title: "분만실에는 파트너 외에 누가 함께 있을 수 있나요?",
    example: "친정어머니와 시어머니 모두 분만실에 들어오고 싶어 합니다.",
    mood: "미소",
    choices: [
      { id: "b100-s04-01-a", label: "파트너만", valueLabel: "파트너만" },
      { id: "b100-s04-01-b", label: "산모의 어머니까지", valueLabel: "친정어머니까지" },
      { id: "b100-s04-01-c", label: "산모가 원하는 사람 누구든", valueLabel: "산모가 정함" },
      { id: "b100-s04-01-d", label: "아무도 없이 의료진만", valueLabel: "의료진만" }
    ]
  },
  {
    id: "b100-s04-02",
    sectionId: "s04",
    title: "산모가 중간에 동행자를 나가 달라고 하면 즉시 따라야 할까요?",
    example: "산모가 파트너에게도 잠시 나가 있으라고 합니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s04-02-a", label: "누구든 즉시 나간다", valueLabel: "즉시 따름" },
      { id: "b100-s04-02-b", label: "파트너는 남고 다른 사람만 나간다", valueLabel: "파트너는 남음" },
      { id: "b100-s04-02-c", label: "이유를 한 번 묻고 나간다", valueLabel: "묻고 나감" },
      { id: "b100-s04-02-d", label: "곁에 있는 것이 안전하니 남는다", valueLabel: "남음" }
    ]
  },
  {
    id: "b100-s04-03",
    sectionId: "s04",
    title: "파트너가 피나 의료 장면을 힘들어하면 대체 동행자를 정할까요?",
    example: "파트너가 혈액을 보면 어지럽다고 합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "b100-s04-03-a", label: "산모 머리맡에만 있고 장면은 보지 않는다", valueLabel: "머리맡만" },
      { id: "b100-s04-03-b", label: "대체 동행자를 정해 함께 들어간다", valueLabel: "대체자 추가" },
      { id: "b100-s04-03-c", label: "파트너 대신 다른 사람이 들어간다", valueLabel: "파트너 대신" },
      { id: "b100-s04-03-d", label: "힘들어도 파트너가 끝까지 있는다", valueLabel: "끝까지 파트너" }
    ]
  },
  {
    id: "b100-s04-04",
    sectionId: "s04",
    title: "탯줄은 누가 자를까요?",
    example: "의료진이 탯줄을 자를 사람을 묻습니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s04-04-a", label: "파트너", valueLabel: "파트너" },
      { id: "b100-s04-04-b", label: "의료진", valueLabel: "의료진" },
      { id: "b100-s04-04-c", label: "산모가 직접", valueLabel: "산모" },
      { id: "b100-s04-04-d", label: "그때 원하는 사람이 있으면 그 사람", valueLabel: "그때 정함" }
    ]
  },
  {
    id: "b100-s04-05",
    sectionId: "s04",
    title: "출산 장면을 어느 범위까지 촬영할까요?",
    example: "파트너가 출산 순간을 영상으로 남기고 싶어 합니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s04-05-a", label: "촬영하지 않는다", valueLabel: "촬영 안 함" },
      { id: "b100-s04-05-b", label: "아기가 나온 뒤부터만", valueLabel: "태어난 뒤만" },
      { id: "b100-s04-05-c", label: "산모 얼굴과 아기만", valueLabel: "얼굴과 아기만" },
      { id: "b100-s04-05-d", label: "전 과정을 남긴다", valueLabel: "전 과정" }
    ]
  },
  {
    id: "b100-s04-06",
    sectionId: "s04",
    title: "아기 첫 사진을 가족에게 누가 언제 보낼까요?",
    example: "가족 단체방에 사진을 기다리는 연락이 이어집니다.",
    mood: "안도",
    choices: [
      { id: "b100-s04-06-a", label: "파트너가 태어난 직후 바로 보낸다", valueLabel: "파트너가 바로" },
      { id: "b100-s04-06-b", label: "산모가 정리된 뒤 산모가 보낸다", valueLabel: "산모가 나중에" },
      { id: "b100-s04-06-c", label: "두 사람이 함께 고른 사진을 몇 시간 뒤 보낸다", valueLabel: "함께 골라서" },
      { id: "b100-s04-06-d", label: "퇴원 뒤 직접 만나 보여 준다", valueLabel: "직접 만나서" }
    ]
  },
  {
    id: "b100-s04-07",
    sectionId: "s04",
    title: "출산 소식을 SNS에 누가 먼저 올릴 수 있나요?",
    example: "가족이 먼저 SNS에 올릴까 걱정됩니다.",
    mood: "웃음",
    choices: [
      { id: "b100-s04-07-a", label: "부모인 두 사람만 올릴 수 있다", valueLabel: "부모만" },
      { id: "b100-s04-07-b", label: "두 사람이 올린 뒤 가족도 올릴 수 있다", valueLabel: "부모 먼저" },
      { id: "b100-s04-07-c", label: "가족도 자유롭게 올린다", valueLabel: "가족도 자유" },
      { id: "b100-s04-07-d", label: "아무도 올리지 않는다", valueLabel: "SNS 없음" }
    ]
  },
  {
    id: "b100-s04-08",
    sectionId: "s04",
    title: "산모의 얼굴과 몸이 나온 사진은 누구의 허락을 받아야 하나요?",
    example: "파트너가 찍은 사진에 산모의 지친 얼굴이 담겼습니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s04-08-a", label: "산모 한 사람의 허락", valueLabel: "산모만" },
      { id: "b100-s04-08-b", label: "산모와 파트너 둘 다", valueLabel: "둘 다" },
      { id: "b100-s04-08-c", label: "가족에게는 허락 없이 보낼 수 있다", valueLabel: "가족은 자유" },
      { id: "b100-s04-08-d", label: "그런 사진은 찍지 않는다", valueLabel: "찍지 않음" }
    ]
  },
  {
    id: "b100-s04-09",
    sectionId: "s04",
    title: "출산 직후 영상통화 요청을 받아들일까요?",
    example: "출산 한 시간 뒤 양가에서 영상통화를 걸어옵니다.",
    mood: "희망",
    choices: [
      { id: "b100-s04-09-a", label: "바로 받는다", valueLabel: "바로 받음" },
      { id: "b100-s04-09-b", label: "산모 상태가 괜찮을 때 파트너가 건다", valueLabel: "괜찮을 때" },
      { id: "b100-s04-09-c", label: "다음 날부터 받는다", valueLabel: "다음 날부터" },
      { id: "b100-s04-09-d", label: "퇴원까지 받지 않는다", valueLabel: "퇴원까지 없음" }
    ]
  },
  {
    id: "b100-s04-10",
    sectionId: "s04",
    title: "출산 경험을 나중에 가족과 친구에게 어디까지 이야기할까요?",
    example: "친구들이 출산이 어땠는지 자세히 묻습니다.",
    mood: "여운",
    choices: [
      { id: "b100-s04-10-a", label: "힘들었던 것까지 있는 그대로 말한다", valueLabel: "있는 그대로" },
      { id: "b100-s04-10-b", label: "좋았던 부분만 말한다", valueLabel: "좋은 것만" },
      { id: "b100-s04-10-c", label: "산모가 말할 범위를 정하고 파트너는 그 안에서 말한다", valueLabel: "산모가 범위" },
      { id: "b100-s04-10-d", label: "두 사람만 알고 밖에는 말하지 않는다", valueLabel: "둘만 간직" }
    ]
  },
  {
    id: "b100-s05-01",
    sectionId: "s05",
    title: "출산 직후 피부 접촉은 상황이 허락하면 누가 먼저 할까요?",
    example: "산모 처치가 길어져 파트너가 먼저 안을 수 있게 됐습니다.",
    mood: "미소",
    choices: [
      { id: "b100-s05-01-a", label: "산모 처치가 끝날 때까지 기다린다", valueLabel: "산모 먼저" },
      { id: "b100-s05-01-b", label: "파트너가 먼저 안는다", valueLabel: "파트너 먼저" },
      { id: "b100-s05-01-c", label: "산모 옆에 아기를 눕혀 두 사람이 함께 본다", valueLabel: "함께" },
      { id: "b100-s05-01-d", label: "의료진이 정하는 대로", valueLabel: "의료진 판단" }
    ]
  },
  {
    id: "b100-s05-02",
    sectionId: "s05",
    title: "아기 검사가 필요한 경우 첫 접촉보다 검사를 우선할까요?",
    example: "아기 호흡 확인을 위해 바로 데려가야 한다고 합니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s05-02-a", label: "검사를 먼저 한다", valueLabel: "검사 먼저" },
      { id: "b100-s05-02-b", label: "짧게라도 안아 본 뒤 보낸다", valueLabel: "잠깐 안고" },
      { id: "b100-s05-02-c", label: "급하지 않다면 첫 접촉을 먼저 한다", valueLabel: "급하지 않으면 접촉" },
      { id: "b100-s05-02-d", label: "파트너가 검사에 따라가고 산모는 쉰다", valueLabel: "파트너 동행" }
    ]
  },
  {
    id: "b100-s05-03",
    sectionId: "s05",
    title: "파트너가 신생아실이나 검사에 동행해야 할까요?",
    example: "아기는 검사실로, 산모는 회복실로 나뉘어 가게 됩니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "b100-s05-03-a", label: "아기를 따라간다", valueLabel: "아기 곁에" },
      { id: "b100-s05-03-b", label: "산모 곁에 남는다", valueLabel: "산모 곁에" },
      { id: "b100-s05-03-c", label: "산모의 어머니가 아기를 따라가고 파트너는 산모 곁", valueLabel: "가족이 아기 곁에" },
      { id: "b100-s05-03-d", label: "그때 산모가 원하는 대로", valueLabel: "산모가 정함" }
    ]
  },
  {
    id: "b100-s05-04",
    sectionId: "s05",
    title: "아기 이름을 병원에서 바로 확정할까요?",
    example: "출생신고 서류에 이름을 적어야 합니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s05-04-a", label: "미리 정해 두고 병원에서 바로 적는다", valueLabel: "미리 확정" },
      { id: "b100-s05-04-b", label: "얼굴을 보고 며칠 안에 정한다", valueLabel: "얼굴 보고" },
      { id: "b100-s05-04-c", label: "출생신고 기한 안에 천천히 정한다", valueLabel: "기한 안에" },
      { id: "b100-s05-04-d", label: "양가와 상의한 뒤 정한다", valueLabel: "가족과 상의" }
    ]
  },
  {
    id: "b100-s05-05",
    sectionId: "s05",
    title: "신생아 사진 촬영과 외부 업체 서비스를 이용할까요?",
    example: "병원에서 신생아 사진 촬영 업체를 안내합니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s05-05-a", label: "업체를 불러 남긴다", valueLabel: "업체 촬영" },
      { id: "b100-s05-05-b", label: "두 사람이 직접 찍는다", valueLabel: "직접 촬영" },
      { id: "b100-s05-05-c", label: "조리원이나 나중에 스튜디오에서 찍는다", valueLabel: "나중에" },
      { id: "b100-s05-05-d", label: "특별한 촬영은 하지 않는다", valueLabel: "촬영 없음" }
    ]
  },
  {
    id: "b100-s05-06",
    sectionId: "s05",
    title: "아기의 얼굴을 온라인에 공개할 수 있나요?",
    example: "파트너가 아기 얼굴 사진을 SNS에 올리려 합니다.",
    mood: "안도",
    choices: [
      { id: "b100-s05-06-a", label: "공개 계정에 올려도 된다", valueLabel: "공개" },
      { id: "b100-s05-06-b", label: "가까운 사람만 보는 비공개 계정에만", valueLabel: "비공개만" },
      { id: "b100-s05-06-c", label: "얼굴이 안 보이는 사진만", valueLabel: "얼굴 가림" },
      { id: "b100-s05-06-d", label: "온라인에는 올리지 않는다", valueLabel: "올리지 않음" }
    ]
  },
  {
    id: "b100-s05-07",
    sectionId: "s05",
    title: "출생 직후 종교 의식이나 가족 전통을 시행할까요?",
    example: "부모님이 출생 직후 기도나 의식을 원하십니다.",
    mood: "조심스러움",
    choices: [
      { id: "b100-s05-07-a", label: "우리 뜻대로 하고 가족 의식은 하지 않는다", valueLabel: "하지 않음" },
      { id: "b100-s05-07-b", label: "병원에서 가능한 범위에서만 한다", valueLabel: "병원 범위 내" },
      { id: "b100-s05-07-c", label: "퇴원 후 집에서 한다", valueLabel: "집에서 나중에" },
      { id: "b100-s05-07-d", label: "가족이 원하는 대로 한다", valueLabel: "가족 뜻대로" }
    ]
  },
  {
    id: "b100-s05-08",
    sectionId: "s05",
    title: "아기 성별이나 외모에 관한 가족의 평가를 어떻게 막을까요?",
    example: "첫 만남에서 \"아들이었으면\"이라는 말이 나옵니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s05-08-a", label: "그 자리에서 그런 말은 하지 말라고 한다", valueLabel: "즉시 제지" },
      { id: "b100-s05-08-b", label: "그 가족의 자녀인 쪽이 나중에 따로 말한다", valueLabel: "자기 가족은 자기가" },
      { id: "b100-s05-08-c", label: "웃어넘기고 반복되면 말한다", valueLabel: "반복되면" },
      { id: "b100-s05-08-d", label: "넘긴다", valueLabel: "넘김" }
    ]
  },
  {
    id: "b100-s05-09",
    sectionId: "s05",
    title: "예상과 다른 건강 상태를 알게 되면 누구에게 먼저 알릴까요?",
    example: "아기에게 추가 검사가 필요하다는 말을 들었습니다.",
    mood: "희망",
    choices: [
      { id: "b100-s05-09-a", label: "두 사람만 알고 결과가 확정되면 알린다", valueLabel: "확정 뒤" },
      { id: "b100-s05-09-b", label: "양가 부모에게 바로 알린다", valueLabel: "부모에게 바로" },
      { id: "b100-s05-09-c", label: "도움을 줄 한 사람에게만 알린다", valueLabel: "한 사람만" },
      { id: "b100-s05-09-d", label: "가족 모두에게 사실대로 바로 알린다", valueLabel: "모두에게 바로" }
    ]
  },
  {
    id: "b100-s05-10",
    sectionId: "s05",
    title: "한 사람이 아기에게 바로 애착을 느끼지 못해도 어떻게 받아들일까요?",
    example: "첫 만남인데 벅참보다 멍한 감정이 먼저 듭니다.",
    mood: "여운",
    choices: [
      { id: "b100-s05-10-a", label: "그럴 수 있다고 말해 주고 기다린다", valueLabel: "기다리기" },
      { id: "b100-s05-10-b", label: "그 감정을 서로에게 솔직히 말한다", valueLabel: "말하기" },
      { id: "b100-s05-10-c", label: "아기와 단둘이 있는 시간을 만들어 준다", valueLabel: "시간 만들기" },
      { id: "b100-s05-10-d", label: "길어지면 상담을 받는다", valueLabel: "상담" }
    ]
  },
  {
    id: "b100-s06-01",
    sectionId: "s06",
    title: "입원 중 산모의 휴식과 방문객 만남 중 무엇을 우선할까요?",
    example: "가족이 먼 길을 와 병실 앞에서 기다립니다.",
    mood: "미소",
    choices: [
      { id: "b100-s06-01-a", label: "산모가 쉬는 동안 파트너가 나가서 만난다", valueLabel: "파트너가 대신" },
      { id: "b100-s06-01-b", label: "정해진 시간에만 짧게 만난다", valueLabel: "짧게만" },
      { id: "b100-s06-01-c", label: "온 사람은 만난다", valueLabel: "만남 우선" },
      { id: "b100-s06-01-d", label: "퇴원까지 방문을 받지 않는다", valueLabel: "방문 없음" }
    ]
  },
  {
    id: "b100-s06-02",
    sectionId: "s06",
    title: "파트너는 입원 기간 내내 병원에 머물러야 할까요?",
    example: "병실 보호자 침대에서 파트너가 사흘째 자고 있습니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s06-02-a", label: "밤낮 내내 병원에 있는다", valueLabel: "내내 함께" },
      { id: "b100-s06-02-b", label: "낮에는 병원, 밤에는 집에서 잔다", valueLabel: "낮만" },
      { id: "b100-s06-02-c", label: "가족과 교대한다", valueLabel: "가족과 교대" },
      { id: "b100-s06-02-d", label: "필요할 때만 오고 산모는 혼자 쉰다", valueLabel: "필요할 때만" }
    ]
  },
  {
    id: "b100-s06-03",
    sectionId: "s06",
    title: "간병과 신생아 돌봄을 파트너가 어느 정도 직접 맡을까요?",
    example: "산모는 몸을 일으키기 어렵고 아기는 울고 있습니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "b100-s06-03-a", label: "산모 간병과 아기 돌봄을 모두 파트너가 한다", valueLabel: "전부 파트너" },
      { id: "b100-s06-03-b", label: "파트너는 산모 간병, 아기는 신생아실에 맡긴다", valueLabel: "간병만" },
      { id: "b100-s06-03-c", label: "파트너는 아기, 산모는 간호사에게 맡긴다", valueLabel: "아기만" },
      { id: "b100-s06-03-d", label: "산후도우미나 가족을 불러 나눈다", valueLabel: "외부 도움" }
    ]
  },
  {
    id: "b100-s06-04",
    sectionId: "s06",
    title: "통증·출혈·배변 같은 회복 정보를 파트너와 어디까지 공유할까요?",
    example: "산모가 배변 문제를 파트너에게 말하기 부끄러워합니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s06-04-a", label: "모두 말하고 함께 관리한다", valueLabel: "전부 공유" },
      { id: "b100-s06-04-b", label: "병원에 물어볼 정도일 때만 말한다", valueLabel: "필요할 때만" },
      { id: "b100-s06-04-c", label: "산모가 편한 만큼만 말한다", valueLabel: "산모가 정함" },
      { id: "b100-s06-04-d", label: "의료진과만 이야기한다", valueLabel: "의료진과만" }
    ]
  },
  {
    id: "b100-s06-05",
    sectionId: "s06",
    title: "산모가 혼자 쉬고 싶다고 하면 아기는 누가 볼까요?",
    example: "산모가 몇 시간만 혼자 자고 싶다고 합니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s06-05-a", label: "파트너가 데리고 나간다", valueLabel: "파트너가" },
      { id: "b100-s06-05-b", label: "신생아실에 맡긴다", valueLabel: "신생아실" },
      { id: "b100-s06-05-c", label: "가족에게 부탁한다", valueLabel: "가족" },
      { id: "b100-s06-05-d", label: "산모 곁에 두되 파트너가 돌본다", valueLabel: "곁에서 파트너가" }
    ]
  },
  {
    id: "b100-s06-06",
    sectionId: "s06",
    title: "병실 비용과 1인실 선택은 어떤 기준으로 정할까요?",
    example: "1인실은 하루 30만 원, 다인실은 무료입니다.",
    mood: "안도",
    choices: [
      { id: "b100-s06-06-a", label: "비용이 들어도 1인실", valueLabel: "1인실" },
      { id: "b100-s06-06-b", label: "다인실로 하고 돈을 아낀다", valueLabel: "다인실" },
      { id: "b100-s06-06-c", label: "첫날만 1인실, 이후 다인실", valueLabel: "첫날만" },
      { id: "b100-s06-06-d", label: "산모가 원하는 대로", valueLabel: "산모 선택" }
    ]
  },
  {
    id: "b100-s06-07",
    sectionId: "s06",
    title: "산모 식사와 필요한 물품을 누가 계속 확인할까요?",
    example: "병원 밥이 안 맞고 생리대가 떨어졌습니다.",
    mood: "웃음",
    choices: [
      { id: "b100-s06-07-a", label: "파트너가 매일 확인하고 사 온다", valueLabel: "파트너" },
      { id: "b100-s06-07-b", label: "산모가 목록을 적어 주면 파트너가 사 온다", valueLabel: "산모가 목록" },
      { id: "b100-s06-07-c", label: "가족에게 부탁한다", valueLabel: "가족" },
      { id: "b100-s06-07-d", label: "병원 매점과 배달로 해결한다", valueLabel: "배달" }
    ]
  },
  {
    id: "b100-s06-08",
    sectionId: "s06",
    title: "파트너가 병원에서도 업무를 해야 한다면 어느 범위까지 허용할까요?",
    example: "파트너 회사에서 급한 전화가 계속 옵니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s06-08-a", label: "업무는 완전히 끊는다", valueLabel: "완전 차단" },
      { id: "b100-s06-08-b", label: "급한 전화만 병실 밖에서 받는다", valueLabel: "급한 것만" },
      { id: "b100-s06-08-c", label: "산모가 쉬는 시간에는 일해도 된다", valueLabel: "쉴 때만" },
      { id: "b100-s06-08-d", label: "파트너 판단에 맡긴다", valueLabel: "파트너 판단" }
    ]
  },
  {
    id: "b100-s06-09",
    sectionId: "s06",
    title: "의료진의 퇴원 권고와 산모의 불안이 다르면 어떻게 결정할까요?",
    example: "퇴원하라는데 산모는 아직 무섭습니다.",
    mood: "희망",
    choices: [
      { id: "b100-s06-09-a", label: "의료진 권고대로 퇴원한다", valueLabel: "의료진 권고" },
      { id: "b100-s06-09-b", label: "비용을 내고 하루 더 있는다", valueLabel: "하루 더" },
      { id: "b100-s06-09-c", label: "조리원으로 바로 옮긴다", valueLabel: "조리원으로" },
      { id: "b100-s06-09-d", label: "산모가 정한다", valueLabel: "산모 결정" }
    ]
  },
  {
    id: "b100-s06-10",
    sectionId: "s06",
    title: "산후 통증을 “원래 그런 것”으로 넘기지 않을 재진 기준은 무엇인가요?",
    example: "퇴원 뒤 통증과 출혈이 예상보다 오래 이어집니다.",
    mood: "여운",
    choices: [
      { id: "b100-s06-10-a", label: "정해 둔 증상 목록에 해당하면 간다", valueLabel: "체크리스트" },
      { id: "b100-s06-10-b", label: "산모가 이상하다고 느끼면 간다", valueLabel: "산모 느낌" },
      { id: "b100-s06-10-c", label: "병원에 전화해 물어본 뒤 정한다", valueLabel: "전화 확인" },
      { id: "b100-s06-10-d", label: "정기 검진 때까지 기다린다", valueLabel: "검진까지" }
    ]
  },
  {
    id: "b100-s07-01",
    sectionId: "s07",
    title: "모유·혼합·분유 중 시작 방식을 누가 결정할까요?",
    example: "의료진이 아기 체중 때문에 보충 수유를 제안했습니다.",
    mood: "미소",
    choices: [
      { id: "b100-s07-01-a", label: "산모가 정한다", valueLabel: "산모" },
      { id: "b100-s07-01-b", label: "두 사람이 함께 정한다", valueLabel: "둘이 함께" },
      { id: "b100-s07-01-c", label: "의료진 권고를 따른다", valueLabel: "의료진" },
      { id: "b100-s07-01-d", label: "아기 반응을 보고 정한다", valueLabel: "아기 반응" }
    ]
  },
  {
    id: "b100-s07-02",
    sectionId: "s07",
    title: "완전모유수유 목표가 산모를 힘들게 하면 언제 바꿀까요?",
    example: "산모가 수유 때마다 울고 잠을 못 잡니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s07-02-a", label: "산모가 힘들다고 하는 즉시 바꾼다", valueLabel: "즉시" },
      { id: "b100-s07-02-b", label: "정해 둔 기간(예: 2주)만 해 보고 바꾼다", valueLabel: "기간 뒤" },
      { id: "b100-s07-02-c", label: "수유 상담을 받아 보고 바꾼다", valueLabel: "상담 뒤" },
      { id: "b100-s07-02-d", label: "의료진이 권할 때 바꾼다", valueLabel: "의료진 권고" }
    ]
  },
  {
    id: "b100-s07-03",
    sectionId: "s07",
    title: "가족이 수유 방식에 간섭할 때 누가 경계를 세울까요?",
    example: "시어머니가 분유를 두고 매번 한마디 하십니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "b100-s07-03-a", label: "그 가족의 자녀인 쪽이 말한다", valueLabel: "자기 가족은 자기가" },
      { id: "b100-s07-03-b", label: "파트너가 모두 막는다", valueLabel: "파트너가 방패" },
      { id: "b100-s07-03-c", label: "산모가 직접 말한다", valueLabel: "산모가 직접" },
      { id: "b100-s07-03-d", label: "대응하지 않고 우리 방식대로 한다", valueLabel: "무대응" }
    ]
  },
  {
    id: "b100-s07-04",
    sectionId: "s07",
    title: "수유 상담이나 유축기 등 추가 비용을 공동비용으로 볼까요?",
    example: "유축기 대여와 수유 상담에 몇십만 원이 듭니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s07-04-a", label: "모두 공동 비용", valueLabel: "공동" },
      { id: "b100-s07-04-b", label: "유축기 같은 물건은 공동, 상담은 산모 개인", valueLabel: "품목별" },
      { id: "b100-s07-04-c", label: "산모 개인 비용", valueLabel: "산모 개인" },
      { id: "b100-s07-04-d", label: "파트너가 낸다", valueLabel: "파트너" }
    ]
  },
  {
    id: "b100-s07-05",
    sectionId: "s07",
    title: "밤 수유는 어떤 방식으로 역할을 나눌까요?",
    example: "새벽 수유가 세 번씩 반복됩니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s07-05-a", label: "산모가 수유하고 파트너가 트림·기저귀를 맡는다", valueLabel: "수유와 뒤처리 분담" },
      { id: "b100-s07-05-b", label: "유축이나 분유로 밤은 파트너가 맡는다", valueLabel: "밤은 파트너" },
      { id: "b100-s07-05-c", label: "하루씩 번갈아 맡는다", valueLabel: "하루 교대" },
      { id: "b100-s07-05-d", label: "산모가 다 하고 파트너는 낮을 맡는다", valueLabel: "밤은 산모" }
    ]
  },
  {
    id: "b100-s07-06",
    sectionId: "s07",
    title: "파트너가 직접 먹이는 경험을 위해 유축이나 분유를 선택할 수 있나요?",
    example: "파트너도 아기를 먹여 보고 싶어 합니다.",
    mood: "안도",
    choices: [
      { id: "b100-s07-06-a", label: "하루 한 번은 유축해 파트너가 먹인다", valueLabel: "하루 한 번" },
      { id: "b100-s07-06-b", label: "밤 수유를 분유로 바꿔 파트너가 먹인다", valueLabel: "밤 수유로" },
      { id: "b100-s07-06-c", label: "모유수유가 안정된 뒤에 시작한다", valueLabel: "안정 뒤" },
      { id: "b100-s07-06-d", label: "수유는 산모가, 파트너는 다른 방식으로 유대를 쌓는다", valueLabel: "다른 방식" }
    ]
  },
  {
    id: "b100-s07-07",
    sectionId: "s07",
    title: "공공장소 수유와 가리개 사용은 누구의 편안함을 우선할까요?",
    example: "외출 중 아기가 배고파 울고 수유실은 멉니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s07-07-a", label: "산모가 편한 대로 그 자리에서 먹인다", valueLabel: "산모 편한 대로" },
      { id: "b100-s07-07-b", label: "가리개를 쓰고 그 자리에서 먹인다", valueLabel: "가리개" },
      { id: "b100-s07-07-c", label: "수유실이나 차로 이동한다", valueLabel: "이동" },
      { id: "b100-s07-07-d", label: "외출 때는 유축이나 분유를 챙긴다", valueLabel: "외출용 준비" }
    ]
  },
  {
    id: "b100-s07-08",
    sectionId: "s07",
    title: "수유량과 체중에 대한 불안을 누가 기록하고 의료진에게 질문할까요?",
    example: "새벽 수유 기록표의 숫자가 계속 신경 쓰입니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s07-08-a", label: "파트너가 기록하고 질문한다", valueLabel: "파트너" },
      { id: "b100-s07-08-b", label: "산모가 기록하고 질문한다", valueLabel: "산모" },
      { id: "b100-s07-08-c", label: "기록은 파트너, 질문은 산모", valueLabel: "나눠서" },
      { id: "b100-s07-08-d", label: "기록하지 않고 검진 때 묻는다", valueLabel: "기록 없이" }
    ]
  },
  {
    id: "b100-s07-09",
    sectionId: "s07",
    title: "젖몸살과 통증이 심할 때 수유 지속보다 회복을 우선할 수 있나요?",
    example: "젖몸살로 열이 나는데 아기는 배고파 웁니다.",
    mood: "희망",
    choices: [
      { id: "b100-s07-09-a", label: "바로 쉬고 분유로 대체한다", valueLabel: "바로 회복" },
      { id: "b100-s07-09-b", label: "병원 진료를 받고 의료진 말대로 한다", valueLabel: "진료 뒤" },
      { id: "b100-s07-09-c", label: "유축으로 버티며 회복한다", valueLabel: "유축으로" },
      { id: "b100-s07-09-d", label: "통증이 있어도 수유를 이어 간다", valueLabel: "수유 지속" }
    ]
  },
  {
    id: "b100-s07-10",
    sectionId: "s07",
    title: "수유 방식이 계획과 달라졌을 때 실패라는 말을 하지 않기 위해 어떤 원칙을 세울까요?",
    example: "완모를 계획했지만 분유로 바꾸게 됐습니다.",
    mood: "여운",
    choices: [
      { id: "b100-s07-10-a", label: "아기가 잘 크면 성공이라고 정한다", valueLabel: "잘 크면 성공" },
      { id: "b100-s07-10-b", label: "수유 방식을 평가하는 말 자체를 쓰지 않는다", valueLabel: "평가하지 않기" },
      { id: "b100-s07-10-c", label: "바꾼 이유를 두 사람이 함께 정리해 둔다", valueLabel: "이유 정리" },
      { id: "b100-s07-10-d", label: "아쉬움을 말하고 서로 들어 준다", valueLabel: "아쉬움 나누기" }
    ]
  },
  {
    id: "b100-s08-01",
    sectionId: "s08",
    title: "출산 당일 면회는 누구에게 허용할까요?",
    example: "출산 두 시간 뒤 양가 부모가 병원에 도착했습니다.",
    mood: "미소",
    choices: [
      { id: "b100-s08-01-a", label: "양가 부모까지", valueLabel: "양가 부모" },
      { id: "b100-s08-01-b", label: "산모의 부모만", valueLabel: "친정만" },
      { id: "b100-s08-01-c", label: "아무도 받지 않는다", valueLabel: "없음" },
      { id: "b100-s08-01-d", label: "산모가 그때 정한다", valueLabel: "산모가 그때" }
    ]
  },
  {
    id: "b100-s08-02",
    sectionId: "s08",
    title: "퇴원 후 첫 방문은 언제부터 받을까요?",
    example: "퇴원 다음 날 가족이 오겠다고 합니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s08-02-a", label: "퇴원 직후부터", valueLabel: "바로" },
      { id: "b100-s08-02-b", label: "일주일 뒤부터", valueLabel: "일주일 뒤" },
      { id: "b100-s08-02-c", label: "조리원이나 산후조리가 끝난 뒤", valueLabel: "조리 끝난 뒤" },
      { id: "b100-s08-02-d", label: "산모가 부를 때까지", valueLabel: "산모가 부를 때" }
    ]
  },
  {
    id: "b100-s08-03",
    sectionId: "s08",
    title: "예고 없이 찾아온 가족을 돌려보낼 수 있나요?",
    example: "잠을 못 잔 오전에 가족이 음식을 들고 현관에 왔습니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "b100-s08-03-a", label: "정중히 돌려보낸다", valueLabel: "돌려보냄" },
      { id: "b100-s08-03-b", label: "음식만 받고 들어오지 않게 한다", valueLabel: "문 앞에서만" },
      { id: "b100-s08-03-c", label: "30분만 있다 가시게 한다", valueLabel: "짧게만" },
      { id: "b100-s08-03-d", label: "들어오시게 한다", valueLabel: "들임" }
    ]
  },
  {
    id: "b100-s08-04",
    sectionId: "s08",
    title: "방문객의 손 씻기·마스크·예방접종 요구를 어디까지 할까요?",
    example: "감기 기운이 있는 친척이 아기를 안고 싶어 합니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s08-04-a", label: "손 씻기·마스크·접종을 모두 요구한다", valueLabel: "전부 요구" },
      { id: "b100-s08-04-b", label: "손 씻기만 요구한다", valueLabel: "손 씻기만" },
      { id: "b100-s08-04-c", label: "아픈 사람은 오지 못하게만 한다", valueLabel: "아프면 금지" },
      { id: "b100-s08-04-d", label: "요구하지 않는다", valueLabel: "요구 없음" }
    ]
  },
  {
    id: "b100-s08-05",
    sectionId: "s08",
    title: "아기를 안거나 입 맞추는 행동에 어떤 규칙을 둘까요?",
    example: "친척이 아기 볼에 입을 맞춥니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s08-05-a", label: "입맞춤은 누구도 안 되고 안는 것은 허락받고", valueLabel: "입맞춤 금지" },
      { id: "b100-s08-05-b", label: "부모 외에는 안지 못하게 한다", valueLabel: "안기 금지" },
      { id: "b100-s08-05-c", label: "조부모만 예외로 한다", valueLabel: "조부모만" },
      { id: "b100-s08-05-d", label: "규칙을 두지 않는다", valueLabel: "규칙 없음" }
    ]
  },
  {
    id: "b100-s08-06",
    sectionId: "s08",
    title: "방문객이 오래 머물면 누가 귀가를 요청할까요?",
    example: "두 시간째 머무는 손님에 산모가 지쳐 갑니다.",
    mood: "안도",
    choices: [
      { id: "b100-s08-06-a", label: "파트너가 말한다", valueLabel: "파트너" },
      { id: "b100-s08-06-b", label: "그 손님과 가까운 쪽이 말한다", valueLabel: "가까운 쪽이" },
      { id: "b100-s08-06-c", label: "미리 방문 시간을 정해 두고 그때 알린다", valueLabel: "시간 미리 고지" },
      { id: "b100-s08-06-d", label: "산모가 자리를 뜨는 것으로 신호를 준다", valueLabel: "산모가 자리 뜸" }
    ]
  },
  {
    id: "b100-s08-07",
    sectionId: "s08",
    title: "산후조리원 면회를 양가에 똑같이 적용해야 할까요?",
    example: "친정은 자주 오고 시댁은 한 번도 못 왔습니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s08-07-a", label: "횟수와 시간을 똑같이 정한다", valueLabel: "똑같이" },
      { id: "b100-s08-07-b", label: "산모가 편한 쪽을 더 허용한다", valueLabel: "산모 편한 대로" },
      { id: "b100-s08-07-c", label: "양가 모두 면회를 받지 않는다", valueLabel: "양가 모두 없음" },
      { id: "b100-s08-07-d", label: "오고 싶은 만큼 오게 한다", valueLabel: "제한 없음" }
    ]
  },
  {
    id: "b100-s08-08",
    sectionId: "s08",
    title: "가족이 산모보다 아기만 보러 오는 듯할 때 어떻게 말할까요?",
    example: "들어오자마자 아기만 안고 산모에게는 인사도 없습니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s08-08-a", label: "그 자리에서 산모 안부부터 물어 달라고 말한다", valueLabel: "즉시 말함" },
      { id: "b100-s08-08-b", label: "그 가족의 자녀인 쪽이 나중에 말한다", valueLabel: "자기 가족은 자기가" },
      { id: "b100-s08-08-c", label: "말하지 않고 방문 횟수를 줄인다", valueLabel: "방문 줄임" },
      { id: "b100-s08-08-d", label: "아기를 보러 오는 게 당연하니 넘긴다", valueLabel: "넘김" }
    ]
  },
  {
    id: "b100-s08-09",
    sectionId: "s08",
    title: "도움을 준 가족에게 아기 돌봄 결정권도 생긴다고 볼까요?",
    example: "매일 오시는 어머니가 수유와 재우기 방식을 정하려 합니다.",
    mood: "희망",
    choices: [
      { id: "b100-s08-09-a", label: "결정은 부모가 하고 도움만 받는다", valueLabel: "결정은 부모" },
      { id: "b100-s08-09-b", label: "도와주시는 영역에서는 의견을 따른다", valueLabel: "해당 영역만" },
      { id: "b100-s08-09-c", label: "도움을 받는 동안은 따르고 끝나면 우리 방식", valueLabel: "도움 기간만" },
      { id: "b100-s08-09-d", label: "결정권이 생기니 도움을 받지 않는다", valueLabel: "도움 사양" }
    ]
  },
  {
    id: "b100-s08-10",
    sectionId: "s08",
    title: "가족 단체방에 아기 사진과 건강 정보를 얼마나 공유할까요?",
    example: "단체방에서 매일 사진과 체중을 묻습니다.",
    mood: "여운",
    choices: [
      { id: "b100-s08-10-a", label: "매일 사진을 올린다", valueLabel: "매일" },
      { id: "b100-s08-10-b", label: "주 1회 근황을 올린다", valueLabel: "주 1회" },
      { id: "b100-s08-10-c", label: "물어볼 때만 답한다", valueLabel: "물을 때만" },
      { id: "b100-s08-10-d", label: "사진은 올리고 건강 정보는 올리지 않는다", valueLabel: "사진만" }
    ]
  },
  {
    id: "b100-s09-01",
    sectionId: "s09",
    title: "산후조리원·산후도우미·가족 도움 중 무엇을 우선할까요?",
    example: "조리원은 비싸고 가족 도움은 간섭이 따라옵니다.",
    mood: "미소",
    choices: [
      { id: "b100-s09-01-a", label: "산후조리원", valueLabel: "조리원" },
      { id: "b100-s09-01-b", label: "집에서 산후도우미", valueLabel: "도우미" },
      { id: "b100-s09-01-c", label: "가족 도움", valueLabel: "가족" },
      { id: "b100-s09-01-d", label: "두 사람이 해결한다", valueLabel: "둘이서" }
    ]
  },
  {
    id: "b100-s09-02",
    sectionId: "s09",
    title: "산후조리 비용의 적정 상한은 어떻게 정할까요?",
    example: "조리원 2주 비용이 한 달 생활비를 넘습니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s09-02-a", label: "월 소득의 일정 비율 안에서", valueLabel: "소득 비율" },
      { id: "b100-s09-02-b", label: "저축을 깨지 않는 범위에서", valueLabel: "저축 보호" },
      { id: "b100-s09-02-c", label: "회복에 필요하면 상한 없이", valueLabel: "상한 없음" },
      { id: "b100-s09-02-d", label: "양가 지원을 받아 정한다", valueLabel: "지원 포함" }
    ]
  },
  {
    id: "b100-s09-03",
    sectionId: "s09",
    title: "친정 또는 시댁에서 조리하는 선택을 받아들일 수 있나요?",
    example: "어머니가 집에 와서 조리하라고 하십니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "b100-s09-03-a", label: "친정에서 조리한다", valueLabel: "친정" },
      { id: "b100-s09-03-b", label: "시댁에서 조리한다", valueLabel: "시댁" },
      { id: "b100-s09-03-c", label: "우리 집에 가족이 와서 돕는다", valueLabel: "우리 집으로" },
      { id: "b100-s09-03-d", label: "가족 집에서는 조리하지 않는다", valueLabel: "가족 집 안 감" }
    ]
  },
  {
    id: "b100-s09-04",
    sectionId: "s09",
    title: "도움을 받는 동안 집안의 사생활 경계는 어떻게 지킬까요?",
    example: "도우미와 가족이 침실과 냉장고를 자유롭게 드나듭니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s09-04-a", label: "침실은 들어오지 못하게 정한다", valueLabel: "침실 금지" },
      { id: "b100-s09-04-b", label: "도움 시간을 정해 그 외에는 오지 않게 한다", valueLabel: "시간 제한" },
      { id: "b100-s09-04-c", label: "필요한 것을 미리 목록으로 정해 그것만 맡긴다", valueLabel: "역할 한정" },
      { id: "b100-s09-04-d", label: "경계를 두지 않는다", valueLabel: "제한 없음" }
    ]
  },
  {
    id: "b100-s09-05",
    sectionId: "s09",
    title: "퇴원 첫 주의 식사·청소·세탁은 누가 책임질까요?",
    example: "냉장고는 비고 세탁물이 쌓였는데 둘 다 못 잤습니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s09-05-a", label: "파트너가 전부 맡는다", valueLabel: "파트너" },
      { id: "b100-s09-05-b", label: "가족이 맡는다", valueLabel: "가족" },
      { id: "b100-s09-05-c", label: "도우미나 배달·세탁 서비스", valueLabel: "서비스" },
      { id: "b100-s09-05-d", label: "파트너가 하되 배달과 서비스로 줄인다", valueLabel: "파트너와 서비스" }
    ]
  },
  {
    id: "b100-s09-06",
    sectionId: "s09",
    title: "파트너의 출산휴가를 입원과 귀가 중 어디에 집중할까요?",
    example: "열흘 휴가를 언제 쓸지 정해야 합니다.",
    mood: "안도",
    choices: [
      { id: "b100-s09-06-a", label: "출산일부터 이어서", valueLabel: "출산일부터" },
      { id: "b100-s09-06-b", label: "집에 온 날부터", valueLabel: "귀가 뒤부터" },
      { id: "b100-s09-06-c", label: "나눠서 쓴다", valueLabel: "나눠서" },
      { id: "b100-s09-06-d", label: "조리원 퇴소 뒤부터", valueLabel: "조리원 뒤부터" }
    ]
  },
  {
    id: "b100-s09-07",
    sectionId: "s09",
    title: "산모가 아기와 떨어져 혼자 자는 시간을 보장할까요?",
    example: "산모가 나흘째 두 시간씩밖에 못 잤습니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s09-07-a", label: "매일 밤 몇 시간은 파트너가 아기를 데리고 다른 방에서 잔다", valueLabel: "매일 밤" },
      { id: "b100-s09-07-b", label: "주말에 한 번 온전히 잔다", valueLabel: "주말 한 번" },
      { id: "b100-s09-07-c", label: "낮에 아기가 잘 때 함께 잔다", valueLabel: "낮잠으로" },
      { id: "b100-s09-07-d", label: "수유 때문에 따로 자는 시간은 두지 않는다", valueLabel: "따로 없음" }
    ]
  },
  {
    id: "b100-s09-08",
    sectionId: "s09",
    title: "산후 회복 중 성생활 재개는 누구의 준비를 기준으로 할까요?",
    example: "의료진은 가능하다고 했지만 마음의 준비는 다릅니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s09-08-a", label: "산모가 준비됐다고 할 때", valueLabel: "산모 기준" },
      { id: "b100-s09-08-b", label: "두 사람 모두 준비됐을 때", valueLabel: "둘 다" },
      { id: "b100-s09-08-c", label: "의료진이 허락한 시점", valueLabel: "의료진 시점" },
      { id: "b100-s09-08-d", label: "정해 둔 기간(예: 100일) 뒤", valueLabel: "정한 기간 뒤" }
    ]
  },
  {
    id: "b100-s09-09",
    sectionId: "s09",
    title: "산후우울·불안 검사를 받고 도움을 요청할 기준은 무엇인가요?",
    example: "며칠째 잠들지 못하고 이유 없이 눈물이 납니다.",
    mood: "희망",
    choices: [
      { id: "b100-s09-09-a", label: "한 사람이라도 걱정되면 바로", valueLabel: "한 명이 걱정하면" },
      { id: "b100-s09-09-b", label: "2주 이상 이어지면", valueLabel: "2주 기준" },
      { id: "b100-s09-09-c", label: "산후 검진 때 검사받는다", valueLabel: "검진 때" },
      { id: "b100-s09-09-d", label: "일상이 안 될 정도일 때", valueLabel: "일상 무너질 때" }
    ]
  },
  {
    id: "b100-s09-10",
    sectionId: "s09",
    title: "산모에게 필요한 돌봄과 아기 돌봄이 충돌하면 무엇을 우선할까요?",
    example: "아기가 우는 동시에 산모의 출혈이 심해졌습니다.",
    mood: "여운",
    choices: [
      { id: "b100-s09-10-a", label: "산모를 먼저 살핀다", valueLabel: "산모 먼저" },
      { id: "b100-s09-10-b", label: "아기를 먼저 살핀다", valueLabel: "아기 먼저" },
      { id: "b100-s09-10-c", label: "119나 병원에 먼저 전화한다", valueLabel: "먼저 전화" },
      { id: "b100-s09-10-d", label: "가족을 불러 나눈다", valueLabel: "가족 호출" }
    ]
  },
  {
    id: "b100-s10-01",
    sectionId: "s10",
    title: "아기가 신생아집중치료실에 가면 두 사람의 역할을 어떻게 나눌까요?",
    example: "아기는 치료실에, 산모는 회복실에 있습니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s10-01-a", label: "파트너는 아기 곁, 산모는 회복에 집중", valueLabel: "파트너는 아기" },
      { id: "b100-s10-01-b", label: "파트너는 산모 곁, 아기는 의료진에게", valueLabel: "파트너는 산모" },
      { id: "b100-s10-01-c", label: "파트너가 두 곳을 오가며 전한다", valueLabel: "오가며" },
      { id: "b100-s10-01-d", label: "가족을 불러 한 곳씩 맡긴다", valueLabel: "가족과 분담" }
    ]
  },
  {
    id: "b100-s10-02",
    sectionId: "s10",
    title: "산모가 응급 치료를 받는 동안 아기 곁에는 누가 있을까요?",
    example: "산모가 수술실로 가고 아기는 신생아실에 있습니다.",
    mood: "호기심",
    choices: [
      { id: "b100-s10-02-a", label: "파트너", valueLabel: "파트너" },
      { id: "b100-s10-02-b", label: "산모의 어머니", valueLabel: "친정 어머니" },
      { id: "b100-s10-02-c", label: "파트너의 부모", valueLabel: "파트너 부모" },
      { id: "b100-s10-02-d", label: "의료진에게 맡기고 파트너는 산모 곁에", valueLabel: "의료진" }
    ]
  },
  {
    id: "b100-s10-03",
    sectionId: "s10",
    title: "출산 트라우마 징후가 생기면 언제 전문 도움을 받을까요?",
    example: "특정 장면이 반복해서 떠오르고 잠들기 어렵습니다.",
    mood: "조심스러움",
    choices: [
      { id: "b100-s10-03-a", label: "징후가 보이면 바로", valueLabel: "바로" },
      { id: "b100-s10-03-b", label: "한 달 이상 이어지면", valueLabel: "한 달 기준" },
      { id: "b100-s10-03-c", label: "산후 검진 때 이야기한다", valueLabel: "검진 때" },
      { id: "b100-s10-03-d", label: "서로 이야기해 보고 안 되면", valueLabel: "대화 뒤" }
    ]
  },
  {
    id: "b100-s10-04",
    sectionId: "s10",
    title: "파트너도 출산 장면으로 힘들어할 때 누가 지원할까요?",
    example: "파트너가 출산 장면을 떠올리며 잠을 못 잡니다.",
    mood: "현실감",
    choices: [
      { id: "b100-s10-04-a", label: "산모가 들어 준다", valueLabel: "산모" },
      { id: "b100-s10-04-b", label: "파트너의 친구나 가족", valueLabel: "친구·가족" },
      { id: "b100-s10-04-c", label: "상담사", valueLabel: "상담사" },
      { id: "b100-s10-04-d", label: "같은 경험을 한 아빠 모임", valueLabel: "또래 모임" }
    ]
  },
  {
    id: "b100-s10-05",
    sectionId: "s10",
    title: "의료 결과가 기대와 다를 때 책임을 서로에게 돌리지 않을 원칙은 무엇인가요?",
    example: "그때 다른 선택을 했다면 하는 생각이 두 사람을 갈라놓습니다.",
    mood: "걱정",
    choices: [
      { id: "b100-s10-05-a", label: "\"그때 최선이었다\"고 서로 말하기로 한다", valueLabel: "최선이었다" },
      { id: "b100-s10-05-b", label: "결정은 두 사람이 함께 한 것으로 본다", valueLabel: "함께한 결정" },
      { id: "b100-s10-05-c", label: "의료진 판단이었으니 우리 책임이 아니다", valueLabel: "의료진 판단" },
      { id: "b100-s10-05-d", label: "상담사와 함께 이야기한다", valueLabel: "상담사와" }
    ]
  },
  {
    id: "b100-s10-06",
    sectionId: "s10",
    title: "아기의 건강정보 공개 범위는 누가 결정할까요?",
    example: "가족이 아기 검사 결과를 자세히 묻습니다.",
    mood: "안도",
    choices: [
      { id: "b100-s10-06-a", label: "두 사람이 함께", valueLabel: "둘이 함께" },
      { id: "b100-s10-06-b", label: "산모가", valueLabel: "산모" },
      { id: "b100-s10-06-c", label: "각자 자기 가족에게는 자기가", valueLabel: "각자 가족에게" },
      { id: "b100-s10-06-d", label: "확정 전에는 아무에게도", valueLabel: "확정 전 비공개" }
    ]
  },
  {
    id: "b100-s10-07",
    sectionId: "s10",
    title: "가족이 위기 상황에서 결정을 압박하면 어떻게 차단할까요?",
    example: "양가가 서로 다른 결정을 권하며 계속 전화합니다.",
    mood: "단호함",
    choices: [
      { id: "b100-s10-07-a", label: "전화를 받지 않고 나중에 결과만 알린다", valueLabel: "연락 차단" },
      { id: "b100-s10-07-b", label: "한 사람이 창구가 되어 정리해 전한다", valueLabel: "창구 한 사람" },
      { id: "b100-s10-07-c", label: "\"우리가 정하겠다\"고 한 번 분명히 말한다", valueLabel: "한 번 선언" },
      { id: "b100-s10-07-d", label: "의견은 듣되 결정은 의료진과 한다", valueLabel: "듣기만" }
    ]
  },
  {
    id: "b100-s10-08",
    sectionId: "s10",
    title: "출산 후 부부 갈등이 급격히 커지면 어떤 외부 도움을 요청할까요?",
    example: "사소한 일로 매일 다투고 서로 말을 안 합니다.",
    mood: "진지함",
    choices: [
      { id: "b100-s10-08-a", label: "부부 상담", valueLabel: "부부 상담" },
      { id: "b100-s10-08-b", label: "양가 부모", valueLabel: "부모" },
      { id: "b100-s10-08-c", label: "가까운 친구", valueLabel: "친구" },
      { id: "b100-s10-08-d", label: "외부 도움 없이 둘이 푼다", valueLabel: "둘이서" }
    ]
  },
  {
    id: "b100-s10-09",
    sectionId: "s10",
    title: "출산 경험을 의료기관에 피드백하거나 문제 제기할 기준은 무엇인가요?",
    example: "출산 중 존중받지 못했다는 느낌이 남았습니다.",
    mood: "희망",
    choices: [
      { id: "b100-s10-09-a", label: "불편했던 것은 무엇이든 전한다", valueLabel: "모두 전함" },
      { id: "b100-s10-09-b", label: "몸에 문제가 남았을 때만", valueLabel: "피해 있을 때" },
      { id: "b100-s10-09-c", label: "다른 산모에게 반복될 일이면", valueLabel: "반복 우려 시" },
      { id: "b100-s10-09-d", label: "전하지 않는다", valueLabel: "전하지 않음" }
    ]
  },
  {
    id: "b100-s10-10",
    sectionId: "s10",
    title: "출산이 끝난 뒤 두 사람이 반드시 확인하고 고마움을 표현할 일은 무엇인가요?",
    example: "둘 다 자신이 더 힘들었다고 기억합니다.",
    mood: "여운",
    choices: [
      { id: "b100-s10-10-a", label: "상대가 견딘 일을 하나씩 말해 준다", valueLabel: "견딘 일 말하기" },
      { id: "b100-s10-10-b", label: "편지나 글로 남긴다", valueLabel: "글로 남기기" },
      { id: "b100-s10-10-c", label: "둘만의 시간을 만들어 이야기한다", valueLabel: "둘만의 시간" },
      { id: "b100-s10-10-d", label: "말없이 안아 준다", valueLabel: "안아 주기" }
    ]
  }
  ]
});

export const birth100Questions = birth100Pack.orderedQuestions;
