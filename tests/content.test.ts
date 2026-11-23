import { describe, expect, it } from "vitest";
import { anchorIndex, buildOutline } from "@/lib/content/anchors";
import {
  collectImages,
  collectLinks,
  contentBodyText,
  countCharacters,
  estimateReadingMinutes,
  firstParagraph,
  isRichTextEmpty,
  richTextToPlain,
  truncateText,
} from "@/lib/content/text";
import { buildToc, countTocItems } from "@/lib/content/toc";
import { emptyDoc } from "@/lib/content/types";
import { classifyHref, isSafeHref, isSafeImageSrc } from "@/lib/content/url";
import { postContentSchema, postInputSchema, validateRichText } from "@/lib/content/validate";
import { content, doc, image, link, p, section, sub, text } from "./helpers";

describe("앵커와 목차", () => {
  it("한글 제목을 그대로 앵커로 쓴다", () => {
    const outline = buildOutline(content([section("s1", "검색 의도란 무엇인가?")]));
    expect(outline[0].anchor).toBe("검색-의도란-무엇인가");
    expect(outline[0].level).toBe(2);
  });

  it("같은 제목은 문서 전체에서 접미사로 구분한다", () => {
    const outline = buildOutline(
      content([
        section("s1", "정리", undefined, [sub("a", "예시"), sub("b", "예시")]),
        section("s2", "정리", undefined, [sub("c", "예시")]),
      ]),
    );
    const anchors = [outline[0], ...outline[0].children, outline[1], ...outline[1].children].map(
      (item) => item.anchor,
    );
    expect(anchors).toEqual(["정리", "예시", "예시-1", "정리-1", "예시-2"]);
    expect(new Set(anchors).size).toBe(anchors.length);
  });

  it("제목이 비었거나 기호뿐이면 section-N을 쓴다", () => {
    const outline = buildOutline(
      content([section("s1", ""), section("s2", "???", undefined, [sub("a", "  ")])]),
    );
    expect(outline[0].anchor).toBe("section-1");
    expect(outline[1].anchor).toBe("section-2");
    expect(outline[1].children[0].anchor).toBe("section-2-1");
  });

  it("섹션 id로 앵커를 찾을 수 있다", () => {
    const outline = buildOutline(content([section("s1", "GEO", undefined, [sub("a", "인용")])]));
    const index = anchorIndex(outline);
    expect(index.get("s1")).toBe("geo");
    expect(index.get("a")).toBe("인용");
  });

  it("목차는 제목이 없는 섹션을 뺀다", () => {
    const toc = buildToc(
      buildOutline(
        content([section("s1", "첫째", undefined, [sub("a", ""), sub("b", "둘째")]), section("s2", "")]),
      ),
    );
    expect(toc).toHaveLength(1);
    expect(toc[0].children.map((c) => c.heading)).toEqual(["둘째"]);
    expect(countTocItems(toc)).toBe(2);
  });
});

describe("본문 텍스트 유틸", () => {
  const body = doc(
    p("첫 문단 ", text("굵게", [{ type: "bold" }]), "."),
    {
      type: "bulletList",
      content: [
        { type: "listItem", content: [p("항목 하나")] },
        { type: "listItem", content: [p(link("링크", "https://example.com/a"))] },
      ],
    },
    image("/uploads/a.webp", "설명"),
    image("/uploads/b.webp"),
  );

  it("블록 단위로 평문을 만든다", () => {
    expect(richTextToPlain(body)).toBe("첫 문단 굵게.\n항목 하나\n링크");
    expect(firstParagraph(body)).toBe("첫 문단 굵게.");
  });

  it("링크와 이미지를 모은다", () => {
    expect(collectLinks(body)).toEqual([{ href: "https://example.com/a", text: "링크" }]);
    expect(collectImages(body)).toEqual([
      { src: "/uploads/a.webp", alt: "설명" },
      { src: "/uploads/b.webp", alt: "" },
    ]);
  });

  it("빈 문서를 구분한다 (이미지만 있어도 비어 있지 않다)", () => {
    expect(isRichTextEmpty(emptyDoc())).toBe(true);
    expect(isRichTextEmpty(doc(p("  ")))).toBe(true);
    expect(isRichTextEmpty(doc(image("/uploads/a.webp")))).toBe(false);
  });

  it("글자 수는 공백을 빼고, 읽기 시간은 최소 1분", () => {
    expect(countCharacters("가 나\n다 ")).toBe(3);
    expect(estimateReadingMinutes(10)).toBe(1);
    expect(estimateReadingMinutes(1600)).toBe(3);
  });

  it("도입부와 모든 섹션 본문을 합친다", () => {
    const value = content(
      [section("s1", "제목", doc(p("섹션")), [sub("a", "소제목", doc(p("소제목 본문")))])],
      doc(p("도입")),
    );
    expect(contentBodyText(value)).toBe("도입\n섹션\n소제목 본문");
  });

  it("긴 문장은 말줄임표로 자른다", () => {
    expect(truncateText("가나다라마바사", 5)).toBe("가나다라…");
    expect(truncateText("짧다", 5)).toBe("짧다");
  });
});

describe("URL 규칙", () => {
  it("http·https·mailto·상대 경로만 링크로 허용한다", () => {
    for (const ok of ["https://a.com", "http://a.com", "mailto:a@b.c", "/posts/x", "#anchor", "./x"]) {
      expect(isSafeHref(ok), ok).toBe(true);
    }
    for (const bad of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "java\tscript:alert(1)",
      " javascript:alert(1)",
      "data:text/html,<script>",
      "vbscript:x",
      "",
      null,
    ]) {
      expect(isSafeHref(bad), String(bad)).toBe(false);
    }
  });

  it("이미지는 내부 경로와 http(s)만 허용한다", () => {
    expect(isSafeImageSrc("/uploads/2026/11/a.webp")).toBe(true);
    expect(isSafeImageSrc("https://cdn.example.com/a.png")).toBe(true);
    expect(isSafeImageSrc("data:image/png;base64,AAAA")).toBe(false);
    expect(isSafeImageSrc("javascript:alert(1)")).toBe(false);
    expect(isSafeImageSrc("//evil.example/a.png")).toBe(false);
  });

  it("내부·외부 링크를 구분한다", () => {
    const site = "https://www.seo-blog.site";
    expect(classifyHref("/posts/a", site)).toBe("internal");
    expect(classifyHref("#toc", site)).toBe("internal");
    expect(classifyHref("https://seo-blog.site/posts/a", site)).toBe("internal");
    expect(classifyHref("https://developers.google.com/search", site)).toBe("external");
    expect(classifyHref("mailto:a@b.c", site)).toBe("other");
  });
});

describe("본문 검증", () => {
  it("일반적인 본문은 통과한다", () => {
    const body = doc(
      p("문단 ", link("링크", "https://example.com")),
      { type: "blockquote", content: [p("인용")] },
      { type: "codeBlock", attrs: { language: "json" }, content: [text("{}")] },
      { type: "orderedList", attrs: { start: 1 }, content: [{ type: "listItem", content: [p("하나")] }] },
      { type: "horizontalRule" },
      image("/uploads/a.webp", "설명"),
    );
    expect(validateRichText(body)).toBeNull();
  });

  it("heading 노드를 거부한다", () => {
    const body = doc({ type: "heading", attrs: { level: 2 }, content: [text("몰래 넣은 제목")] });
    expect(validateRichText(body)).toMatch(/제목/);
  });

  it("javascript: 링크와 data: 이미지를 거부한다", () => {
    expect(validateRichText(doc(p(link("x", "javascript:alert(1)"))))).toMatch(/링크/);
    expect(validateRichText(doc(image("data:image/svg+xml,<svg onload=alert(1)>")))).toMatch(/이미지/);
  });

  it("스키마에 없는 노드와 잘못된 구조를 거부한다", () => {
    expect(validateRichText(doc({ type: "table", content: [] }))).toMatch(/구조/);
    expect(validateRichText({ type: "paragraph" })).toMatch(/형식/);
    expect(validateRichText(null)).toMatch(/형식/);
  });

  it("content 스키마가 섹션 본문까지 검사한다", () => {
    const good = content([section("sec-1", "제목", doc(p("본문")), [sub("sub-1", "소제목")])]);
    expect(postContentSchema.safeParse(good).success).toBe(true);

    const bad = content([
      section("sec-1", "제목", doc(p("본문")), [
        sub("sub-1", "소제목", doc({ type: "heading", attrs: { level: 3 }, content: [text("h3")] })),
      ]),
    ]);
    const result = postContentSchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["sections", 0, "subsections", 0, "body"]);
    }
  });

  it("저장 입력에서 슬러그 형식을 검사한다", () => {
    const base = {
      id: "abcdefghij12345",
      slug: "what-is-geo",
      category: "geo",
      title: "제목",
      summary: "",
      content: content([]),
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      tags: ["GEO"],
      coverImage: null,
      featured: false,
    };
    expect(postInputSchema.safeParse(base).success).toBe(true);
    expect(postInputSchema.safeParse({ ...base, slug: "" }).success).toBe(true);
    expect(postInputSchema.safeParse({ ...base, slug: "한글-슬러그" }).success).toBe(false);
    expect(postInputSchema.safeParse({ ...base, slug: "Upper_Case" }).success).toBe(false);
    expect(postInputSchema.safeParse({ ...base, category: "marketing" }).success).toBe(false);
  });
});
