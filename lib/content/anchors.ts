import GithubSlugger, { slug as slugify } from "github-slugger";
import type { PostContent } from "./types";

export interface OutlineItem {
  /** 섹션 id (편집 중에도 변하지 않는다) */
  id: string;
  /** URL 조각으로 쓰는 앵커. 제목에서 만들며 한글을 유지한다. */
  anchor: string;
  heading: string;
  level: 2 | 3;
  children: OutlineItem[];
}

/**
 * 섹션 구조에서 앵커를 만든다. 같은 제목이 반복되면 -1, -2 접미사를 붙여
 * 문서 전체에서 고유하게 유지한다. 제목이 비어 있으면 section-N을 쓴다.
 */
export function buildOutline(content: PostContent): OutlineItem[] {
  const slugger = new GithubSlugger();
  const anchorFor = (heading: string, fallback: string) =>
    slugger.slug(slugify(heading) ? heading : fallback);

  return content.sections.map((section, i) => ({
    id: section.id,
    heading: section.heading.trim(),
    level: 2,
    anchor: anchorFor(section.heading.trim(), `section-${i + 1}`),
    children: section.subsections.map((sub, j) => ({
      id: sub.id,
      heading: sub.heading.trim(),
      level: 3,
      anchor: anchorFor(sub.heading.trim(), `section-${i + 1}-${j + 1}`),
      children: [],
    })),
  }));
}

/** 섹션 id → 앵커 조회용 맵 */
export function anchorIndex(outline: OutlineItem[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of outline) {
    map.set(item.id, item.anchor);
    for (const child of item.children) map.set(child.id, child.anchor);
  }
  return map;
}
