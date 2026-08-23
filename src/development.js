export const developmentStages = [
  { id: "foundation", title: "저장소·품질 기반", detail: "공유 AI 문맥, 테스트·린트·정적 빌드와 GitHub Actions", status: "complete" },
  { id: "single-role", title: "질문 응답 기본 흐름", detail: "한 질문씩 응답, 비공개 메모, 자동 저장과 새로고침 복구", status: "complete" },
  { id: "two-role", title: "두 역할 대화 시뮬레이터", detail: "독립 제출, 동시 공개, 합의 제안·승인과 다시 이야기하기", status: "complete" },
  { id: "content-model", title: "Marriage Pack 콘텐츠 모델", detail: "버전 고정 콘텐츠와 6개 영역·12개 무료 질문", status: "complete" },
  { id: "shared-results", title: "공동 결과 화면", detail: "비공개 메모를 제외한 선택·합의·재논의 결과 요약", status: "complete" },
  { id: "accounts", title: "실제 계정 분리", detail: "이메일 매직 링크 로그인, 단일 세션, 강제 로그아웃", status: "complete" },
  { id: "invite", title: "초대·참여 흐름", detail: "이메일 고정 초대, 7일 만료·재발급, 수락 후 팩 개방", status: "complete" },
  { id: "server", title: "서버 저장·기기 간 복구", detail: "서버 데이터 모델, 동시성 제어와 여러 기기 진행 복구", status: "complete" },
  { id: "payment", title: "29,000원 결제 권한", detail: "검증된 웹훅을 통한 Pack 구매·권한 부여", status: "next" },
  { id: "launch", title: "운영 준비·출시", detail: "보안·접근성·브라우저 검증, 관측과 배포 운영", status: "planned" }
];

export const developmentHistory = [
  { date: "2026-08-16", title: "프로젝트 저장소와 AI 개발 규칙 초기화", detail: "stable 중심 저장소와 Claude Code·Codex 공유 개발 문맥을 구성했습니다." },
  { date: "2026-08-16", title: "자동 품질 검사 기반 구축", detail: "Node 테스트, 린트, 정적 빌드와 GitHub Actions 검증 흐름을 추가했습니다." },
  { date: "2026-08-16", title: "첫 실행 가능한 질문 경험 완성", detail: "질문 선택, 비공개 메모, 로컬 자동 저장과 이어하기를 구현했습니다." },
  { date: "2026-08-16", title: "두 사람의 공개·합의 흐름 완성", detail: "역할별 독립 제출 후 공개하고, 합의안을 상대가 승인하도록 구현했습니다." },
  { date: "2026-08-16", title: "Marriage Pack 12문항 확장", detail: "버전이 고정된 콘텐츠 모델과 생활·재정·가족·갈등·연결·미래 질문을 구성했습니다." },
  { date: "2026-08-16", title: "프라이버시 안전 공동 결과 추가", detail: "비공개 메모 없이 두 사람의 선택과 공유 합의만 결과 화면에 표시합니다." },
  { date: "2026-08-23", title: "이메일 매직 링크 계정 기반", detail: "비밀번호 없는 10분 로그인 링크, 단일 세션, 로그인 후 초대 대기 홈을 추가했습니다." },
  { date: "2026-08-23", title: "커플 워크스페이스와 초대 수락", detail: "구매자 워크스페이스, 이메일 고정 초대, 수락 후에만 결혼 팩을 열도록 했습니다." },
  { date: "2026-08-23", title: "기기 넘김과 답변 서버 저장", detail: "강제 로그아웃 후 같은 기기에서 파트너가 로그인하고, 제출·합의와 초안·메모를 서버에 저장합니다." },
  { date: "2026-08-23", title: "공개 잠금 스냅샷", detail: "두 번째 제출이 불변 PublicLock을 만들고, 이후 변경은 새 비공개 라운드를 엽니다." },
  { date: "2026-08-23", title: "웹 초대 이탈 복구와 공유", detail: "구매자 홈에서 초대 링크를 복사·공유하고, 이메일 오타 재발송과 다른 계정 로그인 수락을 막습니다." }
];

export function developmentSummary(stages = developmentStages) {
  return {
    complete: stages.filter((stage) => stage.status === "complete").length,
    total: stages.length,
    next: stages.find((stage) => stage.status === "next") || null
  };
}
