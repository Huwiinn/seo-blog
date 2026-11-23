import { CATEGORIES, type CategoryId } from "@/constant";
import type { PostCard, SiteData } from "@/lib/posts/types";

export function postsOf(site: SiteData, category: CategoryId): PostCard[] {
  return site.posts.filter((post) => post.category === category);
}

export function countOf(site: SiteData, category: CategoryId): number {
  return postsOf(site, category).length;
}

/** 추천 글이 먼저, 그다음 최신 글 */
export function featuredFirst(site: SiteData): PostCard[] {
  const featured = site.posts.filter((post) => post.featured);
  const rest = site.posts.filter((post) => !post.featured);
  return [...featured, ...rest];
}

export function groupByCategory(site: SiteData) {
  return CATEGORIES.map((category) => ({
    category,
    posts: postsOf(site, category.id),
  }));
}

export interface TabbedPost {
  post: PostCard;
  /** "전체" 탭에서도 보이는 글인지 */
  inAll: boolean;
}

/**
 * 주제 탭으로 거르는 목록에 넣을 글. "전체" 탭에는 최신 글 all개를 보여 주고,
 * 각 주제 탭에서도 빈 화면이 나오지 않도록 주제별 최신 글 perCategory개를 함께 싣는다.
 */
export function tabbedPosts(site: SiteData, all = 6, perCategory = 3): TabbedPost[] {
  const top = new Set(site.posts.slice(0, all).map((post) => post.id));
  const extra = new Set(
    CATEGORIES.flatMap((category) =>
      postsOf(site, category.id)
        .slice(0, perCategory)
        .map((post) => post.id),
    ),
  );
  return site.posts
    .filter((post) => top.has(post.id) || extra.has(post.id))
    .map((post) => ({ post, inAll: top.has(post.id) }));
}

/** 주제 탭 목록 ("전체" + 네 주제) */
export const CATEGORY_TABS = [
  { id: "all", label: "전체" },
  ...CATEGORIES.map((category) => ({ id: category.id as string, label: category.label as string })),
];
