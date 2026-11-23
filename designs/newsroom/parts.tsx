import Link from "next/link";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { getCategory } from "@/constant";
import type { PostCard } from "@/lib/posts/types";
import type { DesignLinks } from "../types";

interface TileProps {
  post: PostCard;
  links: DesignLinks;
  size?: "regular" | "large";
  /** 타일 제목의 제목 수준 (페이지의 제목 계층에 맞춘다) */
  as?: "h2" | "h3";
}

/** Newsroom 타일: 커버 + 카테고리 + 제목 + 날짜. 카드 전체가 제목 링크의 클릭 영역이다. */
export function Tile({ post, links, size = "regular", as: Heading = "h3" }: TileProps) {
  return (
    <article className="nr-tile hover-lift" data-size={size}>
      <PostCover post={post} className="nr-tile__cover" />
      <div className="nr-tile__body">
        <p className="nr-eyebrow">{getCategory(post.category).label}</p>
        <Heading className="nr-tile__title">
          <Link href={links.post(post.slug)} className="nr-stretch">
            {post.title}
          </Link>
        </Heading>
        <PostDate className="nr-date" value={post.publishedAt} />
      </div>
    </article>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="nr-empty">{children}</p>;
}
