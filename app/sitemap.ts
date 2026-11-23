import type { MetadataRoute } from "next";
import { CATEGORIES, absoluteUrl } from "@/constant";
import { getPublishedPosts } from "@/lib/posts/queries";
import type { PostCard } from "@/lib/posts/types";

function lastModified(posts: PostCard[]): Date | undefined {
  const times = posts
    .map((post) => post.modifiedAt ?? post.publishedAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime());
  return times.length > 0 ? new Date(Math.max(...times)) : undefined;
}

/** 색인되길 바라는 대표 URL만 싣는다 (홈, 주제, 발행 글). 시안 갤러리·에디터는 제외. */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();

  return [
    { url: absoluteUrl("/"), lastModified: lastModified(posts) },
    { url: absoluteUrl("/posts"), lastModified: lastModified(posts) },
    ...CATEGORIES.map((category) => ({
      url: absoluteUrl(`/${category.id}`),
      lastModified: lastModified(posts.filter((post) => post.category === category.id)),
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/posts/${post.slug}`),
      lastModified: lastModified([post]),
    })),
  ];
}
