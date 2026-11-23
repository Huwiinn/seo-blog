import type { PostContent, RichText, Section, Subsection } from "@/lib/content/types";

export function text(value: string, marks?: RichText["marks"]): RichText {
  return marks ? { type: "text", text: value, marks } : { type: "text", text: value };
}

export function p(...children: (string | RichText)[]): RichText {
  return {
    type: "paragraph",
    content: children.map((child) => (typeof child === "string" ? text(child) : child)),
  };
}

export function link(label: string, href: string): RichText {
  return text(label, [{ type: "link", attrs: { href } }]);
}

export function image(src: string, alt = ""): RichText {
  return { type: "image", attrs: { src, alt, title: null } };
}

export function doc(...blocks: RichText[]): RichText {
  return { type: "doc", content: blocks.length ? blocks : [{ type: "paragraph" }] };
}

export function sub(id: string, heading: string, body: RichText = doc(p("소제목 본문입니다."))): Subsection {
  return { id, heading, body };
}

export function section(
  id: string,
  heading: string,
  body: RichText = doc(p("섹션 본문입니다.")),
  subsections: Subsection[] = [],
  kind: Section["kind"] = "default",
): Section {
  return { id, heading, kind, body, subsections };
}

export function content(sections: Section[], intro: RichText = doc(p("도입부입니다."))): PostContent {
  return { version: 1, intro, sections };
}
