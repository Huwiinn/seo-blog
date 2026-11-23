import Link from "next/link";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { getCategory } from "@/constant";
import type { PostCard } from "@/lib/posts/types";
import type { DesignLinks } from "../types";

/** 가로 한 줄 글 항목: 큰 제목 + 요약 + 날짜. 어두운 배경의 목록에서 쓴다. */
export function Row({
  post,
  links,
  as: Heading = "h3",
  showCategory = false,
}: {
  post: PostCard;
  links: DesignLinks;
  as?: "h2" | "h3";
  showCategory?: boolean;
}) {
  return (
    <article className="pro-row" data-cat={post.category}>
      <div className="pro-row__text">
        <Heading className="pro-row__title">
          <Link href={links.post(post.slug)} className="pro-stretch">
            {post.title}
          </Link>
        </Heading>
        <p className="pro-row__summary">{post.summary}</p>
      </div>
      <p className="pro-row__meta">
        {showCategory && <span className="pro-row__cat">{getCategory(post.category).label}</span>}
        <PostDate value={post.publishedAt} />
        <span>{post.readingMinutes}분</span>
      </p>
      <span className="pro-row__arrow" aria-hidden="true" />
    </article>
  );
}

/** 커버 위에 제목을 올린 큰 카드 (하이라이트 레일·관련 글) */
export function PosterCard({
  post,
  links,
  as: Heading = "h3",
}: {
  post: PostCard;
  links: DesignLinks;
  as?: "h2" | "h3";
}) {
  return (
    <article className="pro-poster hover-lift" data-cat={post.category}>
      <PostCover post={post} label={false} className="pro-poster__cover" />
      <div className="pro-poster__body">
        <p className="pro-poster__cat">{getCategory(post.category).label}</p>
        <Heading className="pro-poster__title">
          <Link href={links.post(post.slug)} className="pro-stretch">
            {post.title}
          </Link>
        </Heading>
      </div>
    </article>
  );
}
