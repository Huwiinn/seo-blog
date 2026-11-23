import Link from "next/link";
import { ArticleSections } from "@/components/post/ArticleSections";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { TocList } from "@/components/post/Toc";
import { TocSpy } from "@/components/post/TocSpy";
import { getCategory } from "@/constant";
import { buildToc } from "@/lib/content/toc";
import type { ArticleProps } from "../types";
import { GlassPost } from "./parts";

export function Article({ links, post, related }: ArticleProps) {
  const category = getCategory(post.category);
  const toc = buildToc(post.outline);

  return (
    <>
      <article className="gl-article" data-cat={post.category}>
        <div className="scroll-progress" aria-hidden="true" />

        <header className="gl-article__head">
          <div className="gl-read">
            <p className="gl-article__kicker">
              <Link href={links.category(post.category)} className="gl-chip gl-glass">
                <span className="gl-chip__dot" aria-hidden="true" />
                {category.label}
              </Link>
              <PostDate value={post.publishedAt} />
              <span>읽는 시간 {post.readingMinutes}분</span>
            </p>
            <h1
              className="gl-article__title"
              data-empty={post.title.trim() ? undefined : ""}
              data-placeholder="제목을 입력하세요"
            >
              {post.title}
            </h1>
            {post.summary && <p className="gl-article__lead">{post.summary}</p>}
          </div>
        </header>

        <div className="gl-article__layout">
          <div className="gl-glass gl-sheet">
            <div className="gl-sheet__cover">
              <PostCover post={post} priority label={false} />
            </div>

            {toc.length > 1 && (
              <nav className="gl-toc-inline" aria-label="목차">
                <details>
                  <summary>목차</summary>
                  <TocList items={toc} />
                </details>
              </nav>
            )}

            <ArticleSections post={post} />

            {post.tags.length > 0 && (
              <ul className="gl-tags" aria-label="태그">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>

          {toc.length > 1 && (
            <aside className="gl-glass gl-toc">
              <nav aria-label="목차">
                <p className="gl-toc__title">목차</p>
                <TocList items={toc} />
              </nav>
            </aside>
          )}
        </div>
        <TocSpy />
      </article>

      {related.length > 0 && (
        <section className="gl-section" aria-labelledby="gl-related-title">
          <div className="gl-wrap">
            <div className="gl-section__head">
              <h2 id="gl-related-title" className="gl-h2">
                관련 글
              </h2>
              <Link className="gl-link" href={links.category(post.category)}>
                {category.label} 글 더 보기
              </Link>
            </div>
            <div className="gl-grid">
              {related.map((item) => (
                <div key={item.id} className="gl-grid__item">
                  <GlassPost post={item} links={links} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
