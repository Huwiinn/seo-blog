import { describe, expect, it } from "vitest";
import { formatDate, formatDateDots, toDateAttr, toKstIso } from "@/lib/format";
import { isValidSlug, sanitizeSlugInput, suggestSlug } from "@/lib/posts/slug";

describe("슬러그", () => {
  it("영문 소문자·숫자·하이픈만 유효하다", () => {
    for (const ok of ["geo", "what-is-geo", "core-web-vitals-2026", "a1"]) {
      expect(isValidSlug(ok), ok).toBe(true);
    }
    for (const bad of ["", "한글", "Upper", "a--b", "-a", "a-", "a_b", "a b", "a".repeat(81)]) {
      expect(isValidSlug(bad), bad).toBe(false);
    }
  });

  it("입력값을 슬러그 형태로 다듬는다", () => {
    expect(sanitizeSlugInput("What is  GEO?")).toBe("what-is-geo");
    expect(sanitizeSlugInput("--a__b")).toBe("a-b");
    expect(sanitizeSlugInput("한글 slug")).toBe("-slug".replace(/^-/, ""));
    expect(sanitizeSlugInput("what-is-")).toBe("what-is-");
  });

  it("제목의 영문 단어로 제안하고, 한글만 있으면 비워 둔다", () => {
    expect(suggestSlug("Core Web Vitals를 UX 관점에서 읽기")).toBe("core-web-vitals-ux");
    expect(suggestSlug("검색 의도란 무엇인가")).toBe("");
    expect(suggestSlug("검색 의도란 무엇인가", "search intent")).toBe("search-intent");
    expect(suggestSlug("2026년 정리")).toBe("");
  });
});

describe("날짜 (한국 시간)", () => {
  // UTC 15:30 = 한국 시간 다음 날 00:30
  const value = "2026-11-18T15:30:00.000Z";

  it("UTC가 아니라 한국 날짜로 표시한다", () => {
    expect(formatDate(value)).toBe("2026년 11월 19일");
    expect(formatDateDots(value)).toBe("2026.11.19");
    expect(toDateAttr(value)).toBe("2026-11-19");
  });

  it("구조화 데이터용 ISO 문자열에 +09:00을 붙인다", () => {
    expect(toKstIso(value)).toBe("2026-11-19T00:30:00+09:00");
    expect(toKstIso(new Date("2026-01-01T00:00:00+09:00"))).toBe("2026-01-01T00:00:00+09:00");
  });
});
