/**
 * 본문 링크·이미지 URL 허용 규칙. 에디터(Link 확장)·저장 검증·렌더러가 같은 함수를 쓴다.
 */
const SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;
const LINK_SCHEMES = new Set(["http", "https", "mailto"]);

/** 브라우저가 URL을 해석할 때 무시하는 제어·공백 문자 (java<TAB>script: 같은 우회 방지) */
function isInvisible(code: number): boolean {
  return (
    code <= 0x20 ||
    code === 0xa0 ||
    code === 0x1680 ||
    code === 0x180e ||
    (code >= 0x2000 && code <= 0x2029) ||
    code === 0x205f ||
    code === 0x3000
  );
}

function clean(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let value = "";
  for (const char of raw) {
    if (!isInvisible(char.codePointAt(0) ?? 0)) value += char;
  }
  return value.length > 0 ? value : null;
}

/** http·https·mailto와 상대 경로(/, #, ./)만 허용한다. javascript:, data: 등은 거부. */
export function isSafeHref(raw: unknown): boolean {
  const value = clean(raw);
  if (!value) return false;
  const scheme = SCHEME.exec(value);
  if (!scheme) return true;
  return LINK_SCHEMES.has(scheme[1].toLowerCase());
}

/** 이미지는 사이트 내부 경로(/uploads/…)와 http(s) URL만 허용한다. */
export function isSafeImageSrc(raw: unknown): boolean {
  const value = clean(raw);
  if (!value) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  return /^https?:\/\//i.test(value);
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).host.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

export type LinkKind = "internal" | "external" | "other";

/** 내부 링크(상대 경로·같은 도메인) / 외부 링크 / 그 외(mailto 등) 분류 */
export function classifyHref(href: string, siteUrl: string): LinkKind {
  const value = clean(href);
  if (!value) return "other";
  if (/^(https?:)?\/\//i.test(value)) {
    const target = hostOf(value.startsWith("//") ? `https:${value}` : value);
    if (!target) return "other";
    return target === hostOf(siteUrl) ? "internal" : "external";
  }
  if (SCHEME.test(value)) return "other";
  return "internal";
}
