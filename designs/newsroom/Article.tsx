import Link from "next/link";
import { ArticleSections } from "@/components/post/ArticleSections";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { TocList } from "@/components/post/Toc";
import { getCategory } from "@/constant";
import { buildToc } from "@/lib/content/toc";
import { toDateAttr } from "@/lib/format";
import type { ArticleProps } from "../types";
import { Tile } from "./parts";

export function Article({ links, post, related }: ArticleProps) {
  const category = getCategory(post.category);
  const toc = buildToc(post.outline);
  const updated =
    post.publishedAt &&
    post.modifiedAt &&
    toDateAttr(post.modifiedAt) !== toDateAttr(post.publishedAt);

  return (
    <>
      <article className="nr-article">
        <div className="scroll-progress" aria-hidden="true" />
        <header className="nr-article__head">
          <div className="nr-read">
            <p className="nr-article__kicker" data-cat={post.category}>
              <Link href={links.category(post.category)}>{category.label}</Link>
              <PostDate value={post.publishedAt} />
            </p>
            <h1
              className="nr-article__title"
              data-empty={post.title.trim() ? undefined : ""}
              data-placeholder="제목을 입력하세요"
            >
              {post.title}
            </h1>
            {post.summary && <p className="nr-article__lead">{post.summary}</p>}
            <p className="nr-article__meta">
              읽는 시간 약 {post.readingMinutes}분
              {updated && (
                <>
                  {" · "}
                  <PostDate value={post.modifiedAt} /> 업데이트
                </>
              )}
            </p>
          </div>
        </header>

        <div className="nr-article__cover">
          <PostCover post={post} priority label={false} />
        </div>

        <div className="nr-read">
          {toc.length > 1 && (
            <nav aria-label="목차">
              <details className="nr-toc" open>
                <summary>목차</summary>
                <TocList items={toc} />
              </details>
            </nav>
          )}

          <ArticleSections post={post} />

          {post.tags.length > 0 && (
            <ul className="nr-tags" aria-label="태그">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="nr-band" aria-labelledby="nr-related-title">
          <div className="nr-wrap">
            <div className="nr-section-head">
              <h2 id="nr-related-title">관련 글</h2>
              <Link className="nr-more" href={links.category(post.category)}>
                {category.label} 글 더 보기
              </Link>
            </div>
            <div className="nr-grid">
              {related.map((item) => (
                <Tile key={item.id} post={item} links={links} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
