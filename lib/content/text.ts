import type { PostContent, RichText } from "./types";

const BLOCK_TYPES = new Set([
  "paragraph",
  "codeBlock",
  "blockquote",
  "listItem",
  "bulletList",
  "orderedList",
  "horizontalRule",
  "image",
  "table",
  "tableRow",
  "tableHeader",
  "tableCell",
]);

function collectText(node: RichText, out: string[]): void {
  if (node.type === "text") {
    out.push(node.text ?? "");
    return;
  }
  if (node.type === "hardBreak") {
    out.push("\n");
    return;
  }
  for (const child of node.content ?? []) collectText(child, out);
  if (node.type && BLOCK_TYPES.has(node.type)) out.push("\n");
}

/** 본문 JSON을 평문으로 바꾼다. 블록 사이는 줄바꿈. */
export function richTextToPlain(doc: RichText | null | undefined): string {
  if (!doc) return "";
  const out: string[] = [];
  collectText(doc, out);
  return out
    .join("")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function isRichTextEmpty(doc: RichText | null | undefined): boolean {
  if (!doc) return true;
  if (richTextToPlain(doc).length > 0) return false;
  return collectImages(doc).length === 0;
}

/** 최상위 문단들의 평문 (코드 블록·목록 제외) */
export function topLevelParagraphs(doc: RichText | null | undefined): string[] {
  return (doc?.content ?? [])
    .filter((node) => node.type === "paragraph")
    .map((node) => richTextToPlain(node))
    .filter((text) => text.length > 0);
}

export function firstParagraph(doc: RichText | null | undefined): string {
  return topLevelParagraphs(doc)[0] ?? "";
}

export interface LinkRef {
  href: string;
  text: string;
}

export function collectLinks(doc: RichText | null | undefined): LinkRef[] {
  const links: LinkRef[] = [];
  const visit = (node: RichText) => {
    if (node.type === "text") {
      for (const mark of node.marks ?? []) {
        if (mark.type === "link" && typeof mark.attrs?.href === "string") {
          links.push({ href: mark.attrs.href, text: node.text ?? "" });
        }
      }
    }
    for (const child of node.content ?? []) visit(child);
  };
  if (doc) visit(doc);
  return links;
}

export interface ImageRef {
  src: string;
  alt: string;
}

export function collectImages(doc: RichText | null | undefined): ImageRef[] {
  const images: ImageRef[] = [];
  const visit = (node: RichText) => {
    if (node.type === "image") {
      images.push({
        src: String(node.attrs?.src ?? ""),
        alt: String(node.attrs?.alt ?? "").trim(),
      });
    }
    for (const child of node.content ?? []) visit(child);
  };
  if (doc) visit(doc);
  return images;
}

/** 도입부 → 각 섹션 → 소제목 순서로 모든 본문을 돈다. */
export function allBodies(content: PostContent): RichText[] {
  const bodies: RichText[] = [content.intro];
  for (const section of content.sections) {
    bodies.push(section.body);
    for (const sub of section.subsections) bodies.push(sub.body);
  }
  return bodies;
}

/** 제목을 제외한 본문 전체 평문 */
export function contentBodyText(content: PostContent): string {
  return allBodies(content)
    .map((body) => richTextToPlain(body))
    .filter(Boolean)
    .join("\n");
}

/** 공백을 제외한 글자 수 */
export function countCharacters(text: string): number {
  return text.replace(/\s/g, "").length;
}

/** 공백으로 나눈 단어 수 (schema.org wordCount용) */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** 한국어 기준 분당 약 500자(공백 제외)로 읽기 시간을 추정한다. 최소 1분. */
export function estimateReadingMinutes(charCount: number, charsPerMinute = 500): number {
  return Math.max(1, Math.round(charCount / charsPerMinute));
}

export function truncateText(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1).trimEnd()}…`;
}
