import type { ComponentType, ReactNode } from "react";
import type { CategoryId } from "@/constant";
import type { PostArticle, PostCard, SiteData } from "@/lib/posts/types";

export type DesignId = "newsroom" | "pro" | "docs" | "bento" | "glass";

/**
 * 시안 안에서 쓰는 주소. 운영 사이트(/posts/…), 시안 갤러리(/designs/pro/posts/…),
 * 에디터 미리보기(이동 없음)가 같은 컴포넌트를 쓰도록 주소 만드는 법을 밖에서 넘긴다.
 */
export interface DesignLinks {
  home: string;
  posts: string;
  category: (id: CategoryId) => string;
  post: (slug: string) => string;
}

export interface PageContext {
  page: "home" | "posts" | "category" | "post" | "not-found";
  category?: CategoryId;
  /** 글 상세일 때 현재 글의 슬러그 (사이드바에서 현재 글 표시용) */
  slug?: string;
}

interface BaseProps {
  links: DesignLinks;
  /** 발행 글 전체 (최신순) */
  site: SiteData;
}

export interface ShellProps extends BaseProps {
  current: PageContext;
  children: ReactNode;
}

export type HomeProps = BaseProps;

export interface ListingProps extends BaseProps {
  /** 없으면 전체 글 목록 */
  category?: CategoryId;
  posts: PostCard[];
}

export interface ArticleProps extends BaseProps {
  post: PostArticle;
  related: PostCard[];
  /** 같은 카테고리의 이전(더 오래된)·다음(더 최근) 글 */
  previous: PostCard | null;
  next: PostCard | null;
}

/**
 * 시안 하나. 네 컴포넌트는 모두 순수(props → JSX)여야 한다.
 * 훅이나 서버 전용 모듈을 쓰지 않아야 서버 페이지와 에디터 미리보기에서 함께 쓸 수 있다.
 * 상호작용이 필요하면 작은 "use client" 컴포넌트로 분리한다.
 */
export interface DesignTheme {
  id: DesignId;
  /** 시안 이름 (A. Newsroom 등) */
  name: string;
  /** 참고한 Apple 페이지 유형 */
  reference: string;
  description: string;
  Shell: ComponentType<ShellProps>;
  Home: ComponentType<HomeProps>;
  Listing: ComponentType<ListingProps>;
  Article: ComponentType<ArticleProps>;
}
