import { SITE, absoluteUrl, getCategory } from "@/constant";
import type { PostCard } from "@/lib/posts/types";

/** RSS에 싣는 최대 글 수 (최신순) */
export const FEED_LIMIT = 50;
export const FEED_PATH = "/feed.xml";

/** XML 1.0에서 허용하지 않는 제어 문자를 지우고 특수 문자를 이스케이프한다. */
export function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 날짜 형식 (RFC 822). 예: Mon, 23 Nov 2026 01:00:00 GMT */
function rfc822(iso: string): string {
  return new Date(iso).toUTCString();
}

function latest(posts: PostCard[]): string | null {
  let max: string | null = null;
  for (const post of posts) {
    const value = post.modifiedAt ?? post.publishedAt;
    if (value && (!max || new Date(value) > new Date(max))) max = value;
  }
  return max;
}

/** 발행 글(최신순)로 RSS 2.0 문서를 만든다. */
export function buildRssFeed(posts: PostCard[], limit = FEED_LIMIT): string {
  const items = posts
    .filter((post) => post.publishedAt)
    .slice(0, limit)
    .map((post) => {
      const url = absoluteUrl(`/posts/${post.slug}`);
      const category = getCategory(post.category);
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        `      <category>${escapeXml(category.label)}</category>`,
        `      <pubDate>${rfc822(post.publishedAt as string)}</pubDate>`,
        "    </item>",
      ].join("\n");
    });

  const updated = latest(posts);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(SITE.name)}</title>`,
    `    <link>${escapeXml(absoluteUrl("/"))}</link>`,
    `    <description>${escapeXml(SITE.description)}</description>`,
    "    <language>ko-KR</language>",
    ...(updated ? [`    <lastBuildDate>${rfc822(updated)}</lastBuildDate>`] : []),
    `    <atom:link href="${escapeXml(absoluteUrl(FEED_PATH))}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
