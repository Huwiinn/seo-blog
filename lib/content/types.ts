import type { JSONContent } from "@tiptap/core";

/**
 * 본문 조각. Tiptap 문서 JSON이며 heading 노드를 포함할 수 없다.
 * 제목 계층(H1 > H2 > H3)은 아래 구조로만 만들어진다.
 */
export type RichText = JSONContent;

/** H3 소제목 블록 */
export interface Subsection {
  id: string;
  heading: string;
  body: RichText;
}

/** H2 섹션 블록 */
export interface Section {
  id: string;
  heading: string;
  /** faq: H3 = 질문, 본문 = 답변으로 보고 FAQPage JSON-LD를 함께 출력한다. */
  kind: "default" | "faq";
  body: RichText;
  subsections: Subsection[];
}

export interface PostContent {
  version: 1;
  /** H1 아래 도입부 */
  intro: RichText;
  sections: Section[];
}

export interface CoverImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export type PostStatus = "draft" | "published";

export function emptyDoc(): RichText {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

export function createSubsection(id: string): Subsection {
  return { id, heading: "", body: emptyDoc() };
}

export function createSection(id: string): Section {
  return { id, heading: "", kind: "default", body: emptyDoc(), subsections: [] };
}

export function emptyContent(): PostContent {
  return { version: 1, intro: emptyDoc(), sections: [] };
}
