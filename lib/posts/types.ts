import type { CategoryId } from "../../constant/categories";
import type { OutlineItem } from "../content/anchors";
import type { CoverImage, PostContent } from "../content/types";

/** 목록·카드에 쓰는 글 정보. 서버→클라이언트로 넘길 수 있도록 날짜는 ISO 문자열이다. */
export interface PostCard {
  id: string;
  slug: string;
  category: CategoryId;
  title: string;
  summary: string;
  tags: string[];
  cover: CoverImage | null;
  featured: boolean;
  publishedAt: string | null;
  modifiedAt: string | null;
  readingMinutes: number;
}

/** 글 상세에 쓰는 전체 정보 */
export interface PostArticle extends PostCard {
  content: PostContent;
  outline: OutlineItem[];
  charCount: number;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
}

/** 디자인 컴포넌트에 넘기는 사이트 데이터 (발행 글, 최신순) */
export interface SiteData {
  posts: PostCard[];
}
