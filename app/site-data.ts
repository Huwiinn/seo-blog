export type NavItem = {
  title: string;
  href: string;
  description: string;
};

export type Post = {
  title: string;
  href: string;
  category: string;
  summary: string;
  date: string;
  tags: string[];
  featured?: boolean;
};

export type CategoryPage = {
  title: string;
  description: string;
  focus: string[];
  checklistTitle: string;
  checklist: string[];
};

export const navItems: NavItem[] = [
  {
    title: "테크니컬 SEO",
    href: "/technical-seo",
    description: "크롤링, 인덱싱, 사이트 구조와 성능 최적화",
  },
  {
    title: "콘텐츠 SEO",
    href: "/content-seo",
    description: "검색 의도, 키워드 전략, 콘텐츠 구조 설계",
  },
  {
    title: "마케팅 용어",
    href: "/marketing-terms",
    description: "실무에서 자주 쓰는 마케팅 개념과 용어 정리",
  },
  {
    title: "GA",
    href: "/ga",
    description: "GA4 설정, 이벤트, 리포트 해석과 분석 메모",
  },
  {
    title: "개인 학습",
    href: "/learning-log",
    description: "실험, 회고, 개인 리서치와 학습 기록",
  },
];

export const posts: Post[] = [
  {
    title: "robots.txt와 sitemap.xml을 같이 설계해야 하는 이유",
    href: "/technical-seo",
    category: "테크니컬 SEO",
    summary: "크롤러 제어와 인덱싱 신호를 분리해서 관리하는 기본 원칙을 정리합니다.",
    date: "2026.03.03",
    tags: ["크롤링", "인덱싱", "사이트맵"],
    featured: true,
  },
  {
    title: "검색 의도 기준으로 콘텐츠 클러스터 나누기",
    href: "/content-seo",
    category: "콘텐츠 SEO",
    summary: "탐색형, 비교형, 전환형 쿼리별로 페이지 유형을 나누는 방식입니다.",
    date: "2026.03.01",
    tags: ["키워드", "검색의도", "클러스터링"],
    featured: true,
  },
  {
    title: "CTR, CVR, CAC를 같이 봐야 하는 이유",
    href: "/marketing-terms",
    category: "마케팅 용어",
    summary: "단일 지표가 아니라 퍼널 단위로 성과를 읽기 위한 핵심 개념을 묶어 설명합니다.",
    date: "2026.02.27",
    tags: ["CTR", "CVR", "CAC"],
  },
  {
    title: "GA4 이벤트 네이밍 규칙 초안",
    href: "/ga",
    category: "GA",
    summary: "이벤트 이름, 파라미터, 문서화 규칙을 실무용으로 정리한 초안입니다.",
    date: "2026.02.24",
    tags: ["GA4", "이벤트", "측정설계"],
  },
  {
    title: "검색 결과 스니펫 실험 기록",
    href: "/learning-log",
    category: "개인 학습",
    summary: "타이틀과 메타디스크립션 조합을 바꿔본 뒤 CTR 변화를 기록한 학습 메모입니다.",
    date: "2026.02.20",
    tags: ["실험", "CTR", "메타태그"],
  },
];

export const categorySections = [
  {
    href: "/technical-seo",
    title: "테크니컬 SEO",
    intro: "검색엔진이 사이트를 정확히 이해하도록 만드는 구조와 성능 최적화 기록",
    bullets: ["크롤링", "인덱싱", "구조화", "성능"],
  },
  {
    href: "/content-seo",
    title: "콘텐츠 SEO",
    intro: "검색 의도 기반의 콘텐츠 전략과 온페이지 최적화 노트",
    bullets: ["키워드", "검색 의도", "온페이지", "내부링크"],
  },
  {
    href: "/marketing-terms",
    title: "마케팅 용어",
    intro: "실무에서 반복적으로 나오는 핵심 지표와 용어를 빠르게 찾는 정리 공간",
    bullets: ["퍼널", "광고", "전환", "지표"],
  },
  {
    href: "/ga",
    title: "GA",
    intro: "GA4 설정, 측정 설계, 리포트 해석까지 연결하는 분석 메모",
    bullets: ["GA4", "이벤트", "탐색", "리포트"],
  },
  {
    href: "/learning-log",
    title: "개인 학습",
    intro: "실험 결과와 회고를 남기는 개인형 SEO 연구 노트",
    bullets: ["실험", "회고", "리서치", "학습"],
  },
];

export const categoryPages: Record<string, CategoryPage> = {
  "technical-seo": {
    title: "테크니컬 SEO",
    description:
      "검색엔진이 페이지를 수집하고 이해하는 과정에 직접 영향을 주는 구조와 기술 요소를 정리합니다.",
    focus: ["크롤링 최적화", "인덱싱 제어", "사이트 구조", "Core Web Vitals"],
    checklistTitle: "기본 체크 포인트",
    checklist: [
      "robots.txt와 sitemap.xml이 역할별로 분리되어 있는지",
      "중복 URL과 canonical 정책이 일관되게 적용되는지",
      "내부 링크 구조가 중요한 페이지를 충분히 밀어주는지",
    ],
  },
  "content-seo": {
    title: "콘텐츠 SEO",
    description:
      "검색 의도와 키워드 구조를 기반으로 페이지를 어떻게 설계하고 연결할지 정리합니다.",
    focus: ["검색 의도", "키워드 맵", "콘텐츠 허브", "온페이지 최적화"],
    checklistTitle: "작성 기준",
    checklist: [
      "키워드가 아니라 검색 의도 단위로 페이지를 구분하는지",
      "제목, 본문, FAQ가 한 쿼리군 안에서 자연스럽게 연결되는지",
      "내부 링크가 상위 주제와 하위 주제를 명확히 묶어주는지",
    ],
  },
  "marketing-terms": {
    title: "마케팅 용어",
    description:
      "퍼포먼스 마케팅과 SEO 실무에서 자주 맞닥뜨리는 용어를 빠르게 찾을 수 있게 정리합니다.",
    focus: ["퍼널 지표", "광고 용어", "전환 개념", "성과 해석"],
    checklistTitle: "정리 방식",
    checklist: [
      "용어 정의를 한 문장으로 먼저 고정하는지",
      "헷갈리는 유사 지표를 함께 비교해 두는지",
      "실무 예시를 짧게 붙여 재검색 비용을 줄이는지",
    ],
  },
  ga: {
    title: "GA",
    description:
      "GA4 기준으로 측정 설계, 이벤트 정의, 리포트 해석까지 이어지는 기록을 남깁니다.",
    focus: ["이벤트 설계", "파라미터 규칙", "탐색 리포트", "대시보드 해석"],
    checklistTitle: "분석 기준",
    checklist: [
      "이벤트명과 파라미터가 문서화되어 있는지",
      "전환 정의가 실제 비즈니스 단계와 맞는지",
      "리포트 수치 해석에 필요한 세그먼트 기준이 있는지",
    ],
  },
  "learning-log": {
    title: "개인 학습",
    description:
      "실험, 회고, 레퍼런스 정리, 실패 기록까지 포함하는 개인형 연구 노트입니다.",
    focus: ["실험 로그", "회고 메모", "리서치 정리", "가설 검증"],
    checklistTitle: "기록 원칙",
    checklist: [
      "무엇을 바꿨는지와 왜 바꿨는지가 분리되어 적혀 있는지",
      "결과가 애매해도 관찰값을 그대로 남기는지",
      "다음 실험으로 이어질 가설을 명시하는지",
    ],
  },
};
