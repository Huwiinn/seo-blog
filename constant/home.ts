/**
 * 홈 화면의 자주 묻는 질문. 아코디언으로 표시한다. 문구는 여기서 고친다.
 */
export const HOME_FAQ = [
  {
    question: "SEO, GEO, AEO는 어떻게 다른가요?",
    answer:
      "SEO는 검색 결과에 노출되는 것, AEO는 답변 영역에 선택되는 것, GEO는 생성형 AI의 답변에 인용되는 것을 목표로 합니다. 세 가지는 서로를 대체하지 않고 같은 글 위에 차례로 쌓입니다.",
  },
  {
    question: "어떤 글부터 읽으면 좋나요?",
    answer:
      "검색 의도를 다룬 SEO 글에서 시작해 AEO, GEO 순서로 읽으면 흐름이 이어집니다. 주제 탭을 누르면 해당 주제의 글만 모아 볼 수 있습니다.",
  },
  {
    question: "UX·UI는 왜 함께 다루나요?",
    answer:
      "검색으로 들어온 방문이 성과로 이어지려면 그다음 화면이 빠르고 읽기 쉬워야 하기 때문입니다. 로딩 속도, 가독성, 정보 구조처럼 검색 이후의 경험을 다룹니다.",
  },
] as const;

/** 홈 상단에서 번갈아 보여 주는 주제어 */
export const HOME_TOPICS = [
  { id: "seo", label: "SEO" },
  { id: "geo", label: "GEO" },
  { id: "aeo", label: "AEO" },
  { id: "ux-ui", label: "UX·UI" },
] as const;
