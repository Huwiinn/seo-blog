import Link from "next/link";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { getCategory } from "@/constant";
import type { PostCard } from "@/lib/posts/types";
import type { DesignLinks } from "../types";

/** 유리 카드형 글 항목 — Hover lift */
export function GlassPost({
  post,
  links,
  as: Heading = "h3",
  cover = true,
}: {
  post: PostCard;
  links: DesignLinks;
  as?: "h2" | "h3";
  cover?: boolean;
}) {
  return (
    <article className="gl-glass gl-post hover-lift" data-cat={post.category}>
      {cover && <PostCover post={post} label={false} className="gl-post__cover" />}
      <div className="gl-post__body">
        <p className="gl-chip">
          <span className="gl-chip__dot" aria-hidden="true" />
          {getCategory(post.category).label}
        </p>
        <Heading className="gl-post__title">
          <Link href={links.post(post.slug)} className="gl-stretch">
            {post.title}
          </Link>
        </Heading>
        <p className="gl-post__summary">{post.summary}</p>
        <p className="gl-post__meta">
          <PostDate value={post.publishedAt} />
          <span>{post.readingMinutes}분</span>
        </p>
      </div>
    </article>
  );
}
