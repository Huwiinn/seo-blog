import type { CategoryId } from "../../constant/categories";
import { buildOutline } from "../content/anchors";
import {
  contentBodyText,
  countCharacters,
  estimateReadingMinutes,
} from "../content/text";
import type { CoverImage, PostContent } from "../content/types";
import { SEO_RULES } from "../seo/rules";
import type { PostArticle, PostCard } from "./types";

/** DB 행과 에디터 초안이 공통으로 가진 필드 */
export interface PostSource {
  id: string;
  slug: string | null;
  category: CategoryId;
  title: string;
  summary: string;
  tags: string[];
  coverImage: CoverImage | null;
  featured: boolean;
  content: PostContent;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  publishedAt?: Date | string | number | null;
  modifiedAt?: Date | string | number | null;
}

function toIso(value: Date | string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function readingStats(content: PostContent) {
  const charCount = countCharacters(contentBodyText(content));
  return {
    charCount,
    readingMinutes: estimateReadingMinutes(charCount, SEO_RULES.reading.charsPerMinute),
  };
}

export function toPostCard(source: PostSource): PostCard {
  return {
    id: source.id,
    slug: source.slug ?? "",
    category: source.category,
    title: source.title,
    summary: source.summary,
    tags: source.tags,
    cover: source.coverImage,
    featured: source.featured,
    publishedAt: toIso(source.publishedAt),
    modifiedAt: toIso(source.modifiedAt),
    readingMinutes: readingStats(source.content).readingMinutes,
  };
}

export function toPostArticle(source: PostSource): PostArticle {
  const stats = readingStats(source.content);
  return {
    ...toPostCard(source),
    readingMinutes: stats.readingMinutes,
    charCount: stats.charCount,
    content: source.content,
    outline: buildOutline(source.content),
    metaTitle: source.metaTitle,
    metaDescription: source.metaDescription,
    focusKeyword: source.focusKeyword,
  };
}
