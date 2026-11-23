/**
 * 카테고리 단일 소스. 내비게이션·라우트·에디터·sitemap이 모두 이 목록을 쓴다.
 */
export const CATEGORIES = [
  {
    id: "seo",
    label: "SEO",
    name: "검색엔진 최적화",
    description:
      "크롤링과 색인, 검색 의도, 콘텐츠 구조까지 검색엔진이 페이지를 이해하는 방식을 다룹니다.",
    topics: ["크롤링·색인", "검색 의도", "온페이지", "구조화 데이터"],
  },
  {
    id: "geo",
    label: "GEO",
    name: "생성형 엔진 최적화",
    description:
      "생성형 AI 검색이 내 글을 근거로 인용하게 만드는 조건과 AI 크롤러 대응을 정리합니다.",
    topics: ["AI 인용", "AI 크롤러", "출처·근거", "엔티티"],
  },
  {
    id: "aeo",
    label: "AEO",
    name: "답변 엔진 최적화",
    description:
      "질문에 바로 답하는 글 구조와, 추천 스니펫·음성·AI 답변에 선택되는 문단 작성법을 다룹니다.",
    topics: ["직접 답변", "추천 스니펫", "FAQ", "질문형 제목"],
  },
  {
    id: "ux-ui",
    label: "UX·UI",
    name: "사용자 경험·인터페이스",
    description:
      "읽기 쉬운 화면, 빠른 반응, 명확한 정보 구조처럼 검색 이후의 경험을 설계하는 방법을 기록합니다.",
    topics: ["Core Web Vitals", "타이포그래피", "정보 구조", "접근성"],
  },
  {
    id: "dev",
    label: "DEV",
    name: "개발·AI 엔지니어링",
    description:
      "AI 에이전트와 함께 코드를 쓰는 방법, 코드 품질을 지키는 장치, 소프트웨어 엔지니어링 학습 자료를 정리합니다.",
    topics: ["AI 에이전트", "코드 품질", "아키텍처", "학습 로드맵"],
  },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryId = Category["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [
  CategoryId,
  ...CategoryId[],
];

export function isCategoryId(value: unknown): value is CategoryId {
  return (
    typeof value === "string" && (CATEGORY_IDS as string[]).includes(value)
  );
}

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
