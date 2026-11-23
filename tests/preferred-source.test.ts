import { describe, expect, it } from "vitest";
import { preferredSourceDomain, preferredSourceUrl } from "@/lib/seo/preferred-source";

describe("preferred source deeplink", () => {
  it("사이트 URL에서 www·스킴·경로를 뺀 도메인만 쓴다", () => {
    expect(preferredSourceDomain("https://www.seo-blog.site")).toBe("seo-blog.site");
    expect(preferredSourceDomain("https://code.example.com/blog/")).toBe("code.example.com");
  });

  it("구글 선호 매체 딥링크 형식을 따른다", () => {
    expect(preferredSourceUrl("https://www.seo-blog.site")).toBe(
      "https://www.google.com/preferences/source?q=seo-blog.site",
    );
  });

  it("기본값은 SITE.url", () => {
    expect(preferredSourceUrl()).toBe("https://www.google.com/preferences/source?q=seo-blog.site");
  });
});
