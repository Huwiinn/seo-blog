import { SITE } from "../../constant/site";
import { firstParagraph, truncateText } from "../content/text";
import type { PostContent } from "../content/types";

export interface PostMetaSource {
  title: string;
  slug: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  content: PostContent;
}

export interface ResolvedPostMeta {
  /** 사이트명을 붙이기 전 제목 (메타 제목이 비어 있으면 H1) */
  title: string;
  /** 실제 <title>에 들어가는 문자열 */
  fullTitle: string;
  /** 메타 설명 → 핵심 요약 → 도입부 첫 문단 순으로 대체 */
  description: string;
  descriptionSource: "meta" | "summary" | "intro" | "none";
  path: string;
  url: string;
}

/**
 * 글의 검색 노출 값을 한 곳에서 계산한다.
 * generateMetadata, 에디터의 검색 결과 미리보기, SEO 점검이 모두 이 함수를 쓰므로
 * 미리보기와 실제 출력이 어긋나지 않는다.
 */
export function resolvePostMeta(source: PostMetaSource): ResolvedPostMeta {
  const title = source.metaTitle.trim() || source.title.trim();
  const fullTitle = title ? `${title} | ${SITE.name}` : SITE.name;

  let description = source.metaDescription.trim();
  let descriptionSource: ResolvedPostMeta["descriptionSource"] = "meta";
  if (!description) {
    description = source.summary.trim();
    descriptionSource = "summary";
  }
  if (!description) {
    description = truncateText(firstParagraph(source.content.intro), 150);
    descriptionSource = description ? "intro" : "none";
  }

  const path = source.slug ? `/posts/${source.slug}` : "/posts";
  return {
    title,
    fullTitle,
    description,
    descriptionSource,
    path,
    url: `${SITE.url}${path}`,
  };
}
