import Link from "next/link";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { getCategory } from "@/constant";
import type { PostCard } from "@/lib/posts/types";
import type { DesignLinks } from "../types";

/** 흰 카드형 글 항목 — Hover lift */
export function PostTile({
  post,
  links,
  as: Heading = "h3",
  cover = false,
}: {
  post: PostCard;
  links: DesignLinks;
  as?: "h2" | "h3";
  cover?: boolean;
}) {
  return (
    <article className="bn-card bn-post hover-lift" data-cat={post.category}>
      {cover && <PostCover post={post} label={false} className="bn-post__cover" />}
      <p className="bn-eyebrow">{getCategory(post.category).label}</p>
      <Heading className="bn-post__title">
        <Link href={links.post(post.slug)} className="bn-stretch">
          {post.title}
        </Link>
      </Heading>
      <p className="bn-post__summary">{post.summary}</p>
      <p className="bn-post__meta">
        <PostDate value={post.publishedAt} />
        <span>{post.readingMinutes}분</span>
      </p>
    </article>
  );
}

/** 커버 위에 제목을 올린 큰 카드 */
export function FeatureTile({
  post,
  links,
  as: Heading = "h3",
}: {
  post: PostCard;
  links: DesignLinks;
  as?: "h2" | "h3";
}) {
  return (
    <article className="bn-card bn-feature hover-lift" data-cat={post.category}>
      <PostCover post={post} priority label={false} className="bn-feature__cover" />
      <div className="bn-feature__body">
        <p className="bn-feature__eyebrow">추천 · {getCategory(post.category).label}</p>
        <Heading className="bn-feature__title">
          <Link href={links.post(post.slug)} className="bn-stretch">
            {post.title}
          </Link>
        </Heading>
        <p className="bn-feature__summary">{post.summary}</p>
      </div>
    </article>
  );
}
