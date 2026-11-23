import { getPublishedPosts } from "@/lib/posts/queries";
import { buildRssFeed } from "@/lib/seo/rss";

/** 빌드 때 한 번 만들어 정적 파일로 배포한다 (글은 로컬에서 쓰고 배포 때 반영된다). */
export const dynamic = "force-static";

export function GET() {
  return new Response(buildRssFeed(getPublishedPosts()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
