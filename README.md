# Claude Code + Codex Shared Development Context

이 저장소는 Claude Code와 Codex가 동일한 제품 문맥과 개발 정책을 공유하며 병렬 개발하기 위한 구조를 사용합니다.

## 핵심 구조

- `CLAUDE.md`: Claude Code 진입점
- `AGENTS.md`: Codex 진입점
- `.ai/`: 모든 Agent가 공유하는 Source of Truth
- `docs/`: 운영 및 Worktree 사용 가이드
- `.github/pull_request_template/default.md`: 공통 PR 체크리스트

## 핵심 원칙

1. 장기 문맥과 정책은 채팅이 아니라 저장소에 기록합니다.
2. `stable`을 기준 브랜치로 사용합니다.
3. 한 세션은 하나의 브랜치만 담당합니다.
4. Claude Code와 Codex가 같은 Working Tree를 동시에 수정하지 않습니다.
5. 병렬 작업은 별도 Branch + Git Worktree로 격리합니다.
6. 중요한 설계·UX 결정은 `.ai/DECISIONS.md`에 기록합니다.
7. 현재 진행 상태는 `.ai/CURRENT_STATE.md`에 기록합니다.
8. 가능하면 Claude 구현은 Codex가, Codex 구현은 Claude가 교차 리뷰합니다.
