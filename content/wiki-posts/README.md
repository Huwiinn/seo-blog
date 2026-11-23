# 위키 노트로 만든 글

`~/Documents/hwuiinn-wiki`의 노트 하나를 글 하나로 다시 쓴 원고입니다.
노트 32개 가운데 21개를 발행했고 11개는 제외했습니다.

## 가져오기

```sh
npm run posts:import -- content/wiki-posts --check     # 검사만 하고 DB에 쓰지 않음
npm run posts:import -- content/wiki-posts --publish   # 발행 상태로 가져오기
```

- 이미 가져온 글은 건너뜁니다. `--force`를 붙이면 덮어쓰는데, 에디터에서 고친 내용이 사라집니다.
- 파일 이름이 `_`로 시작하면 가져오지 않습니다.
- 글의 id는 머리말의 `source` 값으로 정해집니다. `source`는 발행되지 않습니다.

## 원고를 쓸 때 지킨 규칙

- 출처 표기 없이 핵심 내용만 씁니다. 발표·영상·채널·필자 이름, 전달 화법, 출처 링크를 넣지 않습니다.
- 남의 조사 수치나 사례의 성과 지표는 빼고 원칙과 방법만 남깁니다. 공개된 표준과 도구 사용법은 둡니다.
- estudy 연재는 사이트 자체가 주제라 사이트 이름과 링크를 남겼습니다.
- 글을 쓴 뒤 별도의 교열 단계를 거칩니다.

## 제외한 노트

- Search SEOul 2026 발표 노트 10개: 발행하지 않습니다.
- `프로덕션 멀티 에이전트 하네스와 장문 컨텍스트 아키텍처 키노트`: 출처 영상이 존재하지 않는 노트라 발행하지 않습니다.

제외한 원고는 `_held-`로 시작하는 파일로 로컬에만 남아 있고 git에는 올리지 않습니다.

## 노트와 글의 대응

| 주제 | 글 주소 | 글 제목 | 위키 노트 |
| --- | --- | --- | --- |
| dev | `/posts/ai-agent-pr-quality-at-scale` | 에이전트 PR 품질, 지시문 대신 검사로 지키는 법 | 개발/2026/한 달에 PR 1만 개, 그런데 쓰레기 코드는 없다 - Lauren Tan |
| dev | `/posts/ai-code-slop-prevention` | AI 코드 슬롭 막는 법: 코드베이스 장치와 적용 순서 | 개발/2026/AI 코드 슬롭 안 만드는 법 — SpaceX Grok Bot 팀이 PR 1만 개를 내보내고 0.5%만 되돌린 장치들 |
| dev | `/posts/ai-engineering-terms-23` | AI 엔지니어링 용어 23개: 토큰부터 LLMOps까지 | 개발/2026/AI 엔지니어가 꼭 아는 단어 23개 |
| dev | `/posts/estudy-ai-mlops-curriculum` | AI 엔지니어링 커리큘럼: estudy 노트 124개 정리 | 개발/rlaope-estudy/ai-mlops-serving-rl-curriculum |
| dev | `/posts/estudy-backend-msa-curriculum` | 백엔드 커리큘럼: estudy 노트 474개 정리 | 개발/rlaope-estudy/backend-msa-database-curriculum |
| dev | `/posts/estudy-devops-sre-curriculum` | DevOps·SRE 커리큘럼: estudy 노트 316개 정리 | 개발/rlaope-estudy/devops-sre-os-network-curriculum |
| dev | `/posts/estudy-hands-on-lab-guide` | estudy 실습 가이드: 4개 랩과 4주 진도표로 복습하기 | 개발/rlaope-estudy/hands-on-practice-guide |
| dev | `/posts/estudy-knowledge-base-overview` | estudy 지식 베이스: 913개 노트 구성과 읽는 순서 | 개발/rlaope-estudy/README |
| dev | `/posts/estudy-knowledge-graph-ui` | 지식 그래프 UI: estudy 932개 노드 화면 구성 | 개발/rlaope-estudy/web-graph-architecture-and-ui-spec |
| dev | `/posts/multi-agent-dev-speed` | 멀티 에이전트 개발 속도, API 스펙부터 정하는 이유 | 개발/2026/멀티 에이전트 개발 속도 최적화 전략 |
| ux-ui | `/posts/ai-video-camera-motion-guide` | 카메라 무빙 18종, AI 영상 프롬프트 용어 정리 | 디자인/ux-ui/ai-video-camera-motion-guide |
| ux-ui | `/posts/ai-video-camera-terms-2` | 영상 AI 카메라 무빙 용어 2탄, 휩 팬부터 패스 스루까지 | 개발/2026/카메라 용어 2탄 9개 |
| ux-ui | `/posts/ai-video-camera-terms` | 영상 AI 카메라 용어 9개, 달리 인부터 핸드헬드까지 | 개발/2026/영상 AI 카메라 용어 9개 |
| ux-ui | `/posts/button-motion-terms` | 버튼 모션 용어 9개, 이름만 말해도 통하는 버튼 인터랙션 | 개발/2026/버튼 모션 용어 9개 |
| ux-ui | `/posts/chart-motion-terms` | 차트 모션 용어 9개, AI에게 그래프 움직임 요청하는 법 | 개발/2026/차트 모션 용어 9개 |
| ux-ui | `/posts/checkout-motion-names` | 결제 화면 모션 이름 9개, 로드 버튼부터 요금제 표까지 | 개발/2026/길게 설명하지 마세요, 결제 화면 모션 이름 9개 |
| ux-ui | `/posts/menu-motion-names` | 메뉴 모션 이름 9개, 탭·드롭다운·사이드바 구분법 | 개발/2026/길게 설명하지 마세요, 메뉴 모션 이름 9개 |
| ux-ui | `/posts/text-motion-terms` | 텍스트 모션 용어 9개, 제목과 메뉴 글자 효과 이름 정리 | 개발/2026/텍스트 모션 용어 9개 |
| ux-ui | `/posts/ui-motion-dictionary` | UI 모션 용어 54종 사전, 메뉴부터 차트까지 이름 정리 | 디자인/ux-ui/vibe-coding-ui-motion-dictionary |
| ux-ui | `/posts/ui-motion-guide-index` | UI 모션 가이드, AI에는 설명 대신 이름으로 요청하기 | 디자인/ux-ui/README |
| ux-ui | `/posts/ui-style-prompts` | UI 스타일 10가지와 AI 디자인 프롬프트 작성법 | 개발/2026/웹앱 스킬UP!! UI 스타일을 정확히 지정하는 법 — 글래스모피즘·브루탈리즘·Y2K 10가지 정리 |
