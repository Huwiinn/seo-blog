/**
 * SEO 점검 임계값. 숫자를 바꾸려면 이 파일만 고치면 된다.
 */
export const SEO_RULES = {
  serp: {
    /** 검색 결과 제목: 20px 기준 약 580px에서 잘린다 (한글 약 30자) */
    titleFontPx: 20,
    titleMaxPx: 580,
    titleMinPx: 200,
    /** 검색 결과 설명: 14px 기준 약 920px(데스크톱 두 줄)에서 잘린다 (한글 약 70자) */
    descriptionFontPx: 14,
    descriptionMaxPx: 920,
    descriptionMinPx: 300,
  },
  slug: { recommendedLength: 60 },
  content: {
    /** 공백 제외 글자 수 */
    minChars: 1500,
    longParagraphChars: 400,
  },
  summary: { minChars: 60, maxChars: 220 },
  /** 각 H2 섹션의 첫 문단: 이 길이 안에서 바로 답한다 */
  directAnswer: { maxChars: 250 },
  /** 본문 어절 수 대비 키워드 등장 비율 */
  keyword: { maxDensity: 0.05 },
  reading: { charsPerMinute: 500 },
  /** schema.org headline 권장 최대 길이 */
  headline: { maxChars: 110 },
} as const;
