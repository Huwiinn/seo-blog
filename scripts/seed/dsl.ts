/**
 * 시드 글을 짧게 쓰기 위한 작은 도우미.
 * 문단 안에서는 **굵게**, *기울임*, `코드`, [링크](주소)만 지원한다.
 */
import type { RichText, Section, Subsection } from "../../lib/content/types";

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function inline(source: string): RichText[] {
  const nodes: RichText[] = [];
  for (const part of source.split(INLINE)) {
    if (!part) continue;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      nodes.push({ type: "text", text: link[1], marks: [{ type: "link", attrs: { href: link[2] } }] });
    } else if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      nodes.push({ type: "text", text: part.slice(2, -2), marks: [{ type: "bold" }] });
    } else if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      nodes.push({ type: "text", text: part.slice(1, -1), marks: [{ type: "code" }] });
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      nodes.push({ type: "text", text: part.slice(1, -1), marks: [{ type: "italic" }] });
    } else {
      nodes.push({ type: "text", text: part });
    }
  }
  return nodes;
}

export const P = (source: string): RichText => ({ type: "paragraph", content: inline(source) });

const items = (list: string[]): RichText[] =>
  list.map((item) => ({ type: "listItem", content: [P(item)] }));

export const UL = (...list: string[]): RichText => ({ type: "bulletList", content: items(list) });

export const OL = (...list: string[]): RichText => ({
  type: "orderedList",
  attrs: { start: 1 },
  content: items(list),
});

export const QUOTE = (source: string): RichText => ({ type: "blockquote", content: [P(source)] });

export const CODE = (language: string, code: string): RichText => ({
  type: "codeBlock",
  attrs: { language },
  content: [{ type: "text", text: code }],
});

export const doc = (...blocks: RichText[]): RichText => ({
  type: "doc",
  content: blocks.length > 0 ? blocks : [{ type: "paragraph" }],
});

export interface H3Draft {
  heading: string;
  blocks: RichText[];
}

export const H3 = (heading: string, ...blocks: RichText[]): H3Draft => ({ heading, blocks });

export interface H2Draft {
  heading: string;
  kind: Section["kind"];
  blocks: RichText[];
  subsections: H3Draft[];
}

/** H2 섹션. 본문 블록과 H3를 섞어서 넘기면 블록은 섹션 본문, H3는 소제목이 된다. */
export function H2(heading: string, ...parts: (RichText | H3Draft)[]): H2Draft {
  const blocks: RichText[] = [];
  const subsections: H3Draft[] = [];
  for (const part of parts) {
    if ("heading" in part && "blocks" in part) subsections.push(part as H3Draft);
    else blocks.push(part as RichText);
  }
  return { heading, kind: "default", blocks, subsections };
}

export function FAQ(heading: string, ...questions: H3Draft[]): H2Draft {
  return { heading, kind: "faq", blocks: [], subsections: questions };
}

export function toSections(drafts: H2Draft[]): Section[] {
  return drafts.map((draft, i) => ({
    id: `sec-${i + 1}`,
    heading: draft.heading,
    kind: draft.kind,
    body: doc(...draft.blocks),
    subsections: draft.subsections.map(
      (sub, j): Subsection => ({
        id: `sec-${i + 1}-${j + 1}`,
        heading: sub.heading,
        body: doc(...sub.blocks),
      }),
    ),
  }));
}
