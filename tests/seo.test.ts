import { describe, expect, it } from "vitest";
import { toPostArticle } from "@/lib/posts/mappers";
import { analyzePost, extractFaq, type SeoInput } from "@/lib/seo/analyze";
import { blogPostingJsonLd, breadcrumbJsonLd, postJsonLd, serializeJsonLd } from "@/lib/seo/jsonld";
import { estimateTextWidth, truncateToWidth } from "@/lib/seo/measure";
import { resolvePostMeta } from "@/lib/seo/meta";
import { SEO_RULES } from "@/lib/seo/rules";
import { content, doc, image, link, p, section, sub } from "./helpers";

const filler = "구조가 분명한 글은 독자와 검색엔진 모두가 빠르게 이해합니다. ".repeat(7);

function goodInput(): SeoInput {
  return {
    title: "검색 의도란 무엇인가",
    slug: "search-intent",
    summary:
      "검색 의도는 사용자가 검색어를 입력한 진짜 목적입니다. 정보형·탐색형·거래형으로 나누어 보면 어떤 페이지를 만들어야 할지 분명해집니다.",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "검색 의도",
    coverImage: { src: "/uploads/cover.webp", alt: "검색 의도 유형 도식", width: 1600, height: 900 },
    content: content(
      [
        section(
          "sec-1",
          "검색 의도는 왜 중요한가?",
          doc(
            p("검색 의도에 맞지 않는 글은 순위에 오르기 어렵습니다."),
            p(filler), p(filler),
            p("자세한 내용은 ", link("구글 문서", "https://developers.google.com/search"), "를 참고하세요."),
          ),
          [sub("sub-1", "정보형 검색", doc(p(filler), p(filler))), sub("sub-2", "거래형 검색", doc(p(filler), p(filler)))],
        ),
        section(
          "sec-2",
          "어떻게 파악하나?",
          doc(p("검색 결과 첫 페이지를 직접 확인합니다. 상위 10개 중 7개가 가이드라면 정보형입니다."), p(filler), p(filler)),
          [sub("sub-3", "상위 결과 유형 보기", doc(p(filler), p(filler), p("관련 글: ", link("GEO란", "/posts/what-is-geo"))))],
        ),
      ],
      doc(p("검색 의도는 키워드보다 먼저 정해야 하는 기준입니다."), p(filler), p(filler)),
    ),
  };
}

function check(input: SeoInput, id: string, context = {}) {
  return analyzePost(input, context).checks.find((c) => c.id === id);
}

describe("SEO 점검", () => {
  it("잘 쓴 글은 오류 없이 높은 점수를 받는다", () => {
    const report = analyzePost(goodInput());
    expect(report.errors).toEqual([]);
    expect(report.canPublish).toBe(true);
    expect(report.warnings.map((w) => w.id)).toEqual([]);
    expect(report.score).toBe(100);
    expect(report.stats).toMatchObject({ h2: 2, h3: 3, internalLinks: 1, externalLinks: 1 });
  });

  it("빈 H1·H2·H3는 발행을 막는다", () => {
    const input = goodInput();
    input.title = " ";
    input.content.sections[0].heading = "";
    input.content.sections[1].subsections[0].heading = "";
    const report = analyzePost(input);
    expect(report.canPublish).toBe(false);
    expect(report.errors.map((e) => e.id).sort()).toEqual(["h1", "h2-empty", "h3-empty"]);
    expect(report.errors.find((e) => e.id === "h2-empty")?.targets).toEqual(["sec-1"]);
    expect(report.errors.find((e) => e.id === "h3-empty")?.targets).toEqual(["sub-3"]);
  });

  it("슬러그가 없거나 형식이 틀리거나 중복이면 오류", () => {
    expect(check({ ...goodInput(), slug: "" }, "slug")).toMatchObject({ status: "fail", severity: "error" });
    expect(check({ ...goodInput(), slug: "검색-의도" }, "slug")?.message).toMatch(/영문 소문자/);
    expect(check(goodInput(), "slug", { slugTaken: true })?.message).toMatch(/이미 쓰고/);
    expect(check(goodInput(), "slug")).toMatchObject({ status: "pass" });
  });

  it("H2가 2개 미만이면 경고, 발행은 가능", () => {
    const input = goodInput();
    input.content.sections = input.content.sections.slice(0, 1);
    const report = analyzePost(input);
    expect(report.checks.find((c) => c.id === "h2-count")).toMatchObject({ status: "fail", severity: "warning" });
    expect(report.canPublish).toBe(true);
    expect(report.score).toBeLessThan(100);
  });

  it("중복 제목과 빈 본문을 찾는다", () => {
    const input = goodInput();
    input.content.sections[1].heading = "검색 의도는 왜  중요한가?";
    input.content.sections[1].subsections[0].body = doc();
    const report = analyzePost(input);
    expect(report.checks.find((c) => c.id === "heading-duplicate")).toMatchObject({
      status: "fail",
      targets: ["sec-2"],
    });
    expect(report.checks.find((c) => c.id === "empty-body")?.targets).toEqual(["sub-3"]);
  });

  it("제목·설명의 픽셀 폭을 주입한 측정 함수로 판단한다", () => {
    const wide = () => 9999;
    const narrow = () => 10;
    expect(check(goodInput(), "title-width", { measure: wide })?.message).toMatch(/잘릴 수/);
    expect(check(goodInput(), "title-width", { measure: narrow })?.message).toMatch(/짧습니다/);
    expect(check(goodInput(), "description", { measure: wide })?.message).toMatch(/잘릴 수/);
    const fit = () => 400;
    expect(check(goodInput(), "title-width", { measure: fit })?.status).toBe("pass");
  });

  it("요약도 메타 설명도 없으면 설명 경고", () => {
    const input = { ...goodInput(), summary: "", metaDescription: "" };
    expect(check(input, "description")?.message).toMatch(/메타 설명이 없습니다/);
    expect(check(input, "summary")?.message).toMatch(/핵심 요약을 입력/);
  });

  it("포커스 키워드 배치를 점검한다 (띄어쓰기 차이는 무시)", () => {
    const input = goodInput();
    input.focusKeyword = "검색의도";
    const report = analyzePost(input);
    for (const id of ["keyword-title", "keyword-description", "keyword-intro", "keyword-h2", "keyword-body"]) {
      expect(report.checks.find((c) => c.id === id)?.status, id).toBe("pass");
    }
    // 한글 키워드는 영문 슬러그와 비교할 수 없으므로 점검하지 않는다
    expect(report.checks.find((c) => c.id === "keyword-slug")).toBeUndefined();

    const english = analyzePost({ ...goodInput(), focusKeyword: "Search Intent" });
    expect(english.checks.find((c) => c.id === "keyword-slug")?.status).toBe("pass");
    expect(english.checks.find((c) => c.id === "keyword-title")?.status).toBe("fail");
  });

  it("키워드가 없으면 키워드 점검 대신 안내만 한다", () => {
    const report = analyzePost({ ...goodInput(), focusKeyword: "" });
    const keywordChecks = report.checks.filter((c) => c.group === "keyword");
    expect(keywordChecks).toHaveLength(1);
    expect(keywordChecks[0]).toMatchObject({ id: "keyword-missing", severity: "info" });
    expect(report.score).toBe(100);
  });

  it("짧은 본문, alt 없는 이미지, 링크 없음, 긴 문단을 경고한다", () => {
    const input = goodInput();
    input.content = content(
      [section("sec-1", "하나", doc(p("가".repeat(SEO_RULES.content.longParagraphChars + 1)), image("/uploads/a.webp")))],
      doc(p("짧은 도입")),
    );
    const ids = analyzePost(input).warnings.map((w) => w.id);
    for (const id of ["length", "image-alt", "links-internal", "links-external", "long-paragraph", "direct-answer"]) {
      expect(ids, id).toContain(id);
    }
  });

  it("대표 이미지가 없거나 alt가 없으면 경고", () => {
    expect(check({ ...goodInput(), coverImage: null }, "cover")?.message).toMatch(/대표 이미지가 없습니다/);
    const noAlt = { ...goodInput(), coverImage: { src: "/a.webp", alt: " ", width: 1, height: 1 } };
    expect(check(noAlt, "cover")?.message).toMatch(/대체 텍스트/);
  });

  it("질문형 제목과 FAQ는 점수에 넣지 않는 제안이다", () => {
    const input = goodInput();
    input.content.sections[0].heading = "검색 의도의 중요성";
    input.content.sections[1].heading = "파악하는 순서";
    const report = analyzePost(input);
    expect(report.checks.find((c) => c.id === "question-heading")).toMatchObject({ status: "fail", severity: "info" });
    expect(report.checks.find((c) => c.id === "faq")).toMatchObject({ status: "fail", severity: "info" });
    expect(report.score).toBe(100);
  });

  it("FAQ 섹션에서 질문·답변 쌍을 뽑는다", () => {
    const value = content([
      section("s1", "자주 묻는 질문", doc(), [sub("q1", "GEO는 SEO를 대체하나요?", doc(p("아니요. 함께 씁니다."))), sub("q2", "", doc(p("제목 없음")))], "faq"),
      section("s2", "일반 섹션", doc(p("본문")), [sub("x", "소제목", doc(p("답이 아님")))]),
    ]);
    expect(extractFaq(value)).toEqual([{ question: "GEO는 SEO를 대체하나요?", answer: "아니요. 함께 씁니다." }]);
  });
});

describe("검색 노출 값", () => {
  it("메타 제목 → H1, 메타 설명 → 요약 → 도입부 순으로 대체한다", () => {
    const base = goodInput();
    expect(resolvePostMeta(base)).toMatchObject({
      title: "검색 의도란 무엇인가",
      fullTitle: "검색 의도란 무엇인가 | SEO Lab Notes",
      descriptionSource: "summary",
      path: "/posts/search-intent",
      url: "https://www.seo-blog.site/posts/search-intent",
    });
    expect(resolvePostMeta({ ...base, metaTitle: "메타 제목", metaDescription: "메타 설명" })).toMatchObject({
      title: "메타 제목",
      description: "메타 설명",
      descriptionSource: "meta",
    });
    const intro = resolvePostMeta({ ...base, summary: "" });
    expect(intro.descriptionSource).toBe("intro");
    expect(intro.description).toBe("검색 의도는 키워드보다 먼저 정해야 하는 기준입니다.");
  });
});

describe("글자 폭", () => {
  it("한글이 영문보다 넓게 계산된다", () => {
    expect(estimateTextWidth("가나다", 20)).toBeGreaterThan(estimateTextWidth("abc", 20));
    expect(estimateTextWidth("", 20)).toBe(0);
  });

  it("폭을 넘으면 말줄임표로 자르고, 넘지 않으면 그대로 둔다", () => {
    const short = truncateToWidth("짧은 제목", 580, 20);
    expect(short).toMatchObject({ text: "짧은 제목", truncated: false });

    const long = truncateToWidth("가".repeat(100), 580, 20);
    expect(long.truncated).toBe(true);
    expect(long.text.endsWith(" ...")).toBe(true);
    expect(estimateTextWidth(long.text, 20)).toBeLessThanOrEqual(580);
    expect(long.text.length).toBeGreaterThan(20);
  });
});

describe("JSON-LD", () => {
  const post = toPostArticle({
    id: "post-1",
    ...goodInput(),
    category: "seo",
    tags: ["검색 의도", "키워드"],
    featured: false,
    publishedAt: new Date("2026-11-01T15:30:00Z"),
    modifiedAt: new Date("2026-11-10T01:00:00Z"),
  });

  it("BlogPosting에 한국 시간 날짜와 본문 정보가 들어간다", () => {
    const data = blogPostingJsonLd(post);
    expect(data).toMatchObject({
      "@type": "BlogPosting",
      headline: "검색 의도란 무엇인가",
      url: "https://www.seo-blog.site/posts/search-intent",
      datePublished: "2026-11-02T00:30:00+09:00",
      dateModified: "2026-11-10T10:00:00+09:00",
      articleSection: "SEO",
      keywords: "검색 의도, 키워드",
      inLanguage: "ko-KR",
      image: ["https://www.seo-blog.site/uploads/cover.webp"],
    });
    expect(data.wordCount).toBeGreaterThan(50);
  });

  it("빵부스러기는 홈 › 카테고리 › 글 순서", () => {
    const [, crumbs] = postJsonLd(post);
    expect(crumbs).toMatchObject({ "@type": "BreadcrumbList" });
    const items = crumbs.itemListElement as { position: number; name: string; item: string }[];
    expect(items.map((i) => i.name)).toEqual(["홈", "SEO", "검색 의도란 무엇인가"]);
    expect(items[1].item).toBe("https://www.seo-blog.site/seo");
    expect(breadcrumbJsonLd([{ name: "홈", path: "/" }]).itemListElement).toHaveLength(1);
  });

  it("FAQ 섹션이 있을 때만 FAQPage를 만든다", () => {
    expect(postJsonLd(post)).toHaveLength(2);
    const withFaq = toPostArticle({
      id: "post-2",
      ...goodInput(),
      category: "aeo",
      tags: [],
      featured: false,
      content: content([section("s1", "FAQ", doc(), [sub("q", "질문인가요?", doc(p("답입니다.")))], "faq")]),
    });
    const all = postJsonLd(withFaq);
    expect(all).toHaveLength(3);
    expect(all[2]).toMatchObject({ "@type": "FAQPage" });
  });

  it("직렬화할 때 <를 이스케이프해 script 주입을 막는다", () => {
    const serialized = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(serialized).not.toContain("<");
    expect(serialized).toContain("u003c/script>");
    expect(JSON.parse(serialized).name).toBe("</script><script>alert(1)</script>");
  });
});
