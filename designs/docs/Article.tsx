import Link from "next/link";
import { ArticleSections } from "@/components/post/ArticleSections";
import { PostDate } from "@/components/post/PostDate";
import { PreferredSourceLink } from "@/components/post/PreferredSourceLink";
import { TocList } from "@/components/post/Toc";
import { TocSpy } from "@/components/post/TocSpy";
import { getCategory } from "@/constant";
import { buildToc } from "@/lib/content/toc";
import { toDateAttr } from "@/lib/format";
import type { ArticleProps } from "../types";

export function Article({ links, post, previous, next }: ArticleProps) {
  const category = getCategory(post.category);
  const toc = buildToc(post.outline);
  const updated =
    post.publishedAt &&
    post.modifiedAt &&
    toDateAttr(post.modifiedAt) !== toDateAttr(post.publishedAt);

  return (
    <div className="docs-article-layout" data-cat={post.category}>
      <div className="scroll-progress" aria-hidden="true" />

      <article className="docs-article">
        <nav className="docs-crumbs" aria-label="현재 위치">
          <ol>
            <li>
              <Link href={links.home}>홈</Link>
            </li>
            <li>
              <Link href={links.category(post.category)}>{category.label}</Link>
            </li>
            <li aria-current="page">{post.title || "제목 없음"}</li>
          </ol>
        </nav>

        <h1
          className="docs-title"
          data-empty={post.title.trim() ? undefined : ""}
          data-placeholder="제목을 입력하세요"
        >
          {post.title}
        </h1>
        <p className="docs-article__meta">
          <PostDate value={post.publishedAt} /> 발행
          {updated && (
            <>
              {" · "}
              <PostDate value={post.modifiedAt} /> 업데이트
            </>
          )}
          {" · "}읽는 시간 {post.readingMinutes}분
        </p>
        <PreferredSourceLink className="docs-preferred-source" />

        {post.summary && (
          <div className="docs-callout" role="note" aria-label="핵심 요약">
            <p className="docs-callout__label">핵심 요약</p>
            <p>{post.summary}</p>
          </div>
        )}

        {toc.length > 1 && (
          <nav className="docs-toc-inline" aria-label="목차">
            <details>
              <summary>이 페이지에서</summary>
              <TocList items={toc} />
            </details>
          </nav>
        )}

        <ArticleSections post={post} />

        {post.tags.length > 0 && (
          <ul className="docs-chips docs-chips--tags" aria-label="태그">
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}

        {(previous || next) && (
          <nav className="docs-pager" aria-label="이전·다음 글">
            {previous ? (
              <Link href={links.post(previous.slug)} className="docs-pager__link" rel="prev">
                <span>이전 글</span>
                {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={links.post(next.slug)}
                className="docs-pager__link docs-pager__link--next"
                rel="next"
              >
                <span>다음 글</span>
                {next.title}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </article>

      {toc.length > 1 && (
        <aside className="docs-onpage">
          <nav aria-label="이 페이지에서">
            <p className="docs-onpage__title">이 페이지에서</p>
            <TocList items={toc} />
          </nav>
        </aside>
      )}
      <TocSpy />
    </div>
  );
}
