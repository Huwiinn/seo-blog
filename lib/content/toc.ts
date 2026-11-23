import type { OutlineItem } from "./anchors";

/** 목차에 표시할 항목. 제목이 비어 있는 섹션(작성 중)은 제외한다. */
export function buildToc(outline: OutlineItem[]): OutlineItem[] {
  return outline
    .filter((item) => item.heading.length > 0)
    .map((item) => ({
      ...item,
      children: item.children.filter((child) => child.heading.length > 0),
    }));
}

export function countTocItems(toc: OutlineItem[]): number {
  return toc.reduce((sum, item) => sum + 1 + item.children.length, 0);
}
