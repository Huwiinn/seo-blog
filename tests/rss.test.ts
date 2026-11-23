import { describe, expect, it } from "vitest";
import { buildRssFeed, escapeXml } from "@/lib/seo/rss";
import type { PostCard } from "@/lib/posts/types";

function card(over: Partial<PostCard>): PostCard {
  return {
    id: "a", slug: "a", category: "seo", title: "제목", summary: "요약", tags: [], cover: null,
    featured: false, publishedAt: "2026-11-20T00:00:00.000Z", modifiedAt: null, readingMinutes: 1, ...over,
  };
}

describe("rss", () => {
  it("특수 문자와 제어 문자를 처리한다", () => {
    expect(escapeXml(`a & <b> "c" 'd'${String.fromCharCode(1)}`)).toBe("a &amp; &lt;b&gt; &quot;c&quot; &apos;d&apos;");
  });

  it("발행 글만 싣고 링크·guid·날짜를 넣는다", () => {
    const xml = buildRssFeed([
      card({ slug: "first", title: "A & B" }),
      card({ id: "b", slug: "draft", publishedAt: null }),
    ]);
    expect(xml).toContain("<title>A &amp; B</title>");
    expect(xml).toContain('<guid isPermaLink="true">https://www.seo-blog.site/posts/first</guid>');
    expect(xml).toContain("<pubDate>Fri, 20 Nov 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain('rel="self"');
    expect(xml).not.toContain("/posts/draft");
  });

  it("최대 개수를 지킨다", () => {
    const posts = Array.from({ length: 5 }, (_, i) => card({ id: `p${i}`, slug: `p${i}` }));
    expect(buildRssFeed(posts, 2).match(/<item>/g)).toHaveLength(2);
  });
});
