import Link from "next/link";
import { ArticleSections } from "@/components/post/ArticleSections";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { TocList } from "@/components/post/Toc";
import { TocSpy } from "@/components/post/TocSpy";
import { getCategory } from "@/constant";
import { buildToc } from "@/lib/content/toc";
import type { ArticleProps } from "../types";
import { PosterCard } from "./parts";

export function Article({ links, post, related }: ArticleProps) {
  const category = getCategory(post.category);
  const toc = buildToc(post.outline);

  return (
    <>
      <article className="pro-article" data-cat={post.category}>
        <div className="scroll-progress" aria-hidden="true" />

        <header className="pro-article__head">
          <div className="pro-read">
            <p className="pro-kicker">
              <Link href={links.category(post.category)}>{category.label}</Link>
              <PostDate value={post.publishedAt} />
              <span>읽는 시간 {post.readingMinutes}분</span>
            </p>
            <h1
              className="pro-article__title"
              data-empty={post.title.trim() ? undefined : ""}
              data-placeholder="제목을 입력하세요"
            >
              {post.title}
            </h1>
            {post.summary && <p className="pro-article__lead">{post.summary}</p>}
          </div>
        </header>

        <div className="pro-article__cover">
          <PostCover post={post} priority label={false} />
        </div>

        <div className="pro-article__layout">
          {toc.length > 1 && (
            <nav className="pro-toc" aria-label="목차">
              <p className="pro-toc__title">목차</p>
              <TocList items={toc} />
            </nav>
          )}

          <div className="pro-article__body">
            <ArticleSections post={post} />

            {post.tags.length > 0 && (
              <ul className="pro-tags" aria-label="태그">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <TocSpy />
      </article>

      {related.length > 0 && (
        <section className="pro-related" aria-labelledby="pro-related-title">
          <div className="pro-wrap">
            <h2 id="pro-related-title" className="pro-heading">
              이어서 읽기.
            </h2>
            <div className="pro-related__grid">
              {related.map((item) => (
                <PosterCard key={item.id} post={item} links={links} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
