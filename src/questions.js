export const marriagePack = {
  id: "marriage-preparation", version: "2026.08-preview.1", title: "Marriage Preparation Pack", freeQuestionCount: 3,
  sections: [
    { id: "home", title: "함께 사는 집", description: "생활 공간과 역할에 대한 서로의 기대를 발견합니다." },
    { id: "money", title: "돈과 선택", description: "안정, 경험, 성장에 두는 우선순위를 이야기합니다." },
    { id: "conflict", title: "갈등과 회복", description: "갈등 뒤 필요한 거리와 연결 방식을 확인합니다." }
  ],
  questions: [
    { id: "home-01", sectionId: "home", number: 1, title: "우리에게 집은 어떤 의미에 가장 가까울까요?", intent: "함께 살 공간에 서로 다른 기대가 있는지 알아보는 질문이에요.", example: "예: 한 사람은 휴식을, 다른 사람은 사람들을 초대하는 공간을 더 중요하게 생각할 수 있어요.", whyItMatters: "같은 집에 살아도 서로 다른 활동과 분위기를 기대할 수 있습니다. 어느 방식이 더 옳은지를 정하기보다, 공간을 사용할 때 서로 배려해야 할 기대를 미리 발견하는 것이 목적입니다.", researchKeywords: ["주거 기대", "생활 경계", "공동생활"], choices: [{id:"home-rest",label:"외부의 피로를 회복하는 조용한 안식처"},{id:"home-social",label:"가족과 친구가 자연스럽게 모이는 열린 공간"},{id:"home-independent",label:"각자의 생활과 취향을 존중하는 독립적인 공간"},{id:"home-growth",label:"함께 목표를 세우고 성장해 가는 생활의 기반"}] },
    { id: "money-01", sectionId: "money", number: 2, title: "예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?", intent: "같은 여유 자금을 서로 어떻게 바라보는지 발견하는 질문이에요.", example: "예: 보너스 300만 원이 생겼다고 상상해 보세요.", whyItMatters: "돈을 쓰고 보관하는 방식에는 서로 다른 생활 경험과 기대가 반영됩니다. 선택을 평가하기보다 두 사람이 돈에서 무엇을 중요하게 여기는지 이해하는 대화가 중요합니다.", researchKeywords: ["재정 가치관", "위험 선호", "공동 의사결정"], choices: [{id:"money-save",label:"대부분 저축해 미래의 불확실성에 대비한다"},{id:"money-experience",label:"여행이나 취미처럼 함께 기억할 경험에 쓴다"},{id:"money-growth",label:"투자나 교육처럼 장기적인 성장에 사용한다"},{id:"money-split",label:"공동의 몫을 정하고 남은 금액은 각자 사용한다"}] },
    { id: "conflict-01", sectionId: "conflict", number: 3, title: "감정이 크게 상한 순간, 가장 필요한 것은 무엇인가요?", intent: "갈등 직후 서로에게 기대하는 회복 방식을 확인하는 질문이에요.", example: "예: 말다툼이 끝났지만 아직 마음이 가라앉지 않은 상황을 떠올려 보세요.", whyItMatters: "갈등 뒤 서로에게 필요한 거리와 연결 방식이 다를 수 있습니다. 차이를 애정의 크기로 해석하지 않고, 멈춤과 재대화를 위한 신호와 시간을 함께 정하는 것이 목적입니다.", researchKeywords: ["갈등 회복", "정서 조절", "재접근 신호"], choices: [{id:"conflict-space",label:"잠시 혼자 생각하고 진정할 수 있는 시간"},{id:"conflict-empathy",label:"상대가 먼저 다가와 감정을 공감해 주는 것"},{id:"conflict-talk",label:"무엇이 문제였는지 차분하게 바로 대화하는 것"},{id:"conflict-routine",label:"작은 스킨십이나 일상 행동으로 관계를 회복하는 것"}] }
  ]
};
const sectionsById = Object.fromEntries(marriagePack.sections.map(section => [section.id, section]));
export const questions = marriagePack.questions.map(question => ({ ...question, chapter: sectionsById[question.sectionId].title }));
