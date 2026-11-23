import type { Metadata } from "next";
import { getCategory } from "@/constant";
import { toKstIso } from "@/lib/format";
import type { PostArticle } from "@/lib/posts/types";
import { resolvePostMeta } from "@/lib/seo/meta";
import { pageMetadata } from "./staticMetadata";

/** 글 상세 페이지의 메타데이터. 에디터의 검색 결과 미리보기와 같은 resolvePostMeta를 쓴다. */
export function buildPostMetadata(post: PostArticle): Metadata {
  const meta = resolvePostMeta(post);
  const modified = post.modifiedAt ?? post.publishedAt;
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
    image: post.cover
      ? {
          url: post.cover.src,
          width: post.cover.width,
          height: post.cover.height,
          alt: post.cover.alt || post.title,
        }
      : undefined,
    article: {
      publishedTime: post.publishedAt ? toKstIso(post.publishedAt) : undefined,
      modifiedTime: modified ? toKstIso(modified) : undefined,
      section: getCategory(post.category).label,
      tags: post.tags,
    },
  });
}
