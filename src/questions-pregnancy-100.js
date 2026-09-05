/**
 * 임신 100제 — a site pack. Generated; do not edit by hand.
 *
 * Source: `question-packs/pregnancy.html`, the editorial review build.
 * Regenerate: `node scripts/build-pregnancy-100.mjs`. `test/pregnancy-100.test.js` fails if this
 * file and that one disagree.
 *
 * The source's 11th section — the emergency appendix — is not here on purpose. It is a quiz with
 * right and wrong answers about obstetric emergencies, which cannot live inside a site whose whole
 * contract is that there is no score and no verdict, and `question-packs/README.md` requires
 * medical review before that material is promoted to any runtime.
 */
import { definePack, PACK_SURFACE } from "./pack-schema.js";

export const pregnancy100Pack = definePack({
  id: "pregnancy-100",
  surface: PACK_SURFACE.site,
  audience: "couple",
  version: "2026-09-05",
  locale: "ko-KR",
  title: "임신 100제",
  sections: [
  { id: "s01", title: "우리에게 찾아온 소식", blurb: "두 줄을 본 순간부터 누구에게, 언제, 어디까지 말할지. 첫 소식을 다루는 방식에 두 사람의 결이 보여요." },
  { id: "s02", title: "달라지는 몸 곁에서", blurb: "입덧, 피로, 달라지는 몸이 두 사람의 하루를 바꿔요. 역할과 경계를 어디에 다시 놓는지 보여요." },
  { id: "s03", title: "아직 보이지 않는 아이", blurb: "병원, 검사, 결과 앞에서 얼마나 알고 싶고 누구에게 기대고 싶은지. 의료 앞에서의 결이 보여요." },
  { id: "s04", title: "함께한다는 말의 의미", blurb: "공부, 태교, 준비물, 감정. \"돕는다\"와 \"함께한다\" 사이에서 두 사람이 어디에 서 있는지 보여요." },
  { id: "s05", title: "흔들리는 일상과 미래", blurb: "일, 소득, 휴직, 복귀. 임신이 커리어와 생계를 흔들 때 두 사람이 무엇을 먼저 지키는지 보여요." },
  { id: "s06", title: "돈으로 드러나는 마음", blurb: "아기용품, 태교여행, 양가 지원. 지갑을 여는 순서에 무엇을 아끼고 무엇에 쓰고 싶은지 보여요." },
  { id: "s07", title: "우리 집 밖의 사람들", blurb: "양가 부모, 친척, 조언하는 사람들. 우리 집 문을 어디까지 열어 둘지에 두 사람의 경계가 보여요." },
  { id: "s08", title: "말하기 어려웠던 두려움", blurb: "우울, 불안, 자신감, 갈등. 밝은 얼굴 뒤에 둔 마음을 누가 먼저 꺼내고 어떻게 받는지 보여요." },
  { id: "s09", title: "출산을 기다리는 두 사람", blurb: "출산 방식, 함께 있을 사람, 조리원, 면회. 그날을 어떻게 맞을지에 두 사람의 우선순위가 보여요." },
  { id: "s10", title: "부모가 되기 전의 약속", blurb: "고위험, 조기 입원, 끝내 합의되지 않는 선택. 가장 어려운 순간에 무엇을 붙잡는지 보여요." }
  ],
  questions: [
  {
    id: "p100-s01-01",
    sectionId: "s01",
    title: "임신 테스트가 양성이라면 누구에게 가장 먼저 알리고 싶나요?",
    example: "아직 병원 확인 전인데 가족이 모이는 일정이 잡혀 있습니다.",
    mood: "미소",
    choices: [
      { id: "p100-s01-01-a", label: "병원에서 확인하기 전에는 두 사람만 안다", valueLabel: "확인 뒤에" },
      { id: "p100-s01-01-b", label: "양가 부모에게 그날 바로 알린다", valueLabel: "부모 먼저" },
      { id: "p100-s01-01-c", label: "가장 가까운 친구 한 사람에게 먼저 털어놓는다", valueLabel: "친구 먼저" },
      { id: "p100-s01-01-d", label: "모이는 자리에서 가족 모두에게 한 번에 알린다", valueLabel: "모두 한 번에" }
    ]
  },
  {
    id: "p100-s01-02",
    sectionId: "s01",
    title: "임신 사실을 직장에는 언제 알리는 것이 편안한가요?",
    example: "입덧과 병원 일정 때문에 업무 조정이 필요해지기 시작합니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s01-02-a", label: "확인 즉시 상사에게 알리고 일정 조정을 요청한다", valueLabel: "바로 알림" },
      { id: "p100-s01-02-b", label: "12주 안정기가 지난 뒤에 알린다", valueLabel: "안정기 뒤" },
      { id: "p100-s01-02-c", label: "업무 조정이 꼭 필요해지는 시점에 알린다", valueLabel: "필요할 때" },
      { id: "p100-s01-02-d", label: "배가 눈에 띌 때까지는 알리지 않는다", valueLabel: "최대한 늦게" }
    ]
  },
  {
    id: "p100-s01-03",
    sectionId: "s01",
    title: "초기 유산 가능성이 있는 시기에도 가까운 사람에게 알릴까요?",
    example: "도움은 필요하지만 나쁜 결과까지 설명해야 할 수 있습니다.",
    mood: "조심스러움",
    choices: [
      { id: "p100-s01-03-a", label: "알린다. 나쁜 소식이 오면 그것도 함께 나눈다", valueLabel: "함께 겪기" },
      { id: "p100-s01-03-b", label: "도움을 줄 한 사람에게만 알린다", valueLabel: "한 사람만" },
      { id: "p100-s01-03-c", label: "안정기까지는 아무에게도 알리지 않는다", valueLabel: "안정기까지 비밀" },
      { id: "p100-s01-03-d", label: "임신 대신 몸이 안 좋다고만 말해 둔다", valueLabel: "사정만 알림" }
    ]
  },
  {
    id: "p100-s01-04",
    sectionId: "s01",
    title: "태명은 누가 어떤 방식으로 정하고 싶나요?",
    example: "양가에서 서로 다른 태명을 먼저 제안합니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s01-04-a", label: "두 사람이 정하고 양가에는 결과만 알린다", valueLabel: "둘이 정함" },
      { id: "p100-s01-04-b", label: "임신한 사람이 정한다", valueLabel: "임산부가 정함" },
      { id: "p100-s01-04-c", label: "양가가 제안한 것 중 하나를 고른다", valueLabel: "가족 제안 수용" },
      { id: "p100-s01-04-d", label: "태명은 두지 않고 그냥 아기라고 부른다", valueLabel: "태명 없이" }
    ]
  },
  {
    id: "p100-s01-05",
    sectionId: "s01",
    title: "임신 사진과 초음파 사진을 SNS에 올려도 될까요?",
    example: "한 사람은 기록하고 싶고 다른 사람은 사생활이 걱정됩니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s01-05-a", label: "공개 계정에 올린다", valueLabel: "공개 기록" },
      { id: "p100-s01-05-b", label: "가까운 사람만 보는 비공개 계정이나 단체방에만 올린다", valueLabel: "지인에게만" },
      { id: "p100-s01-05-c", label: "올리지 않고 두 사람의 앨범에만 남긴다", valueLabel: "둘만의 앨범" },
      { id: "p100-s01-05-d", label: "출산 뒤에 정리해서 한 번에 올린다", valueLabel: "출산 뒤 공개" }
    ]
  },
  {
    id: "p100-s01-06",
    sectionId: "s01",
    title: "성별을 알게 되었을 때 공개 범위는 어디까지가 좋을까요?",
    example: "가족이 성별 공개 이벤트를 기대합니다.",
    mood: "안도",
    choices: [
      { id: "p100-s01-06-a", label: "가족 이벤트를 열어 다 함께 알게 한다", valueLabel: "이벤트로 공개" },
      { id: "p100-s01-06-b", label: "양가 부모에게만 전화로 알린다", valueLabel: "부모에게만" },
      { id: "p100-s01-06-c", label: "두 사람만 알고 출산 때 밝힌다", valueLabel: "출산 때까지 비밀" },
      { id: "p100-s01-06-d", label: "우리도 출산까지 성별을 묻지 않는다", valueLabel: "알지 않기" }
    ]
  },
  {
    id: "p100-s01-07",
    sectionId: "s01",
    title: "주변의 임신 축하와 조언이 부담스러울 때 누가 경계를 전달할까요?",
    example: "반복되는 연락과 음식 권유가 스트레스가 됩니다.",
    mood: "웃음",
    choices: [
      { id: "p100-s01-07-a", label: "각자 자기 쪽 가족과 지인에게 직접 말한다", valueLabel: "각자 자기 쪽" },
      { id: "p100-s01-07-b", label: "임신하지 않은 쪽이 대신 나서서 말한다", valueLabel: "파트너가 방패" },
      { id: "p100-s01-07-c", label: "임신한 사람이 스스로 말한다", valueLabel: "본인이 직접" },
      { id: "p100-s01-07-d", label: "말하지 않고 연락 빈도를 줄여 신호를 준다", valueLabel: "거리 두기" }
    ]
  },
  {
    id: "p100-s01-08",
    sectionId: "s01",
    title: "계획과 다른 시기에 임신했을 때, 두 사람의 감정이 다르면 어떻게 할까요?",
    example: "한 사람은 기쁘고 다른 사람은 두려움이 더 큽니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s01-08-a", label: "그날 밤 각자의 감정을 있는 그대로 다 말한다", valueLabel: "바로 다 말하기" },
      { id: "p100-s01-08-b", label: "기쁜 쪽이 기다리고, 두려운 쪽이 먼저 말할 때까지 묻지 않는다", valueLabel: "기다리기" },
      { id: "p100-s01-08-c", label: "감정 이야기보다 앞으로의 계획부터 세운다", valueLabel: "계획으로 정리" },
      { id: "p100-s01-08-d", label: "상담사나 산부인과 상담을 함께 받는다", valueLabel: "전문가와 함께" }
    ]
  },
  {
    id: "p100-s01-09",
    sectionId: "s01",
    title: "임신 사실을 아직 알리고 싶지 않은데 술자리나 모임이 있다면 어떻게 대응할까요?",
    example: "거절 이유를 설명하라는 압박을 받습니다.",
    mood: "희망",
    choices: [
      { id: "p100-s01-09-a", label: "이유를 대지 않고 불참한다", valueLabel: "불참" },
      { id: "p100-s01-09-b", label: "참석하되 약 복용 같은 다른 이유를 댄다", valueLabel: "다른 이유" },
      { id: "p100-s01-09-c", label: "참석하고 파트너가 대신 마시거나 말을 돌린다", valueLabel: "파트너가 커버" },
      { id: "p100-s01-09-d", label: "그 자리에서 임신을 알린다", valueLabel: "그냥 알리기" }
    ]
  },
  {
    id: "p100-s01-10",
    sectionId: "s01",
    title: "임신 기록을 사진·영상·일기 중 어느 정도 남기고 싶나요?",
    example: "한 사람은 모든 과정을 남기고 싶고 다른 사람은 촬영이 불편합니다.",
    mood: "여운",
    choices: [
      { id: "p100-s01-10-a", label: "매주 배 사진과 짧은 일기를 남긴다", valueLabel: "매주 기록" },
      { id: "p100-s01-10-b", label: "진료나 초음파 같은 큰 날만 남긴다", valueLabel: "큰 날만" },
      { id: "p100-s01-10-c", label: "사진은 찍지 않고 글로만 남긴다", valueLabel: "글로만" },
      { id: "p100-s01-10-d", label: "따로 남기지 않고 기억으로 둔다", valueLabel: "기록 없이" }
    ]
  },
  {
    id: "p100-s02-01",
    sectionId: "s02",
    title: "입덧으로 집안일이 어려워지면 어떤 기준으로 역할을 다시 나눌까요?",
    example: "냄새 때문에 요리와 설거지를 할 수 없습니다.",
    mood: "미소",
    choices: [
      { id: "p100-s02-01-a", label: "요리와 설거지는 파트너가 전부 맡는다", valueLabel: "파트너가 전담" },
      { id: "p100-s02-01-b", label: "냄새 없는 일로 바꿔 임산부도 계속 맡는다", valueLabel: "일을 바꿔 계속" },
      { id: "p100-s02-01-c", label: "입덧 기간에는 배달과 외식으로 해결한다", valueLabel: "배달로 대체" },
      { id: "p100-s02-01-d", label: "가사도우미나 가족에게 도움을 청한다", valueLabel: "외부 도움" }
    ]
  },
  {
    id: "p100-s02-02",
    sectionId: "s02",
    title: "임신 중 피로를 주변이 “유난”이라고 말할 때 파트너는 어떻게 대응해야 할까요?",
    example: "가족 모임을 일찍 떠나자 불평이 나옵니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s02-02-a", label: "그 자리에서 바로 \"몸이 힘든 게 맞다\"고 말한다", valueLabel: "바로 편들기" },
      { id: "p100-s02-02-b", label: "자리를 뜬 뒤 그 사람에게 따로 이야기한다", valueLabel: "따로 말하기" },
      { id: "p100-s02-02-c", label: "대꾸하지 않고 함께 일찍 자리를 뜬다", valueLabel: "말없이 같이 나옴" },
      { id: "p100-s02-02-d", label: "임산부가 직접 말하도록 두고 옆에 있는다", valueLabel: "본인에게 맡김" }
    ]
  },
  {
    id: "p100-s02-03",
    sectionId: "s02",
    title: "체중과 외모 변화에 관한 농담이나 평가에 어떤 경계를 둘까요?",
    example: "가족이 배와 체중을 반복해서 언급합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "p100-s02-03-a", label: "가족이라도 몸 이야기는 아예 꺼내지 말라고 한다", valueLabel: "몸 이야기 금지" },
      { id: "p100-s02-03-b", label: "걱정하는 말은 받되 농담은 멈춰 달라고 한다", valueLabel: "농담만 금지" },
      { id: "p100-s02-03-c", label: "처음 한 번은 넘기고 반복되면 말한다", valueLabel: "반복 시 제지" },
      { id: "p100-s02-03-d", label: "그냥 웃어넘기고 둘이서만 푼다", valueLabel: "웃어넘김" }
    ]
  },
  {
    id: "p100-s02-04",
    sectionId: "s02",
    title: "성생활의 빈도와 방식이 달라질 때 어떤 원칙으로 조율할까요?",
    example: "한 사람은 불안하고 다른 사람은 거절로 느낍니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s02-04-a", label: "의료진에게 물어 안전 범위를 확인하고 정한다", valueLabel: "의료진 확인" },
      { id: "p100-s02-04-b", label: "임신한 사람이 원할 때만 한다", valueLabel: "임산부가 결정" },
      { id: "p100-s02-04-c", label: "출산 전까지는 성관계 없이 다른 스킨십으로 한다", valueLabel: "스킨십으로 대체" },
      { id: "p100-s02-04-d", label: "주기적으로 서로의 마음을 묻고 그때그때 정한다", valueLabel: "그때그때 대화" }
    ]
  },
  {
    id: "p100-s02-05",
    sectionId: "s02",
    title: "임신 중 음식 제한을 두 사람 모두 함께 지켜야 할까요?",
    example: "임산부 앞에서 금지된 음식을 먹는 문제로 서운함이 생깁니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s02-05-a", label: "파트너도 임신 기간 내내 똑같이 제한한다", valueLabel: "똑같이 제한" },
      { id: "p100-s02-05-b", label: "집에서는 함께 지키고 밖에서는 자유롭게 먹는다", valueLabel: "집에서만 함께" },
      { id: "p100-s02-05-c", label: "임산부 앞에서만 먹지 않는다", valueLabel: "앞에서만 자제" },
      { id: "p100-s02-05-d", label: "각자 먹는 것은 각자 정한다", valueLabel: "각자 자유" }
    ]
  },
  {
    id: "p100-s02-06",
    sectionId: "s02",
    title: "카페인·운동·여행처럼 권고 범위가 다양한 선택은 누가 결정할까요?",
    example: "검색 결과와 의료진 설명이 조금씩 다릅니다.",
    mood: "안도",
    choices: [
      { id: "p100-s02-06-a", label: "임신한 사람이 몸 상태에 따라 혼자 정한다", valueLabel: "임산부가 정함" },
      { id: "p100-s02-06-b", label: "주치의 설명을 기준으로 삼고 그 안에서 정한다", valueLabel: "의료진 기준" },
      { id: "p100-s02-06-c", label: "가장 보수적인 권고에 맞춘다", valueLabel: "가장 안전하게" },
      { id: "p100-s02-06-d", label: "둘이 의견이 갈리면 더 걱정하는 쪽에 맞춘다", valueLabel: "걱정하는 쪽에" }
    ]
  },
  {
    id: "p100-s02-07",
    sectionId: "s02",
    title: "몸이 힘든 날 약속을 당일 취소해도 되는 범위는 어디까지일까요?",
    example: "중요한 가족 행사를 앞두고 컨디션이 급격히 나빠집니다.",
    mood: "웃음",
    choices: [
      { id: "p100-s02-07-a", label: "어떤 약속이든 몸이 힘들면 당일 취소한다", valueLabel: "몸이 우선" },
      { id: "p100-s02-07-b", label: "가족 행사는 잠깐이라도 얼굴을 비춘다", valueLabel: "잠깐이라도 참석" },
      { id: "p100-s02-07-c", label: "임산부는 쉬고 파트너가 혼자 참석한다", valueLabel: "파트너만 참석" },
      { id: "p100-s02-07-d", label: "미리 못 갈 수 있다고 알려 두고 당일 정한다", valueLabel: "미리 여지 두기" }
    ]
  },
  {
    id: "p100-s02-08",
    sectionId: "s02",
    title: "임부복·보조용품·마사지 비용은 어떤 비용으로 볼까요?",
    example: "기존 개인지출 원칙으로는 부담이 한쪽에 몰립니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s02-08-a", label: "임신과 관련된 것은 모두 공동 지출로 한다", valueLabel: "전부 공동" },
      { id: "p100-s02-08-b", label: "옷은 개인, 의료·보조용품은 공동으로 한다", valueLabel: "품목별로 나눔" },
      { id: "p100-s02-08-c", label: "임신 전용 예산을 따로 정해 그 안에서 쓴다", valueLabel: "전용 예산" },
      { id: "p100-s02-08-d", label: "파트너가 전액 부담한다", valueLabel: "파트너 부담" }
    ]
  },
  {
    id: "p100-s02-09",
    sectionId: "s02",
    title: "임신으로 수면이 깨질 때 침실을 분리하는 선택을 어떻게 생각하나요?",
    example: "한 사람의 잦은 뒤척임으로 두 사람 모두 잠을 못 잡니다.",
    mood: "희망",
    choices: [
      { id: "p100-s02-09-a", label: "출산 전까지 각방을 쓴다", valueLabel: "각방" },
      { id: "p100-s02-09-b", label: "한 침대에서 자되 힘든 날만 따로 잔다", valueLabel: "힘든 날만 따로" },
      { id: "p100-s02-09-c", label: "침대만 따로 두고 같은 방에서 잔다", valueLabel: "침대만 분리" },
      { id: "p100-s02-09-d", label: "잠을 못 자더라도 끝까지 같이 잔다", valueLabel: "끝까지 같이" }
    ]
  },
  {
    id: "p100-s02-10",
    sectionId: "s02",
    title: "배를 만지거나 사진 찍으려는 사람에게 어떤 규칙을 적용할까요?",
    example: "친척이 허락 없이 몸에 손을 댑니다.",
    mood: "여운",
    choices: [
      { id: "p100-s02-10-a", label: "누구든 만지지 못하게 한다", valueLabel: "아무도 안 됨" },
      { id: "p100-s02-10-b", label: "미리 물어보는 사람에게만 허락한다", valueLabel: "물어보면 허락" },
      { id: "p100-s02-10-c", label: "양가 부모와 형제만 허용한다", valueLabel: "가까운 가족만" },
      { id: "p100-s02-10-d", label: "불편하지 않으니 따로 규칙을 두지 않는다", valueLabel: "규칙 없음" }
    ]
  },
  {
    id: "p100-s03-01",
    sectionId: "s03",
    title: "산부인과와 주치의는 무엇을 가장 우선해 선택할까요?",
    example: "거리, 비용, 설명 방식, 분만 연계가 서로 다릅니다.",
    mood: "미소",
    choices: [
      { id: "p100-s03-01-a", label: "집이나 직장에서 가까운 곳", valueLabel: "거리" },
      { id: "p100-s03-01-b", label: "설명이 친절하고 질문하기 편한 의료진", valueLabel: "설명 방식" },
      { id: "p100-s03-01-c", label: "분만까지 한 곳에서 이어지는 병원", valueLabel: "분만 연계" },
      { id: "p100-s03-01-d", label: "비용 부담이 가장 적은 곳", valueLabel: "비용" }
    ]
  },
  {
    id: "p100-s03-02",
    sectionId: "s03",
    title: "파트너는 산전 진료에 어느 정도 동행해야 할까요?",
    example: "평일 진료와 중요한 검사가 겹칩니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s03-02-a", label: "모든 진료에 휴가를 내서라도 함께 간다", valueLabel: "매번 동행" },
      { id: "p100-s03-02-b", label: "초음파와 큰 검사가 있는 날만 함께 간다", valueLabel: "큰 날만 동행" },
      { id: "p100-s03-02-c", label: "갈 수 있는 날만 가고 나머지는 영상통화로 함께한다", valueLabel: "가능할 때만" },
      { id: "p100-s03-02-d", label: "진료는 임산부 혼자 가고 결과를 함께 본다", valueLabel: "결과만 공유" }
    ]
  },
  {
    id: "p100-s03-03",
    sectionId: "s03",
    title: "검사 결과를 두 사람 중 누가 먼저 확인하는 것이 좋을까요?",
    example: "앱 알림으로 민감한 결과가 먼저 도착합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "p100-s03-03-a", label: "알림이 오면 먼저 본 사람이 확인하고 알린다", valueLabel: "먼저 본 사람" },
      { id: "p100-s03-03-b", label: "반드시 두 사람이 같은 자리에서 함께 연다", valueLabel: "함께 열기" },
      { id: "p100-s03-03-c", label: "임신한 사람이 먼저 보고 준비되면 알린다", valueLabel: "임산부 먼저" },
      { id: "p100-s03-03-d", label: "파트너가 먼저 보고 어떻게 말할지 준비한다", valueLabel: "파트너 먼저" }
    ]
  },
  {
    id: "p100-s03-04",
    sectionId: "s03",
    title: "추가 비용이 드는 선택검사는 어떤 기준으로 결정할까요?",
    example: "의료진은 선택 사항이라고 설명하지만 불안이 큽니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s03-04-a", label: "의료진이 권하지 않으면 하지 않는다", valueLabel: "의료진 권고만" },
      { id: "p100-s03-04-b", label: "비용에 관계없이 가능한 검사는 다 받는다", valueLabel: "가능한 검사 전부" },
      { id: "p100-s03-04-c", label: "정해 둔 예산 안에서 우선순위를 정해 받는다", valueLabel: "예산 안에서" },
      { id: "p100-s03-04-d", label: "더 불안해하는 쪽이 원하면 받는다", valueLabel: "불안한 쪽 기준" }
    ]
  },
  {
    id: "p100-s03-05",
    sectionId: "s03",
    title: "태아 이상 가능성이 제시되면 정보를 얼마나 깊게 알아볼까요?",
    example: "검색할수록 불안이 커지고 의견이 갈립니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s03-05-a", label: "논문과 사례까지 찾아 최대한 깊이 알아본다", valueLabel: "끝까지 파악" },
      { id: "p100-s03-05-b", label: "의료진 설명만 듣고 검색은 하지 않는다", valueLabel: "의료진 설명만" },
      { id: "p100-s03-05-c", label: "한 사람이 알아보고 정리해서 전달한다", valueLabel: "한 사람이 정리" },
      { id: "p100-s03-05-d", label: "확정 검사 결과가 나올 때까지 찾아보지 않는다", valueLabel: "확정 전엔 보류" }
    ]
  },
  {
    id: "p100-s03-06",
    sectionId: "s03",
    title: "의학적 판단이 가족의 믿음이나 민간요법과 충돌하면 무엇을 우선할까요?",
    example: "가족이 병원 권고와 다른 방법을 강하게 권합니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s03-06-a", label: "의료진 권고만 따르고 가족에게 그렇게 말한다", valueLabel: "의료진만" },
      { id: "p100-s03-06-b", label: "의료진 권고를 따르되 해가 없는 것은 받아들인다", valueLabel: "해 없으면 수용" },
      { id: "p100-s03-06-c", label: "의료진에게 가족의 방법을 물어보고 결정한다", valueLabel: "의료진에게 확인" },
      { id: "p100-s03-06-d", label: "가족의 방법을 함께 시도하며 병원 진료도 받는다", valueLabel: "둘 다 병행" }
    ]
  },
  {
    id: "p100-s03-07",
    sectionId: "s03",
    title: "응급 신호가 애매할 때 바로 병원에 갈 기준은 무엇인가요?",
    example: "야간에 통증이 있지만 심한지 판단하기 어렵습니다.",
    mood: "침착함",
    choices: [
      { id: "p100-s03-07-a", label: "조금이라도 이상하면 밤이라도 바로 간다", valueLabel: "즉시 병원" },
      { id: "p100-s03-07-b", label: "병원이나 119에 전화해 물어본 뒤 정한다", valueLabel: "전화로 확인" },
      { id: "p100-s03-07-c", label: "정해 둔 증상 목록에 해당하면 간다", valueLabel: "체크리스트" },
      { id: "p100-s03-07-d", label: "임신한 사람의 느낌을 믿고 그가 정한다", valueLabel: "본인 판단" }
    ]
  },
  {
    id: "p100-s03-08",
    sectionId: "s03",
    title: "진료실에서 의료진에게 질문하고 기록하는 역할은 누가 맡을까요?",
    example: "진료실에서 긴장해 중요한 질문을 자주 잊습니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s03-08-a", label: "파트너가 질문 목록을 들고 묻고 적는다", valueLabel: "파트너가 담당" },
      { id: "p100-s03-08-b", label: "임신한 사람이 묻고 파트너는 기록만 한다", valueLabel: "질문과 기록 분담" },
      { id: "p100-s03-08-c", label: "진료 전에 함께 질문을 적어 두고 임산부가 묻는다", valueLabel: "함께 준비" },
      { id: "p100-s03-08-d", label: "의료진 허락을 받아 녹음하고 나중에 함께 듣는다", valueLabel: "녹음" }
    ]
  },
  {
    id: "p100-s03-09",
    sectionId: "s03",
    title: "건강정보 검색의 범위와 신뢰할 출처를 어떻게 정할까요?",
    example: "커뮤니티 경험담과 공식 권고가 충돌합니다.",
    mood: "희망",
    choices: [
      { id: "p100-s03-09-a", label: "정부·병원 공식 자료만 본다", valueLabel: "공식 자료만" },
      { id: "p100-s03-09-b", label: "커뮤니티 경험담도 참고하되 의료진에게 확인한다", valueLabel: "참고 후 확인" },
      { id: "p100-s03-09-c", label: "검색은 하지 않고 진료 때 묻는다", valueLabel: "검색 안 함" },
      { id: "p100-s03-09-d", label: "각자 원하는 대로 찾아보고 서로 강요하지 않는다", valueLabel: "각자 자유" }
    ]
  },
  {
    id: "p100-s03-10",
    sectionId: "s03",
    title: "검사나 진료 내용을 양가에 어디까지 공유할까요?",
    example: "매번 결과를 알려 달라는 요청이 들어옵니다.",
    mood: "여운",
    choices: [
      { id: "p100-s03-10-a", label: "진료 때마다 결과를 양가에 알린다", valueLabel: "매번 공유" },
      { id: "p100-s03-10-b", label: "큰 검사 결과만 알린다", valueLabel: "큰 결과만" },
      { id: "p100-s03-10-c", label: "정기적으로 한 번에 근황으로 전한다", valueLabel: "정기 근황" },
      { id: "p100-s03-10-d", label: "출산 때까지 이상 없다는 말만 한다", valueLabel: "최소 공유" }
    ]
  },
  {
    id: "p100-s04-01",
    sectionId: "s04",
    title: "임신 준비 공부는 누가 얼마나 주도해야 할까요?",
    example: "한 사람만 책·앱·병원 정보를 찾아 지칩니다.",
    mood: "미소",
    choices: [
      { id: "p100-s04-01-a", label: "두 사람이 같은 책과 앱을 각자 본다", valueLabel: "둘 다 같은 내용" },
      { id: "p100-s04-01-b", label: "영역을 나눠 각자 공부하고 서로 알려 준다", valueLabel: "영역 분담" },
      { id: "p100-s04-01-c", label: "임신한 사람이 주도하고 파트너는 요약만 듣는다", valueLabel: "임산부 주도" },
      { id: "p100-s04-01-d", label: "함께 산전 교육을 들으며 그 자리에서 배운다", valueLabel: "수업으로 함께" }
    ]
  },
  {
    id: "p100-s04-02",
    sectionId: "s04",
    title: "태교를 반드시 함께 해야 한다는 기대를 어떻게 생각하나요?",
    example: "한 사람은 매일 태담을 원하고 다른 사람은 어색해합니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s04-02-a", label: "매일 정해진 시간에 둘이 함께 한다", valueLabel: "매일 함께" },
      { id: "p100-s04-02-b", label: "원하는 사람만 하고 강요하지 않는다", valueLabel: "원하는 사람만" },
      { id: "p100-s04-02-c", label: "파트너는 어색하지 않은 방식으로 주 1회만 한다", valueLabel: "주 1회 파트너" },
      { id: "p100-s04-02-d", label: "태교라는 형식 없이 평소 대화로 대신한다", valueLabel: "형식 없이" }
    ]
  },
  {
    id: "p100-s04-03",
    sectionId: "s04",
    title: "파트너의 술·흡연·늦은 귀가를 임신 기간에 얼마나 조정할까요?",
    example: "임산부만 생활을 제한한다는 불공정감이 생깁니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "p100-s04-03-a", label: "임신 기간 동안 파트너도 술·담배·늦은 귀가를 끊는다", valueLabel: "함께 끊기" },
      { id: "p100-s04-03-b", label: "집 안에서는 금지, 밖에서는 자유", valueLabel: "집에서만 금지" },
      { id: "p100-s04-03-c", label: "횟수와 귀가 시간을 정해 그 안에서 한다", valueLabel: "횟수 제한" },
      { id: "p100-s04-03-d", label: "파트너 생활은 조정하지 않는다", valueLabel: "조정 없음" }
    ]
  },
  {
    id: "p100-s04-04",
    sectionId: "s04",
    title: "임산부가 부탁하기 전에 파트너가 알아서 해야 할 일은 어디까지인가요?",
    example: "“말하면 도와준다”는 태도가 정신적 노동으로 느껴집니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s04-04-a", label: "집안일 전부를 파트너가 알아서 맡는다", valueLabel: "전부 알아서" },
      { id: "p100-s04-04-b", label: "담당 영역을 정해 그 안은 부탁 없이 한다", valueLabel: "영역 안에서" },
      { id: "p100-s04-04-c", label: "매주 할 일을 함께 적고 파트너가 챙긴다", valueLabel: "주간 목록" },
      { id: "p100-s04-04-d", label: "부탁받으면 바로 하는 것으로 충분하다", valueLabel: "부탁하면 바로" }
    ]
  },
  {
    id: "p100-s04-05",
    sectionId: "s04",
    title: "신체적 통증을 완전히 이해할 수 없을 때 어떤 반응이 도움이 될까요?",
    example: "해결책보다 공감을 원하지만 자꾸 조언부터 합니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s04-05-a", label: "말없이 옆에서 안아 주거나 마사지한다", valueLabel: "몸으로 위로" },
      { id: "p100-s04-05-b", label: "\"많이 힘들지\"라고 말하고 듣기만 한다", valueLabel: "듣기만" },
      { id: "p100-s04-05-c", label: "병원에 가자고 하거나 해결책을 찾는다", valueLabel: "해결책 제시" },
      { id: "p100-s04-05-d", label: "뭘 해 주면 좋을지 먼저 묻는다", valueLabel: "원하는 걸 묻기" }
    ]
  },
  {
    id: "p100-s04-06",
    sectionId: "s04",
    title: "임신 관련 앱과 일정 관리를 두 사람 모두 해야 할까요?",
    example: "병원·영양제·준비물 일정이 한 사람에게 집중됩니다.",
    mood: "안도",
    choices: [
      { id: "p100-s04-06-a", label: "같은 앱을 둘 다 깔고 알림을 함께 받는다", valueLabel: "앱 공유" },
      { id: "p100-s04-06-b", label: "파트너가 일정 관리를 전담한다", valueLabel: "파트너 전담" },
      { id: "p100-s04-06-c", label: "임산부가 관리하고 주요 일정만 공유 캘린더에 넣는다", valueLabel: "주요 일정만 공유" },
      { id: "p100-s04-06-d", label: "임산부가 관리하고 파트너에게 말로 알린다", valueLabel: "말로 알림" }
    ]
  },
  {
    id: "p100-s04-07",
    sectionId: "s04",
    title: "임신 중 감정 기복과 상처 주는 말을 어디까지 구분해 다룰까요?",
    example: "몸이 힘든 날 다툼에서 심한 말이 나옵니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s04-07-a", label: "임신 중 나온 말은 몸 탓으로 보고 넘긴다", valueLabel: "몸 탓으로 넘김" },
      { id: "p100-s04-07-b", label: "그날은 넘기고 다음 날 그 말에 대해 이야기한다", valueLabel: "다음 날 다시" },
      { id: "p100-s04-07-c", label: "임신 중이어도 심한 말은 그 자리에서 사과받는다", valueLabel: "바로 사과" },
      { id: "p100-s04-07-d", label: "하면 안 되는 말 목록을 미리 정해 둔다", valueLabel: "금지어 정하기" }
    ]
  },
  {
    id: "p100-s04-08",
    sectionId: "s04",
    title: "파트너도 임신 과정에서 느끼는 두려움을 언제 어떻게 말할까요?",
    example: "걱정을 말하면 임산부 부담을 키울까 숨기고 있습니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s04-08-a", label: "느낄 때마다 바로 임산부에게 말한다", valueLabel: "바로 말하기" },
      { id: "p100-s04-08-b", label: "임산부 컨디션이 괜찮은 날 골라 말한다", valueLabel: "괜찮은 날에" },
      { id: "p100-s04-08-c", label: "정해진 대화 시간에 서로의 걱정을 함께 꺼낸다", valueLabel: "정기 대화" },
      { id: "p100-s04-08-d", label: "임산부에게는 말하지 않고 친구나 상담사에게 말한다", valueLabel: "밖에서 풀기" }
    ]
  },
  {
    id: "p100-s04-09",
    sectionId: "s04",
    title: "임산부가 쉬는 동안 파트너의 개인 휴식은 어떻게 보장할까요?",
    example: "한 사람은 몸 때문에 쉬고 다른 사람은 집안일로 지칩니다.",
    mood: "희망",
    choices: [
      { id: "p100-s04-09-a", label: "주말 중 반나절은 파트너가 온전히 쉰다", valueLabel: "정해진 휴식" },
      { id: "p100-s04-09-b", label: "집안일을 줄이거나 외부에 맡겨 둘 다 쉰다", valueLabel: "일 자체를 줄임" },
      { id: "p100-s04-09-c", label: "임산부가 괜찮은 날 집안일을 나눠 파트너가 쉰다", valueLabel: "괜찮은 날 교대" },
      { id: "p100-s04-09-d", label: "임신 기간에는 파트너 휴식을 뒤로 미룬다", valueLabel: "출산 뒤로 미룸" }
    ]
  },
  {
    id: "p100-s04-10",
    sectionId: "s04",
    title: "“도움”이 아니라 공동 책임이라고 느끼게 하는 기준은 무엇인가요?",
    example: "한 사람이 모든 지시와 확인을 맡고 있습니다.",
    mood: "여운",
    choices: [
      { id: "p100-s04-10-a", label: "각자 맡은 일은 확인 없이 끝까지 책임진다", valueLabel: "확인 없는 책임" },
      { id: "p100-s04-10-b", label: "파트너가 먼저 할 일을 찾아 제안한다", valueLabel: "먼저 제안하기" },
      { id: "p100-s04-10-c", label: "주 1회 함께 앉아 할 일을 나누고 점검한다", valueLabel: "함께 점검" },
      { id: "p100-s04-10-d", label: "지시하고 확인하는 역할 자체를 번갈아 맡는다", valueLabel: "지휘 역할 교대" }
    ]
  },
  {
    id: "p100-s05-01",
    sectionId: "s05",
    title: "임신으로 업무 조정이 필요할 때 경력과 건강 중 무엇을 우선할까요?",
    example: "승진 프로젝트와 안정이 필요한 시기가 겹칩니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s05-01-a", label: "프로젝트에서 빠지고 안정을 택한다", valueLabel: "건강 우선" },
      { id: "p100-s05-01-b", label: "프로젝트는 맡되 근무 시간과 강도를 줄인다", valueLabel: "줄여서 유지" },
      { id: "p100-s05-01-c", label: "의료진이 괜찮다고 하면 그대로 진행한다", valueLabel: "의료진 판단" },
      { id: "p100-s05-01-d", label: "파트너가 집안일을 다 맡고 프로젝트를 끝까지 한다", valueLabel: "경력 우선" }
    ]
  },
  {
    id: "p100-s05-02",
    sectionId: "s05",
    title: "소득이 줄어들면 공동생활비 분담을 어떻게 바꿀까요?",
    example: "휴직으로 한 사람의 월수입이 크게 감소합니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s05-02-a", label: "소득 비율에 맞춰 분담 비율을 바꾼다", valueLabel: "소득 비율로" },
      { id: "p100-s05-02-b", label: "휴직 기간에는 파트너가 생활비를 전부 낸다", valueLabel: "파트너 전액" },
      { id: "p100-s05-02-c", label: "두 사람 수입을 합쳐 공동 계좌에서 쓴다", valueLabel: "통합 관리" },
      { id: "p100-s05-02-d", label: "분담은 그대로 두고 줄어든 만큼 저축에서 쓴다", valueLabel: "저축으로 보전" }
    ]
  },
  {
    id: "p100-s05-03",
    sectionId: "s05",
    title: "육아휴직은 누가 언제 얼마나 사용할까요?",
    example: "제도상 가능하지만 두 사람의 직장 문화가 다릅니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "p100-s05-03-a", label: "임신한 사람이 길게 쓰고 파트너는 출산 직후만 쓴다", valueLabel: "임산부 위주" },
      { id: "p100-s05-03-b", label: "두 사람이 비슷한 기간을 이어서 쓴다", valueLabel: "반반 이어서" },
      { id: "p100-s05-03-c", label: "두 사람이 같은 기간에 동시에 쓴다", valueLabel: "동시에 함께" },
      { id: "p100-s05-03-d", label: "직장 상황이 나은 쪽이 쓴다", valueLabel: "가능한 쪽이" }
    ]
  },
  {
    id: "p100-s05-04",
    sectionId: "s05",
    title: "직장에서 임신 차별을 경험하면 어디까지 대응할까요?",
    example: "중요한 업무에서 반복적으로 배제됩니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s05-04-a", label: "상사에게 직접 문제를 제기한다", valueLabel: "직접 제기" },
      { id: "p100-s05-04-b", label: "인사팀이나 노동청에 공식적으로 신고한다", valueLabel: "공식 신고" },
      { id: "p100-s05-04-c", label: "기록만 남겨 두고 복귀 뒤에 대응한다", valueLabel: "기록 후 보류" },
      { id: "p100-s05-04-d", label: "대응하지 않고 이직이나 퇴사를 준비한다", valueLabel: "떠나기" }
    ]
  },
  {
    id: "p100-s05-05",
    sectionId: "s05",
    title: "야근·출장·교대근무는 임신 기간에 어떻게 조정할까요?",
    example: "파트너의 장기 출장이 만삭 시기와 겹칩니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s05-05-a", label: "파트너가 출장을 거절하거나 조정한다", valueLabel: "파트너가 조정" },
      { id: "p100-s05-05-b", label: "출장은 가되 만삭 한 달 전에는 무조건 곁에 있는다", valueLabel: "만삭 한 달 전만" },
      { id: "p100-s05-05-c", label: "파트너 부재 기간에 가족이 곁에 머문다", valueLabel: "가족이 대신" },
      { id: "p100-s05-05-d", label: "일은 그대로 하고 응급 대비만 해 둔다", valueLabel: "일 우선" }
    ]
  },
  {
    id: "p100-s05-06",
    sectionId: "s05",
    title: "출산 후 복귀 시점을 임신 중에 얼마나 확정할까요?",
    example: "회사는 계획을 요구하지만 회복과 돌봄 상황은 알 수 없습니다.",
    mood: "안도",
    choices: [
      { id: "p100-s05-06-a", label: "복귀 날짜를 정해 회사에 확정해 준다", valueLabel: "날짜 확정" },
      { id: "p100-s05-06-b", label: "최소 기간만 약속하고 연장 가능성을 열어 둔다", valueLabel: "최소만 약속" },
      { id: "p100-s05-06-c", label: "출산 후 상황을 보고 정하겠다고 말한다", valueLabel: "출산 뒤 결정" },
      { id: "p100-s05-06-d", label: "복귀하지 않을 가능성까지 열어 둔다", valueLabel: "복귀 여부 미정" }
    ]
  },
  {
    id: "p100-s05-07",
    sectionId: "s05",
    title: "경력 손실을 부부 공동의 비용으로 어떻게 보상할까요?",
    example: "한 사람의 연봉과 승진 가능성이 크게 줄어듭니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s05-07-a", label: "줄어든 소득만큼 파트너 명의 자산을 나눠 둔다", valueLabel: "자산으로 보상" },
      { id: "p100-s05-07-b", label: "복귀 후 재교육·이직 비용을 공동 예산으로 쓴다", valueLabel: "재도약 지원" },
      { id: "p100-s05-07-c", label: "다음 아이는 파트너가 휴직해 손실을 나눈다", valueLabel: "다음엔 교대" },
      { id: "p100-s05-07-d", label: "금전 보상보다 집안일·육아를 더 맡는 것으로 갚는다", valueLabel: "일로 보상" }
    ]
  },
  {
    id: "p100-s05-08",
    sectionId: "s05",
    title: "프리랜서·자영업처럼 휴직 보장이 없을 때 무엇을 줄일까요?",
    example: "쉬면 수입이 바로 사라지는 상황입니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s05-08-a", label: "일을 줄이지 않고 출산 직전까지 한다", valueLabel: "끝까지 일함" },
      { id: "p100-s05-08-b", label: "일의 양을 반으로 줄이고 생활비를 줄인다", valueLabel: "일과 지출 절반" },
      { id: "p100-s05-08-c", label: "몇 달간 일을 멈추고 저축과 파트너 소득으로 산다", valueLabel: "멈추고 버팀" },
      { id: "p100-s05-08-d", label: "대신 맡아 줄 사람을 구해 일을 유지한다", valueLabel: "대체 인력" }
    ]
  },
  {
    id: "p100-s05-09",
    sectionId: "s05",
    title: "각자의 직장에 임신 사실과 일정 조정을 설명하는 일은 누가 맡을까요?",
    example: "파트너의 회사에도 일정 조정 설명이 필요합니다.",
    mood: "희망",
    choices: [
      { id: "p100-s05-09-a", label: "각자 자기 직장에 직접 설명한다", valueLabel: "각자 직접" },
      { id: "p100-s05-09-b", label: "임신한 사람 직장에만 알리고 파트너는 알리지 않는다", valueLabel: "임산부 쪽만" },
      { id: "p100-s05-09-c", label: "함께 설명 문구를 만들어 두 회사에 같은 내용을 전한다", valueLabel: "문구 통일" },
      { id: "p100-s05-09-d", label: "의사 소견서를 받아 그 서류로 설명을 대신한다", valueLabel: "서류로 대신" }
    ]
  },
  {
    id: "p100-s05-10",
    sectionId: "s05",
    title: "임신 중 퇴사 제안을 받거나 하고 싶을 때 어떤 조건을 확인할까요?",
    example: "몸은 힘들지만 퇴사 후 경제적 의존이 걱정됩니다.",
    mood: "여운",
    choices: [
      { id: "p100-s05-10-a", label: "퇴사 후 생활비를 파트너 소득으로 감당할 수 있는지", valueLabel: "생활비 감당" },
      { id: "p100-s05-10-b", label: "출산 후 재취업 가능성이 있는지", valueLabel: "재취업 가능성" },
      { id: "p100-s05-10-c", label: "육아휴직 급여와 복귀 권리를 포기해도 되는지", valueLabel: "제도 혜택 손실" },
      { id: "p100-s05-10-d", label: "몸이 힘들면 조건 없이 그만둔다", valueLabel: "몸이 먼저" }
    ]
  },
  {
    id: "p100-s06-01",
    sectionId: "s06",
    title: "아기용품은 출산 전에 어느 수준까지 준비할까요?",
    example: "커뮤니티 추천 목록이 계속 늘어납니다.",
    mood: "미소",
    choices: [
      { id: "p100-s06-01-a", label: "필수품만 사고 나머지는 태어난 뒤 산다", valueLabel: "필수품만" },
      { id: "p100-s06-01-b", label: "추천 목록을 다 갖춰 두고 시작한다", valueLabel: "목록 전부" },
      { id: "p100-s06-01-c", label: "물려받거나 빌릴 수 있는 것을 먼저 채운다", valueLabel: "물려받기 먼저" },
      { id: "p100-s06-01-d", label: "예산을 정해 두고 그 안에서만 산다", valueLabel: "예산 안에서" }
    ]
  },
  {
    id: "p100-s06-02",
    sectionId: "s06",
    title: "고가 유모차·카시트·가구는 무엇을 기준으로 선택할까요?",
    example: "안전, 디자인, 브랜드, 중고 가격이 충돌합니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s06-02-a", label: "안전 인증과 사용 후기", valueLabel: "안전" },
      { id: "p100-s06-02-b", label: "디자인과 우리 집에 어울리는지", valueLabel: "디자인" },
      { id: "p100-s06-02-c", label: "가격 대비 만족도", valueLabel: "가성비" },
      { id: "p100-s06-02-d", label: "믿을 수 있는 브랜드", valueLabel: "브랜드" }
    ]
  },
  {
    id: "p100-s06-03",
    sectionId: "s06",
    title: "새 제품과 중고 제품의 경계는 어디에 둘까요?",
    example: "절약하고 싶지만 위생과 안전이 걱정됩니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "p100-s06-03-a", label: "카시트처럼 안전과 직결된 것만 새것으로 산다", valueLabel: "안전 용품만 새것" },
      { id: "p100-s06-03-b", label: "피부에 닿는 것은 새것, 가구는 중고로 한다", valueLabel: "피부 닿는 것만 새것" },
      { id: "p100-s06-03-c", label: "전부 새것으로 산다", valueLabel: "전부 새것" },
      { id: "p100-s06-03-d", label: "받거나 살 수 있는 것은 전부 중고로 한다", valueLabel: "최대한 중고" }
    ]
  },
  {
    id: "p100-s06-04",
    sectionId: "s06",
    title: "태교여행은 필수 경험인가 선택 소비인가요?",
    example: "예산은 빠듯하지만 지금 아니면 어렵다는 말이 많습니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s06-04-a", label: "예산을 넘겨서라도 해외로 간다", valueLabel: "해외로 간다" },
      { id: "p100-s06-04-b", label: "예산 안에서 국내 1박 2일로 간다", valueLabel: "국내로 간다" },
      { id: "p100-s06-04-c", label: "여행 대신 그 돈을 출산 준비에 쓴다", valueLabel: "준비에 쓴다" },
      { id: "p100-s06-04-d", label: "여행 없이 집에서 둘만의 시간을 갖는다", valueLabel: "집에서 보낸다" }
    ]
  },
  {
    id: "p100-s06-05",
    sectionId: "s06",
    title: "임신·출산 비용을 기존 5:5 원칙으로 나누는 것이 공정할까요?",
    example: "몸의 부담과 소득 감소는 한쪽에 집중됩니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s06-05-a", label: "5:5를 그대로 유지한다", valueLabel: "5:5 유지" },
      { id: "p100-s06-05-b", label: "소득 비율로 나눈다", valueLabel: "소득 비율" },
      { id: "p100-s06-05-c", label: "파트너가 임신·출산 비용을 전부 낸다", valueLabel: "파트너 전액" },
      { id: "p100-s06-05-d", label: "공동 계좌에서 내고 나누지 않는다", valueLabel: "나누지 않음" }
    ]
  },
  {
    id: "p100-s06-06",
    sectionId: "s06",
    title: "양가에서 큰돈이나 물품을 지원할 때 간섭은 어디까지 받아들일까요?",
    example: "지원과 함께 병원·이름·육아 방식 요구가 따라옵니다.",
    mood: "안도",
    choices: [
      { id: "p100-s06-06-a", label: "지원을 받지 않고 간섭도 받지 않는다", valueLabel: "지원 거절" },
      { id: "p100-s06-06-b", label: "지원은 받되 결정은 우리가 한다고 미리 말한다", valueLabel: "조건 없는 지원만" },
      { id: "p100-s06-06-c", label: "지원받은 영역의 의견은 참고한다", valueLabel: "해당 영역만 참고" },
      { id: "p100-s06-06-d", label: "지원해 준 만큼 의견을 존중한다", valueLabel: "의견 수용" }
    ]
  },
  {
    id: "p100-s06-07",
    sectionId: "s06",
    title: "보험과 저축은 임신 중 어느 수준까지 준비할까요?",
    example: "불안을 자극하는 상품 권유가 이어집니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s06-07-a", label: "태아보험과 실손을 먼저 들고 저축은 뒤로 미룬다", valueLabel: "보험 먼저" },
      { id: "p100-s06-07-b", label: "보험은 최소로 하고 출산 비상금부터 모은다", valueLabel: "비상금 먼저" },
      { id: "p100-s06-07-c", label: "전문가에게 한 번 점검받고 그대로 따른다", valueLabel: "전문가 점검" },
      { id: "p100-s06-07-d", label: "기존 보험과 저축을 유지하고 새로 들지 않는다", valueLabel: "현행 유지" }
    ]
  },
  {
    id: "p100-s06-08",
    sectionId: "s06",
    title: "준비물 구매를 누가 조사하고 최종 결정할까요?",
    example: "비교와 반품 업무가 한 사람에게 쏠립니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s06-08-a", label: "한 사람이 조사하고 다른 사람이 결제와 반품을 맡는다", valueLabel: "조사와 처리 분담" },
      { id: "p100-s06-08-b", label: "품목을 반으로 나눠 각자 조사하고 결정한다", valueLabel: "품목 분담" },
      { id: "p100-s06-08-c", label: "임신한 사람이 조사와 결정을 다 한다", valueLabel: "임산부 전담" },
      { id: "p100-s06-08-d", label: "파트너가 조사와 결정을 다 한다", valueLabel: "파트너 전담" }
    ]
  },
  {
    id: "p100-s06-09",
    sectionId: "s06",
    title: "베이비샤워·만삭사진·성별공개 행사에 얼마까지 쓸까요?",
    example: "추억의 가치와 보여주기 소비라는 시선이 갈립니다.",
    mood: "희망",
    choices: [
      { id: "p100-s06-09-a", label: "하고 싶은 것은 비용을 따지지 않고 다 한다", valueLabel: "다 한다" },
      { id: "p100-s06-09-b", label: "만삭사진 하나만 남긴다", valueLabel: "사진 하나만" },
      { id: "p100-s06-09-c", label: "친구가 열어 주는 것만 받고 직접 열지 않는다", valueLabel: "받기만" },
      { id: "p100-s06-09-d", label: "아무것도 하지 않는다", valueLabel: "하지 않음" }
    ]
  },
  {
    id: "p100-s06-10",
    sectionId: "s06",
    title: "예상치 못한 고위험 임신 비용에 대비해 어떤 지출을 먼저 줄일까요?",
    example: "추가 진료와 휴직으로 예산이 흔들립니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s06-10-a", label: "외식·여행 같은 생활 지출부터 줄인다", valueLabel: "생활 지출" },
      { id: "p100-s06-10-b", label: "아기용품 예산부터 줄인다", valueLabel: "아기용품" },
      { id: "p100-s06-10-c", label: "저축과 투자를 멈춘다", valueLabel: "저축 중단" },
      { id: "p100-s06-10-d", label: "줄이지 않고 양가나 대출에 기댄다", valueLabel: "빌려서 유지" }
    ]
  },
  {
    id: "p100-s07-01",
    sectionId: "s07",
    title: "양가 부모의 병원 동행은 어디까지 허용할까요?",
    example: "초음파를 함께 보고 싶다는 요청이 옵니다.",
    mood: "미소",
    choices: [
      { id: "p100-s07-01-a", label: "진료는 두 사람만 가고 사진을 보내 드린다", valueLabel: "사진만 공유" },
      { id: "p100-s07-01-b", label: "초음파 한 번은 함께 가서 보여 드린다", valueLabel: "한 번은 함께" },
      { id: "p100-s07-01-c", label: "원하실 때마다 함께 간다", valueLabel: "원하면 언제든" },
      { id: "p100-s07-01-d", label: "임신한 사람 쪽 부모만 동행할 수 있다", valueLabel: "한쪽 부모만" }
    ]
  },
  {
    id: "p100-s07-02",
    sectionId: "s07",
    title: "시댁과 친정의 임신 관련 조언이 충돌하면 누가 정리할까요?",
    example: "음식과 생활 습관을 두고 서로 다른 요구가 나옵니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s07-02-a", label: "각자 자기 부모에게 우리 방식을 설명한다", valueLabel: "각자 자기 부모" },
      { id: "p100-s07-02-b", label: "의료진 말을 기준으로 삼고 양쪽에 똑같이 전한다", valueLabel: "의료진 기준" },
      { id: "p100-s07-02-c", label: "임신한 사람이 원하는 대로 하고 양가에는 말하지 않는다", valueLabel: "조용히 우리 식" },
      { id: "p100-s07-02-d", label: "양쪽 조언을 다 듣고 절충한다", valueLabel: "절충" }
    ]
  },
  {
    id: "p100-s07-03",
    sectionId: "s07",
    title: "가족이 태아의 성별에 실망을 표현하면 어떻게 대응할까요?",
    example: "축하 자리에서 선호 성별 이야기가 반복됩니다.",
    mood: "단호함",
    choices: [
      { id: "p100-s07-03-a", label: "그 자리에서 그런 말은 듣지 않겠다고 말한다", valueLabel: "즉시 제지" },
      { id: "p100-s07-03-b", label: "그 가족의 자녀인 쪽이 나중에 따로 말한다", valueLabel: "자기 가족은 자기가" },
      { id: "p100-s07-03-c", label: "웃어넘기고 아이 이야기를 하지 않는다", valueLabel: "웃어넘김" },
      { id: "p100-s07-03-d", label: "그런 말을 하는 자리에는 당분간 가지 않는다", valueLabel: "거리 두기" }
    ]
  },
  {
    id: "p100-s07-04",
    sectionId: "s07",
    title: "아기 이름에 양가 의견을 얼마나 반영할까요?",
    example: "돌림자와 종교적 의미를 두고 압박이 있습니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s07-04-a", label: "두 사람이 정하고 양가 의견은 받지 않는다", valueLabel: "둘이 정함" },
      { id: "p100-s07-04-b", label: "돌림자만 따르고 나머지는 우리가 정한다", valueLabel: "돌림자만 수용" },
      { id: "p100-s07-04-c", label: "양가 후보를 받아 그중에서 고른다", valueLabel: "후보 중 선택" },
      { id: "p100-s07-04-d", label: "작명은 양가에 맡긴다", valueLabel: "양가에 맡김" }
    ]
  },
  {
    id: "p100-s07-05",
    sectionId: "s07",
    title: "임신 중 가족 행사 참석 의무를 얼마나 줄일까요?",
    example: "장거리 이동이 필요한 명절과 만삭이 겹칩니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s07-05-a", label: "임신 기간에는 장거리 행사에 가지 않는다", valueLabel: "장거리 불참" },
      { id: "p100-s07-05-b", label: "파트너만 가고 임산부는 집에 남는다", valueLabel: "파트너만 참석" },
      { id: "p100-s07-05-c", label: "무리해서라도 함께 가되 당일 돌아온다", valueLabel: "당일치기 참석" },
      { id: "p100-s07-05-d", label: "가족이 우리 집으로 오게 한다", valueLabel: "집으로 초대" }
    ]
  },
  {
    id: "p100-s07-06",
    sectionId: "s07",
    title: "집에 머물며 돕겠다는 가족의 제안을 받을까요?",
    example: "도움은 필요하지만 함께 지내는 스트레스가 큽니다.",
    mood: "안도",
    choices: [
      { id: "p100-s07-06-a", label: "출산 전후 정해진 기간만 함께 지낸다", valueLabel: "기간 한정" },
      { id: "p100-s07-06-b", label: "함께 살지 않고 낮에만 오시게 한다", valueLabel: "낮에만 도움" },
      { id: "p100-s07-06-c", label: "정중히 거절하고 도우미를 쓴다", valueLabel: "거절하고 도우미" },
      { id: "p100-s07-06-d", label: "필요한 만큼 함께 지낸다", valueLabel: "함께 지냄" }
    ]
  },
  {
    id: "p100-s07-07",
    sectionId: "s07",
    title: "출산 전 집 열쇠나 비밀번호를 가족에게 공유해도 될까요?",
    example: "응급상황을 이유로 자유로운 출입을 원합니다.",
    mood: "웃음",
    choices: [
      { id: "p100-s07-07-a", label: "공유하지 않는다", valueLabel: "공유 안 함" },
      { id: "p100-s07-07-b", label: "응급 때만 쓰기로 약속하고 한 분에게만 준다", valueLabel: "한 분에게만" },
      { id: "p100-s07-07-c", label: "만삭부터 출산 후까지만 알려 주고 나중에 바꾼다", valueLabel: "기간 한정" },
      { id: "p100-s07-07-d", label: "양가 모두에게 알려 드린다", valueLabel: "양가 모두" }
    ]
  },
  {
    id: "p100-s07-08",
    sectionId: "s07",
    title: "가족이 아기용품을 상의 없이 사 올 때 어떻게 대응할까요?",
    example: "집 공간과 취향에 맞지 않는 물건이 쌓입니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s07-08-a", label: "사 오기 전에 꼭 물어봐 달라고 말한다", valueLabel: "먼저 묻기 요청" },
      { id: "p100-s07-08-b", label: "필요한 물건 목록을 드려 그 안에서 고르게 한다", valueLabel: "목록 전달" },
      { id: "p100-s07-08-c", label: "받되 쓰지 않는 것은 조용히 처분한다", valueLabel: "받고 처분" },
      { id: "p100-s07-08-d", label: "감사히 받고 그대로 쓴다", valueLabel: "그대로 씀" }
    ]
  },
  {
    id: "p100-s07-09",
    sectionId: "s07",
    title: "임산부 몸 상태를 다른 가족에게 전달하는 창구는 누가 될까요?",
    example: "매일 상태를 묻는 연락이 부담됩니다.",
    mood: "희망",
    choices: [
      { id: "p100-s07-09-a", label: "파트너가 양가 연락을 모두 맡는다", valueLabel: "파트너 창구" },
      { id: "p100-s07-09-b", label: "각자 자기 가족에게 전한다", valueLabel: "각자 자기 가족" },
      { id: "p100-s07-09-c", label: "가족 단체방에 주 1회 한 번만 올린다", valueLabel: "주 1회 단체방" },
      { id: "p100-s07-09-d", label: "임신한 사람이 직접 답한다", valueLabel: "본인이 직접" }
    ]
  },
  {
    id: "p100-s07-10",
    sectionId: "s07",
    title: "가족의 종교적 태교나 의식을 어디까지 받아들일까요?",
    example: "원치 않는 기도·부적·행사 참여를 권합니다.",
    mood: "여운",
    choices: [
      { id: "p100-s07-10-a", label: "참여하지 않겠다고 분명히 말한다", valueLabel: "거절" },
      { id: "p100-s07-10-b", label: "물건은 받되 행사 참여는 하지 않는다", valueLabel: "물건만 받음" },
      { id: "p100-s07-10-c", label: "한 번은 참여해 드린다", valueLabel: "한 번은 참여" },
      { id: "p100-s07-10-d", label: "해가 없으니 원하시는 대로 따른다", valueLabel: "따름" }
    ]
  },
  {
    id: "p100-s08-01",
    sectionId: "s08",
    title: "임신 중 우울·불안 신호를 누가 어떻게 먼저 꺼낼까요?",
    example: "잠과 식사가 무너졌지만 단순한 호르몬 문제로 넘깁니다.",
    mood: "조심스러움",
    choices: [
      { id: "p100-s08-01-a", label: "알아챈 파트너가 \"요즘 힘들어 보여\"라고 먼저 말한다", valueLabel: "파트너가 먼저" },
      { id: "p100-s08-01-b", label: "본인이 말할 때까지 파트너는 기다린다", valueLabel: "본인이 먼저" },
      { id: "p100-s08-01-c", label: "정기 진료 때 의료진에게 함께 이야기한다", valueLabel: "진료 때 함께" },
      { id: "p100-s08-01-d", label: "주 1회 서로의 상태를 묻는 시간을 정해 둔다", valueLabel: "정기 점검" }
    ]
  },
  {
    id: "p100-s08-02",
    sectionId: "s08",
    title: "상담이나 정신건강 진료를 받는 기준을 어떻게 정할까요?",
    example: "한 사람은 필요하다고 느끼고 다른 사람은 과하다고 봅니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s08-02-a", label: "한 사람이라도 필요하다고 느끼면 받는다", valueLabel: "한 명이 원하면" },
      { id: "p100-s08-02-b", label: "잠·식사·일상이 2주 이상 무너지면 받는다", valueLabel: "기간 기준" },
      { id: "p100-s08-02-c", label: "산부인과 의료진이 권하면 받는다", valueLabel: "의료진 권고" },
      { id: "p100-s08-02-d", label: "둘이 이야기해서 풀리지 않을 때만 받는다", valueLabel: "대화 뒤 결정" }
    ]
  },
  {
    id: "p100-s08-03",
    sectionId: "s08",
    title: "임신이 관계를 행복하게 만들어야 한다는 압박을 어떻게 내려놓을까요?",
    example: "기쁘지 않은 감정을 말하기 어려워집니다.",
    mood: "솔직함",
    choices: [
      { id: "p100-s08-03-a", label: "기쁘지 않은 날은 그렇다고 서로 말하기로 한다", valueLabel: "솔직히 말하기" },
      { id: "p100-s08-03-b", label: "임신 이야기 없이 보내는 날을 정해 둔다", valueLabel: "임신 없는 날" },
      { id: "p100-s08-03-c", label: "같은 시기 부부와 만나 감정을 나눈다", valueLabel: "또래와 나누기" },
      { id: "p100-s08-03-d", label: "그런 압박은 없으니 따로 정하지 않는다", valueLabel: "압박 없음" }
    ]
  },
  {
    id: "p100-s08-04",
    sectionId: "s08",
    title: "임신 전과 같은 데이트와 친밀감을 얼마나 유지할까요?",
    example: "모든 대화가 아기 이야기로만 채워집니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s08-04-a", label: "주 1회 아기 이야기 없는 데이트를 지킨다", valueLabel: "주간 데이트" },
      { id: "p100-s08-04-b", label: "출산 전 여행이나 큰 이벤트 하나를 잡는다", valueLabel: "큰 이벤트 하나" },
      { id: "p100-s08-04-c", label: "몸 상태에 맞춰 집에서 보내는 시간으로 바꾼다", valueLabel: "집에서 함께" },
      { id: "p100-s08-04-d", label: "지금은 아기에 집중하고 데이트는 출산 뒤에 한다", valueLabel: "출산 뒤로" }
    ]
  },
  {
    id: "p100-s08-05",
    sectionId: "s08",
    title: "몸의 변화로 자신감이 떨어질 때 파트너에게 어떤 지지를 원하나요?",
    example: "칭찬이 부담스럽고 침묵도 서운합니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s08-05-a", label: "예쁘다고 자주 말해 준다", valueLabel: "말로 표현" },
      { id: "p100-s08-05-b", label: "몸 이야기는 하지 않고 평소처럼 대한다", valueLabel: "평소처럼" },
      { id: "p100-s08-05-c", label: "함께 운동하거나 옷을 고르며 시간을 보낸다", valueLabel: "함께 행동" },
      { id: "p100-s08-05-d", label: "무엇이 필요한지 그때그때 묻는다", valueLabel: "물어보기" }
    ]
  },
  {
    id: "p100-s08-06",
    sectionId: "s08",
    title: "임신 준비에 무관심해 보이는 파트너에게 어떻게 문제를 제기할까요?",
    example: "한 사람만 수업과 준비물을 챙깁니다.",
    mood: "안도",
    choices: [
      { id: "p100-s08-06-a", label: "서운함을 느낀 그날 바로 말한다", valueLabel: "바로 말하기" },
      { id: "p100-s08-06-b", label: "구체적으로 맡아 줄 일을 정해 부탁한다", valueLabel: "일을 맡기기" },
      { id: "p100-s08-06-c", label: "산전 수업에 함께 가자고 하고 거기서 느끼게 한다", valueLabel: "수업에 데려가기" },
      { id: "p100-s08-06-d", label: "말하지 않고 혼자 하되 나중에 기억해 둔다", valueLabel: "말 없이 감당" }
    ]
  },
  {
    id: "p100-s08-07",
    sectionId: "s08",
    title: "친구 모임과 개인 취미를 임신 중 어느 정도 유지할까요?",
    example: "한 사람의 외출은 자유롭고 다른 사람은 제약이 큽니다.",
    mood: "웃음",
    choices: [
      { id: "p100-s08-07-a", label: "두 사람 모두 임신 전과 같이 유지한다", valueLabel: "둘 다 그대로" },
      { id: "p100-s08-07-b", label: "파트너도 임산부와 같은 정도로 줄인다", valueLabel: "파트너도 줄임" },
      { id: "p100-s08-07-c", label: "파트너 외출 날에는 임산부 휴식 시간을 보장한다", valueLabel: "교대로 시간" },
      { id: "p100-s08-07-d", label: "임신 기간에는 둘 다 모임을 줄인다", valueLabel: "둘 다 줄임" }
    ]
  },
  {
    id: "p100-s08-08",
    sectionId: "s08",
    title: "임신과 출산에 대한 공포가 다를 때 어떤 대화를 먼저 할까요?",
    example: "한 사람은 정보를 원하고 다른 사람은 피하고 싶어 합니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s08-08-a", label: "무엇이 가장 무서운지 각자 하나씩 말한다", valueLabel: "두려움 하나씩" },
      { id: "p100-s08-08-b", label: "정보를 원하는 사람만 찾아보고 상대에게 말하지 않는다", valueLabel: "각자 방식대로" },
      { id: "p100-s08-08-c", label: "산전 교육에서 함께 듣는다", valueLabel: "교육으로 함께" },
      { id: "p100-s08-08-d", label: "의료진에게 함께 물어 사실만 확인한다", valueLabel: "사실 확인" }
    ]
  },
  {
    id: "p100-s08-09",
    sectionId: "s08",
    title: "유산·사산 경험이 있다면 이번 임신의 불안을 어떻게 함께 감당할까요?",
    example: "검사 전마다 한 사람이 일상생활을 하기 어렵습니다.",
    mood: "조심스러움",
    choices: [
      { id: "p100-s08-09-a", label: "검사 전날은 파트너가 곁에 있는 것으로 정한다", valueLabel: "곁에 있기" },
      { id: "p100-s08-09-b", label: "정기 진료 사이에 추가 진료를 받아 확인한다", valueLabel: "추가 진료" },
      { id: "p100-s08-09-c", label: "상담사와 함께 불안을 다룬다", valueLabel: "상담" },
      { id: "p100-s08-09-d", label: "안정기까지는 임신 이야기를 최소로 한다", valueLabel: "말 줄이기" }
    ]
  },
  {
    id: "p100-s08-10",
    sectionId: "s08",
    title: "두 사람의 갈등이 커질 때 임신을 이유로 대화를 미룰 수 있을까요?",
    example: "스트레스가 걱정되어 중요한 문제를 계속 덮습니다.",
    mood: "여운",
    choices: [
      { id: "p100-s08-10-a", label: "임신 중이어도 미루지 않고 그날 이야기한다", valueLabel: "미루지 않음" },
      { id: "p100-s08-10-b", label: "날짜를 정해 미루고 그날은 꼭 이야기한다", valueLabel: "날짜 정해 미룸" },
      { id: "p100-s08-10-c", label: "출산 후로 미루고 지금은 덮는다", valueLabel: "출산 뒤로" },
      { id: "p100-s08-10-d", label: "상담사와 함께 이야기한다", valueLabel: "상담사와" }
    ]
  },
  {
    id: "p100-s09-01",
    sectionId: "s09",
    title: "출산 방식에 관한 최종 결정권은 누구에게 있어야 할까요?",
    example: "당사자 희망, 파트너 의견, 의료진 권고가 다릅니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s09-01-a", label: "출산하는 사람", valueLabel: "출산하는 사람" },
      { id: "p100-s09-01-b", label: "의료진 권고", valueLabel: "의료진" },
      { id: "p100-s09-01-c", label: "두 사람이 합의할 때까지 이야기한다", valueLabel: "합의" },
      { id: "p100-s09-01-d", label: "안전에 관한 것은 의료진, 나머지는 출산하는 사람", valueLabel: "영역별로" }
    ]
  },
  {
    id: "p100-s09-02",
    sectionId: "s09",
    title: "출산 중 함께 있을 사람의 범위를 어떻게 정할까요?",
    example: "친정엄마와 시어머니가 모두 참여를 원합니다.",
    mood: "호기심",
    choices: [
      { id: "p100-s09-02-a", label: "파트너 한 사람만", valueLabel: "파트너만" },
      { id: "p100-s09-02-b", label: "파트너와 출산하는 사람의 어머니", valueLabel: "파트너와 친정" },
      { id: "p100-s09-02-c", label: "출산하는 사람이 원하는 사람 누구든", valueLabel: "본인이 정함" },
      { id: "p100-s09-02-d", label: "아무도 들어오지 않고 의료진만", valueLabel: "의료진만" }
    ]
  },
  {
    id: "p100-s09-03",
    sectionId: "s09",
    title: "산후조리원 이용 여부와 등급은 어떤 기준으로 결정할까요?",
    example: "회복 욕구와 높은 비용이 충돌합니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "p100-s09-03-a", label: "예산 안에서 가장 가까운 곳", valueLabel: "예산과 거리" },
      { id: "p100-s09-03-b", label: "비용이 들어도 회복에 가장 좋은 곳", valueLabel: "회복 최우선" },
      { id: "p100-s09-03-c", label: "조리원 대신 집에서 도우미와 회복한다", valueLabel: "집에서 회복" },
      { id: "p100-s09-03-d", label: "조리원 대신 친정이나 시댁에서 회복한다", valueLabel: "가족 집에서" }
    ]
  },
  {
    id: "p100-s09-04",
    sectionId: "s09",
    title: "모유수유와 분유 계획을 임신 중 어디까지 정할까요?",
    example: "가족은 완모를 당연하게 기대하지만 당사자는 부담스럽습니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s09-04-a", label: "완모를 목표로 준비한다", valueLabel: "완모 목표" },
      { id: "p100-s09-04-b", label: "처음부터 혼합수유로 정한다", valueLabel: "혼합수유" },
      { id: "p100-s09-04-c", label: "처음부터 분유로 정한다", valueLabel: "분유" },
      { id: "p100-s09-04-d", label: "정하지 않고 출산 후 몸 상태에 따라 한다", valueLabel: "출산 뒤 결정" }
    ]
  },
  {
    id: "p100-s09-05",
    sectionId: "s09",
    title: "출산 직후 면회는 언제부터 누구에게 허용할까요?",
    example: "가족은 당일 방문을 원하고 산모는 쉬고 싶습니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s09-05-a", label: "출산 당일부터 양가 부모만", valueLabel: "당일 부모만" },
      { id: "p100-s09-05-b", label: "퇴원 후 집에서부터", valueLabel: "퇴원 뒤부터" },
      { id: "p100-s09-05-c", label: "조리원 퇴소 후부터", valueLabel: "조리원 뒤부터" },
      { id: "p100-s09-05-d", label: "출산하는 사람이 그때 컨디션을 보고 정한다", valueLabel: "산모가 그때 결정" }
    ]
  },
  {
    id: "p100-s09-06",
    sectionId: "s09",
    title: "산후도우미와 가족 도움 중 무엇을 우선할까요?",
    example: "비용 부담과 사생활 스트레스가 서로 다릅니다.",
    mood: "안도",
    choices: [
      { id: "p100-s09-06-a", label: "비용을 들여 산후도우미를 쓴다", valueLabel: "도우미" },
      { id: "p100-s09-06-b", label: "가족 도움을 받는다", valueLabel: "가족" },
      { id: "p100-s09-06-c", label: "낮에는 도우미, 저녁에는 가족", valueLabel: "나눠서" },
      { id: "p100-s09-06-d", label: "도움 없이 두 사람이 한다", valueLabel: "둘이서" }
    ]
  },
  {
    id: "p100-s09-07",
    sectionId: "s09",
    title: "파트너의 출산휴가 기간을 어떻게 배치할까요?",
    example: "입원 중 쓸지 퇴원 후에 집중할지 선택해야 합니다.",
    mood: "웃음",
    choices: [
      { id: "p100-s09-07-a", label: "출산일부터 이어서 쓴다", valueLabel: "출산일부터" },
      { id: "p100-s09-07-b", label: "퇴원하거나 조리원에서 나온 날부터 쓴다", valueLabel: "집에 온 날부터" },
      { id: "p100-s09-07-c", label: "출산 때 며칠, 나머지는 집에 온 뒤로 나눠 쓴다", valueLabel: "나눠서" },
      { id: "p100-s09-07-d", label: "휴가 없이 연차로 필요한 날만 쓴다", valueLabel: "연차로만" }
    ]
  },
  {
    id: "p100-s09-08",
    sectionId: "s09",
    title: "출산 가방과 비상연락망 준비는 누가 소유할까요?",
    example: "예정일이 다가오는데 한 사람만 내용을 알고 있습니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s09-08-a", label: "파트너가 준비하고 임산부가 확인한다", valueLabel: "파트너 준비" },
      { id: "p100-s09-08-b", label: "임산부가 준비하고 파트너에게 위치와 내용을 알려 준다", valueLabel: "임산부 준비" },
      { id: "p100-s09-08-c", label: "함께 앉아 하루 잡고 같이 싼다", valueLabel: "함께 준비" },
      { id: "p100-s09-08-d", label: "가방은 임산부, 연락망은 파트너가 맡는다", valueLabel: "나눠 준비" }
    ]
  },
  {
    id: "p100-s09-09",
    sectionId: "s09",
    title: "출산 후 반려동물·집안일·첫째 돌봄은 누가 맡을까요?",
    example: "퇴원 직후 평소 역할을 수행하기 어렵습니다.",
    mood: "희망",
    choices: [
      { id: "p100-s09-09-a", label: "파트너가 전부 맡는다", valueLabel: "파트너 전담" },
      { id: "p100-s09-09-b", label: "가족에게 몇 주간 맡긴다", valueLabel: "가족에게" },
      { id: "p100-s09-09-c", label: "도우미나 돌봄 서비스를 쓴다", valueLabel: "서비스 이용" },
      { id: "p100-s09-09-d", label: "산모는 아기만, 나머지는 파트너와 가족이 나눈다", valueLabel: "산모는 아기만" }
    ]
  },
  {
    id: "p100-s09-10",
    sectionId: "s09",
    title: "원하는 출산 계획이 바뀌었을 때 실패로 느끼지 않도록 어떤 말을 합의할까요?",
    example: "응급 상황으로 계획과 다른 선택이 필요해집니다.",
    mood: "여운",
    choices: [
      { id: "p100-s09-10-a", label: "\"네가 잘못한 것은 없다\"고 먼저 말하기로 한다", valueLabel: "잘못 아님" },
      { id: "p100-s09-10-b", label: "계획이 바뀌어도 아이가 건강하면 성공이라고 정한다", valueLabel: "건강하면 성공" },
      { id: "p100-s09-10-c", label: "실패라는 말 자체를 쓰지 않기로 한다", valueLabel: "실패라는 말 금지" },
      { id: "p100-s09-10-d", label: "그때 느낀 감정을 그대로 말하고 듣기로 한다", valueLabel: "감정 그대로" }
    ]
  },
  {
    id: "p100-s10-01",
    sectionId: "s10",
    title: "고위험 임신으로 장기 안정이 필요하면 생활을 어떻게 재편할까요?",
    example: "집안일·수입·돌봄이 갑자기 중단됩니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s10-01-a", label: "파트너가 휴직하고 집을 맡는다", valueLabel: "파트너 휴직" },
      { id: "p100-s10-01-b", label: "가족이 들어와 함께 지낸다", valueLabel: "가족 입주" },
      { id: "p100-s10-01-c", label: "도우미와 배달로 해결하고 파트너는 일한다", valueLabel: "서비스로 대체" },
      { id: "p100-s10-01-d", label: "친정이나 시댁에 임산부가 가서 지낸다", valueLabel: "가족 집으로" }
    ]
  },
  {
    id: "p100-s10-02",
    sectionId: "s10",
    title: "예정일보다 일찍 입원하면 누가 무엇을 먼저 처리할까요?",
    example: "업무, 반려동물, 가족 연락, 준비물이 동시에 남습니다.",
    mood: "침착함",
    choices: [
      { id: "p100-s10-02-a", label: "파트너가 병원에 남고 나머지는 가족에게 맡긴다", valueLabel: "파트너는 병원에" },
      { id: "p100-s10-02-b", label: "파트너가 집과 준비물을 처리하고 가족이 병원에 있는다", valueLabel: "파트너는 집으로" },
      { id: "p100-s10-02-c", label: "미리 순서 목록을 만들어 두고 그대로 한다", valueLabel: "목록대로" },
      { id: "p100-s10-02-d", label: "그날 상황에 따라 그때 정한다", valueLabel: "그때 정함" }
    ]
  },
  {
    id: "p100-s10-03",
    sectionId: "s10",
    title: "두 사람이 의료진 설명을 다르게 이해했을 때 어떻게 확인할까요?",
    example: "한 사람은 안심하고 다른 사람은 위험하다고 느낍니다.",
    mood: "유쾌한 차이",
    choices: [
      { id: "p100-s10-03-a", label: "다음 진료를 기다리지 않고 바로 병원에 전화한다", valueLabel: "바로 전화" },
      { id: "p100-s10-03-b", label: "다음 진료 때 함께 다시 묻는다", valueLabel: "다음 진료에" },
      { id: "p100-s10-03-c", label: "더 걱정하는 쪽의 이해를 기준으로 행동한다", valueLabel: "걱정하는 쪽 기준" },
      { id: "p100-s10-03-d", label: "진료를 녹음해 두고 다시 듣는다", valueLabel: "녹음 확인" }
    ]
  },
  {
    id: "p100-s10-04",
    sectionId: "s10",
    title: "임신 중 큰 지출이나 이사 같은 결정을 계속 진행할까요?",
    example: "이미 계약 준비 중인데 건강 변수가 생깁니다.",
    mood: "현실감",
    choices: [
      { id: "p100-s10-04-a", label: "예정대로 진행한다", valueLabel: "진행" },
      { id: "p100-s10-04-b", label: "출산 후로 미룬다", valueLabel: "연기" },
      { id: "p100-s10-04-c", label: "규모를 줄여 진행한다", valueLabel: "축소 진행" },
      { id: "p100-s10-04-d", label: "의료진에게 물어 안전하면 진행한다", valueLabel: "의료진 확인 뒤" }
    ]
  },
  {
    id: "p100-s10-05",
    sectionId: "s10",
    title: "파트너가 중요한 진료나 출산에 함께하지 못하면 대체 지원자는 누구인가요?",
    example: "출장·질병·돌봄 때문에 부재할 수 있습니다.",
    mood: "걱정",
    choices: [
      { id: "p100-s10-05-a", label: "임신한 사람의 어머니", valueLabel: "친정 어머니" },
      { id: "p100-s10-05-b", label: "파트너의 부모", valueLabel: "파트너 부모" },
      { id: "p100-s10-05-c", label: "가까운 친구나 형제", valueLabel: "친구·형제" },
      { id: "p100-s10-05-d", label: "대체 없이 혼자 가고 파트너와 영상으로 연결한다", valueLabel: "혼자 가고 영상" }
    ]
  },
  {
    id: "p100-s10-06",
    sectionId: "s10",
    title: "가족이 우리의 결정을 존중하지 않을 때 지원을 거절할 수 있을까요?",
    example: "경제적 도움과 통제 요구가 함께 옵니다.",
    mood: "단호함",
    choices: [
      { id: "p100-s10-06-a", label: "통제가 따라오면 지원을 바로 거절한다", valueLabel: "바로 거절" },
      { id: "p100-s10-06-b", label: "한 번 경고하고 반복되면 거절한다", valueLabel: "경고 뒤 거절" },
      { id: "p100-s10-06-c", label: "지원은 받고 요구는 듣지 않는다", valueLabel: "받고 무시" },
      { id: "p100-s10-06-d", label: "지원이 필요하니 요구도 어느 정도 받아들인다", valueLabel: "일부 수용" }
    ]
  },
  {
    id: "p100-s10-07",
    sectionId: "s10",
    title: "임신 중 관계가 심각하게 악화되면 누구에게 도움을 요청할까요?",
    example: "반복되는 모욕·위협·통제로 안전이 걱정됩니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s10-07-a", label: "여성긴급전화 1366 같은 전문기관", valueLabel: "전문기관" },
      { id: "p100-s10-07-b", label: "양가 부모", valueLabel: "부모" },
      { id: "p100-s10-07-c", label: "가까운 친구", valueLabel: "친구" },
      { id: "p100-s10-07-d", label: "부부 상담사", valueLabel: "부부 상담" }
    ]
  },
  {
    id: "p100-s10-08",
    sectionId: "s10",
    title: "상실이나 중대한 진단을 겪을 때 공개와 애도 방식은 어떻게 정할까요?",
    example: "한 사람은 말하고 싶고 다른 사람은 숨고 싶습니다.",
    mood: "진지함",
    choices: [
      { id: "p100-s10-08-a", label: "말하고 싶은 사람이 자기 가족과 친구에게만 알린다", valueLabel: "각자 범위" },
      { id: "p100-s10-08-b", label: "두 사람이 합의한 사람에게만 함께 알린다", valueLabel: "합의한 범위" },
      { id: "p100-s10-08-c", label: "상담사와 함께 방식을 정한다", valueLabel: "상담사와" },
      { id: "p100-s10-08-d", label: "누구에게도 알리지 않고 둘이서 애도한다", valueLabel: "둘이서만" }
    ]
  },
  {
    id: "p100-s10-09",
    sectionId: "s10",
    title: "의견이 끝내 합의되지 않는 의료 선택에서 적용할 마지막 원칙은 무엇인가요?",
    example: "시간은 촉박하고 두 사람의 위험 인식이 다릅니다.",
    mood: "희망",
    choices: [
      { id: "p100-s10-09-a", label: "임신한 사람의 결정을 따른다", valueLabel: "임산부 결정" },
      { id: "p100-s10-09-b", label: "의료진 권고를 따른다", valueLabel: "의료진 권고" },
      { id: "p100-s10-09-c", label: "두 선택 중 더 안전한 쪽을 택한다", valueLabel: "더 안전한 쪽" },
      { id: "p100-s10-09-d", label: "다른 병원에서 한 번 더 의견을 듣는다", valueLabel: "2차 소견" }
    ]
  },
  {
    id: "p100-s10-10",
    sectionId: "s10",
    title: "임신 기간 동안 반드시 지키고 싶은 두 사람의 한 가지 약속은 무엇인가요?",
    example: "수많은 계획 중 관계를 지킬 최소 원칙을 정해야 합니다.",
    mood: "여운",
    choices: [
      { id: "p100-s10-10-a", label: "어떤 결정도 한 사람이 혼자 내리지 않는다", valueLabel: "혼자 정하지 않기" },
      { id: "p100-s10-10-b", label: "힘든 것을 숨기지 않는다", valueLabel: "숨기지 않기" },
      { id: "p100-s10-10-c", label: "서로에게 상처 주는 말을 하지 않는다", valueLabel: "상처 주지 않기" },
      { id: "p100-s10-10-d", label: "매일 잠들기 전 하루를 이야기한다", valueLabel: "매일 대화" }
    ]
  }
  ]
});

export const pregnancy100Questions = pregnancy100Pack.orderedQuestions;
