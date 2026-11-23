/**
 * 슬러그 규칙: 영문 소문자·숫자·하이픈만. 한글 슬러그는 정적 생성·sitemap·canonical에서
 * 퍼센트 인코딩이 어긋날 수 있고 공유 시 URL이 길어져서 쓰지 않는다.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;
export const SLUG_RECOMMENDED_LENGTH = 60;

export function isValidSlug(value: string): boolean {
  return value.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(value);
}

/** 입력 중인 값을 슬러그 형태로 다듬는다 (끝의 하이픈은 입력을 위해 남겨 둔다). */
export function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, SLUG_MAX_LENGTH);
}

/**
 * 제목·키워드에 들어 있는 영문 단어로 슬러그를 제안한다.
 * 한글만 있는 제목이면 빈 문자열을 돌려주고, 이때는 직접 입력해야 한다.
 */
export function suggestSlug(...sources: string[]): string {
  for (const source of sources) {
    const words = source.toLowerCase().match(/[a-z0-9]+/g);
    if (!words) continue;
    const candidate = words.join("-").slice(0, SLUG_RECOMMENDED_LENGTH).replace(/-+$/, "");
    if (candidate.length >= 2 && /[a-z]/.test(candidate)) return candidate;
  }
  return "";
}
