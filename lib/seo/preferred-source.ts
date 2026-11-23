import { SITE } from "@/constant/site";

/**
 * Google 검색 "선호하는 매체" 딥링크.
 * https://developers.google.com/search/docs/appearance/preferred-sources
 *
 * q에는 도메인만 넣는다(스킴·경로 없이). 구글 예시가 `q=example.com` 형태이고,
 * 하위 디렉터리는 대상이 아니므로 사이트 URL에서 호스트만 뽑는다.
 */
export function preferredSourceDomain(siteUrl: string = SITE.url): string {
  return new URL(siteUrl).hostname.replace(/^www\./, "");
}

export function preferredSourceUrl(siteUrl: string = SITE.url): string {
  const q = encodeURIComponent(preferredSourceDomain(siteUrl));
  return `https://www.google.com/preferences/source?q=${q}`;
}
