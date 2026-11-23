import { marked, type Token, type Tokens } from "marked";
import type { PostContent, RichText, Section, Subsection } from "./types";
import { isSafeHref } from "./url";

/**
 * 마크다운 초안 → 글 구조(PostContent).
 *
 *   머리말(--- … ---)   → 제목·슬러그·요약 등
 *   첫 `##` 앞의 내용    → 도입부
 *   `## 제목`           → H2 섹션
 *   `### 제목`          → 바로 위 H2의 H3 소제목
 *
 * 본문에서는 문단, 굵게·기울임·코드·링크, 목록, 인용, 코드 블록, 표만 받아들인다.
 * 이미지·HTML·mermaid·구분선은 건너뛰고 warnings에 남긴다.
 */
export interface ParsedMarkdownPost {
  meta: Record<string, string>;
  tags: string[];
  content: PostContent;
  warnings: string[];
}

type Mark = NonNullable<RichText["marks"]>[number];

const FAQ_HEADING = /^(자주 묻는 질문|FAQ|Q&A|묻고 답하기)/i;

function parseFrontmatter(source: string): { meta: Record<string, string>; tags: string[]; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { meta: {}, tags: [], body: source };

  const meta: Record<string, string> = {};
  let tags: string[] = [];
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!pair) continue;
    const key = pair[1];
    let value = pair[2].trim();
    if (key === "tags") {
      tags = value
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((tag) => tag.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    meta[key] = value;
  }
  return { meta, tags, body: source.slice(match[0].length) };
}

function sameMarks(a: readonly Mark[] | undefined, b: readonly Mark[] | undefined): boolean {
  return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
}

function pushText(out: RichText[], text: string, marks: Mark[]): void {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.type === "text" && sameMarks(last.marks, marks)) {
    last.text = (last.text ?? "") + text;
    return;
  }
  out.push(marks.length > 0 ? { type: "text", text, marks } : { type: "text", text });
}

function inlineNodes(tokens: Token[] | undefined, marks: Mark[], warnings: string[], out: RichText[] = []): RichText[] {
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "text":
      case "escape": {
        const nested = (token as Tokens.Text).tokens;
        if (nested && nested.length > 0) inlineNodes(nested, marks, warnings, out);
        else pushText(out, token.text, marks);
        break;
      }
      case "strong":
        inlineNodes(token.tokens, [...marks, { type: "bold" }], warnings, out);
        break;
      case "em":
        inlineNodes(token.tokens, [...marks, { type: "italic" }], warnings, out);
        break;
      case "del":
        inlineNodes(token.tokens, [...marks, { type: "strike" }], warnings, out);
        break;
      case "codespan":
        pushText(out, token.text, [...marks, { type: "code" }]);
        break;
      case "link": {
        const href = String(token.href ?? "").trim();
        if (isSafeHref(href)) {
          inlineNodes(token.tokens, [...marks, { type: "link", attrs: { href } }], warnings, out);
        } else {
          warnings.push(`허용되지 않는 링크를 일반 글자로 바꿨습니다: ${href}`);
          inlineNodes(token.tokens, marks, warnings, out);
        }
        break;
      }
      case "br":
        out.push({ type: "hardBreak" });
        break;
      case "image":
        warnings.push(`이미지를 건너뛰었습니다: ${token.href}`);
        break;
      case "html":
        warnings.push(`HTML을 건너뛰었습니다: ${String(token.raw).trim().slice(0, 40)}`);
        break;
      default:
        if ("text" in token && typeof token.text === "string") pushText(out, token.text, marks);
    }
  }
  return out;
}

/** 제목처럼 서식 없는 글자만 필요한 곳에서 쓴다. */
function plainText(tokens: Token[] | undefined): string {
  return inlineNodes(tokens, [], [])
    .map((node) => (node.type === "text" ? (node.text ?? "") : " "))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function paragraph(tokens: Token[] | undefined, warnings: string[]): RichText | null {
  const content = inlineNodes(tokens, [], warnings);
  // 줄 끝의 줄바꿈은 의미가 없다
  while (content.length > 0 && content[content.length - 1].type === "hardBreak") content.pop();
  return content.length > 0 ? { type: "paragraph", content } : null;
}

function cell(type: "tableHeader" | "tableCell", tokens: Token[], warnings: string[]): RichText {
  return {
    type,
    attrs: { colspan: 1, rowspan: 1, colwidth: null },
    content: [paragraph(tokens, warnings) ?? { type: "paragraph" }],
  };
}

function blockNodes(tokens: Token[], warnings: string[]): RichText[] {
  const out: RichText[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "space":
        break;
      case "paragraph":
      case "text": {
        const node = paragraph((token as Tokens.Paragraph).tokens, warnings);
        if (node) out.push(node);
        break;
      }
      case "list": {
        const list = token as Tokens.List;
        const items = list.items.map((item): RichText => {
          const content = blockNodes(item.tokens, warnings);
          // 목록 항목은 문단으로 시작해야 한다
          if (content.length === 0 || content[0].type !== "paragraph") content.unshift({ type: "paragraph" });
          return { type: "listItem", content };
        });
        if (items.length === 0) break;
        out.push(
          list.ordered
            ? { type: "orderedList", attrs: { start: Number(list.start) || 1 }, content: items }
            : { type: "bulletList", content: items },
        );
        break;
      }
      case "blockquote": {
        const content = blockNodes((token as Tokens.Blockquote).tokens, warnings);
        if (content.length > 0) out.push({ type: "blockquote", content });
        break;
      }
      case "code": {
        const code = token as Tokens.Code;
        if ((code.lang ?? "").toLowerCase() === "mermaid") {
          warnings.push("mermaid 도식을 건너뛰었습니다.");
          break;
        }
        out.push({
          type: "codeBlock",
          attrs: { language: code.lang?.trim() || null },
          content: code.text ? [{ type: "text", text: code.text }] : undefined,
        });
        break;
      }
      case "table": {
        const table = token as Tokens.Table;
        if (table.header.length > 5) warnings.push(`표가 ${table.header.length}열입니다 (권장 5열 이하).`);
        out.push({
          type: "table",
          content: [
            { type: "tableRow", content: table.header.map((item) => cell("tableHeader", item.tokens, warnings)) },
            ...table.rows.map(
              (row): RichText => ({
                type: "tableRow",
                content: row.map((item) => cell("tableCell", item.tokens, warnings)),
              }),
            ),
          ],
        });
        break;
      }
      case "heading": {
        // H4 이하는 지원하지 않는다. 굵은 문단으로 낮춘다.
        const text = plainText((token as Tokens.Heading).tokens);
        if (text) out.push({ type: "paragraph", content: [{ type: "text", text, marks: [{ type: "bold" }] }] });
        warnings.push(`H${(token as Tokens.Heading).depth} 제목을 굵은 문단으로 바꿨습니다: ${text}`);
        break;
      }
      case "hr":
        warnings.push("구분선을 건너뛰었습니다.");
        break;
      case "html":
        warnings.push(`HTML을 건너뛰었습니다: ${String(token.raw).trim().slice(0, 40)}`);
        break;
      default:
        warnings.push(`지원하지 않는 블록을 건너뛰었습니다: ${token.type}`);
    }
  }
  return out;
}

function doc(blocks: RichText[]): RichText {
  return { type: "doc", content: blocks.length > 0 ? blocks : [{ type: "paragraph" }] };
}

export function parsePostMarkdown(source: string): ParsedMarkdownPost {
  const { meta, tags, body } = parseFrontmatter(source);
  const warnings: string[] = [];
  const tokens = marked.lexer(body, { gfm: true });

  const intro: Token[] = [];
  const sections: { heading: string; tokens: Token[]; subs: { heading: string; tokens: Token[] }[] }[] = [];
  let target = intro;

  for (const token of tokens) {
    if (token.type === "heading" && token.depth <= 3) {
      const heading = plainText(token.tokens);
      if (token.depth === 1) {
        warnings.push(`본문의 H1을 건너뛰었습니다 (제목은 머리말의 title을 씁니다): ${heading}`);
        continue;
      }
      if (token.depth === 2) {
        const section = { heading, tokens: [] as Token[], subs: [] as { heading: string; tokens: Token[] }[] };
        sections.push(section);
        target = section.tokens;
        continue;
      }
      const parent = sections[sections.length - 1];
      if (!parent) {
        throw new Error(`H3 "${heading}"가 H2보다 먼저 나왔습니다. H3는 H2 섹션 안에만 둘 수 있습니다.`);
      }
      const sub = { heading, tokens: [] as Token[] };
      parent.subs.push(sub);
      target = sub.tokens;
      continue;
    }
    target.push(token);
  }

  const content: PostContent = {
    version: 1,
    intro: doc(blockNodes(intro, warnings)),
    sections: sections.map(
      (section, i): Section => ({
        id: `sec-${i + 1}`,
        heading: section.heading,
        kind: FAQ_HEADING.test(section.heading) ? "faq" : "default",
        body: doc(blockNodes(section.tokens, warnings)),
        subsections: section.subs.map(
          (sub, j): Subsection => ({
            id: `sec-${i + 1}-${j + 1}`,
            heading: sub.heading,
            body: doc(blockNodes(sub.tokens, warnings)),
          }),
        ),
      }),
    ),
  };

  return { meta, tags, content, warnings };
}
