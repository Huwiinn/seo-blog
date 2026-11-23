/**
 * 사이트 전역 정보. 브랜드명·도메인·작성자는 여기 한 곳만 고치면 된다.
 */
export const SITE = {
  name: "SEO Lab Notes",
  url: "https://www.seo-blog.site",
  /** 홈 <title> */
  title: "SEO Lab Notes — SEO·GEO·AEO·UX/UI 블로그",
  tagline: "검색과 AI 답변, 그리고 사용자 경험을 기록합니다.",
  description:
    "SEO, GEO, AEO, UX/UI를 실무 관점에서 정리하는 개인 블로그입니다. 검색엔진과 AI 답변 엔진이 이해하기 쉬운 콘텐츠 구조와, 검색 이후의 사용자 경험을 다룹니다.",
  lang: "ko",
  locale: "ko_KR",
  /** JSON-LD author. 개인 이름을 쓰려면 type을 "Person"으로 바꾼다. */
  author: {
    type: "Organization" as "Organization" | "Person",
    name: "SEO Lab Notes",
    url: "https://www.seo-blog.site",
  },
  /** 대표 이미지가 없는 페이지의 기본 OG 이미지 */
  ogImage: {
    path: "/images/ogImages/SNS_og_image.webp",
    width: 1424,
    height: 752,
  },
} as const;

/** 경로를 절대 URL로 바꾼다. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
