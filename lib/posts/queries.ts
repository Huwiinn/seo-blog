import "server-only";

import { and, desc, eq, ne } from "drizzle-orm";
import { cache } from "react";
import type { CategoryId } from "@/constant";
import { getDb, posts, type PostRow } from "@/lib/db";
import { toPostArticle, toPostCard } from "./mappers";
import type { PostArticle, PostCard, SiteData } from "./types";

/** 발행 글 전체 (최신순). 한 요청 안에서는 한 번만 조회한다. */
export const getPublishedRows = cache((): PostRow[] =>
  getDb()
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .all()
    .filter((row) => Boolean(row.slug)),
);

export const getPublishedPosts = cache((): PostCard[] =>
  getPublishedRows().map(toPostCard),
);

export function getSiteData(): SiteData {
  return { posts: getPublishedPosts() };
}

/**
 * 404 화면용. 운영 서버의 함수(예: 막아 둔 /admin 요청)에는 DB 파일이 없으므로,
 * 읽지 못하면 빈 목록으로 그려 404가 500으로 바뀌지 않게 한다.
 */
export function getSiteDataOrEmpty(): SiteData {
  try {
    return getSiteData();
  } catch {
    return { posts: [] };
  }
}

export function getPostsByCategory(category: CategoryId): PostCard[] {
  return getPublishedPosts().filter((post) => post.category === category);
}

export function getAllPublishedSlugs(): string[] {
  return getPublishedPosts().map((post) => post.slug);
}

export const getPostBySlug = cache((slug: string): PostArticle | null => {
  const row = getPublishedRows().find((item) => item.slug === slug);
  return row ? toPostArticle(row) : null;
});

/** 같은 카테고리 → 태그가 겹치는 글 → 최신 글 순으로 관련 글을 고른다. */
export function getRelatedPosts(post: PostCard, limit = 3): PostCard[] {
  const others = getPublishedPosts().filter((item) => item.id !== post.id);
  const score = (item: PostCard) =>
    (item.category === post.category ? 10 : 0) +
    item.tags.filter((tag) => post.tags.includes(tag)).length;
  return others
    .map((item, index) => ({ item, index, score: score(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.item);
}

/** 같은 카테고리 안에서의 이전(더 오래된)·다음(더 최근) 글 */
export function getAdjacentPosts(post: PostCard): {
  previous: PostCard | null;
  next: PostCard | null;
} {
  const list = getPostsByCategory(post.category);
  const index = list.findIndex((item) => item.id === post.id);
  if (index === -1) return { previous: null, next: null };
  return {
    next: index > 0 ? list[index - 1] : null,
    previous: index < list.length - 1 ? list[index + 1] : null,
  };
}

/* ───────── 관리자(에디터) 전용 ───────── */

export function getAllRows(): PostRow[] {
  return getDb().select().from(posts).orderBy(desc(posts.updatedAt)).all();
}

export function getRowById(id: string): PostRow | null {
  return getDb().select().from(posts).where(eq(posts.id, id)).get() ?? null;
}

/** 다른 글이 이미 쓰고 있는 슬러그 목록 */
export function getTakenSlugs(exceptId: string): string[] {
  return getDb()
    .select({ slug: posts.slug })
    .from(posts)
    .where(ne(posts.id, exceptId))
    .all()
    .map((row) => row.slug)
    .filter((slug): slug is string => Boolean(slug));
}

export function isSlugTaken(slug: string, exceptId: string): boolean {
  const row = getDb()
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, slug), ne(posts.id, exceptId)))
    .get();
  return Boolean(row);
}
