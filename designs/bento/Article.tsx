import Link from "next/link";
import { ArticleSections } from "@/components/post/ArticleSections";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { TocList } from "@/components/post/Toc";
import { getCategory } from "@/constant";
import { buildToc } from "@/lib/content/toc";
import type { ArticleProps } from "../types";
import { PostTile } from "./parts";

export function Article({ links, post, related }: ArticleProps) {
  const category = getCategory(post.category);
  const toc = buildToc(post.outline);

  return (
    <>
      <article className="bn-article" data-cat={post.category}>
        <div className="scroll-progress" aria-hidden="true" />

        <header className="bn-article__head">
          <div className="bn-wrap">
            <p className="bn-article__kicker">
              <Link href={links.category(post.category)}>{category.label}</Link>
              <PostDate value={post.publishedAt} />
            </p>
            <h1
              className="bn-article__title"
              data-empty={post.title.trim() ? undefined : ""}
              data-placeholder="제목을 입력하세요"
            >
              {post.title}
            </h1>
          </div>
        </header>

        {/* 글의 핵심을 먼저 보여 주는 요약 벤토 */}
        <div className="bn-wrap">
          <div className="bn-brief">
            <div className="bn-card bn-brief__summary">
              <p className="bn-eyebrow">핵심 요약</p>
              <p className="bn-brief__text">
                {post.summary || "핵심 요약을 입력하면 여기에 표시됩니다."}
              </p>
            </div>
            <div className="bn-brief__cover">
              <PostCover post={post} priority label={false} />
            </div>
            <div className="bn-card bn-brief__stat">
              <p className="bn-eyebrow">읽는 시간</p>
              <p className="bn-brief__number">
                {post.readingMinutes}
                <span>분</span>
              </p>
              <p className="bn-brief__note">본문 {post.charCount.toLocaleString("ko-KR")}자</p>
            </div>
            {toc.length > 0 && (
              <nav className="bn-card bn-brief__toc" aria-label="목차">
                <p className="bn-eyebrow">목차</p>
                <TocList items={toc} />
              </nav>
            )}
          </div>
        </div>

        <div className="bn-article__body">
          <ArticleSections post={post} />

          {post.tags.length > 0 && (
            <ul className="bn-tags" aria-label="태그">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="bn-section" aria-labelledby="bn-related-title">
          <div className="bn-wrap">
            <div className="bn-section__head">
              <h2 id="bn-related-title" className="bn-h2">
                관련 글
              </h2>
              <Link className="bn-link" href={links.category(post.category)}>
                {category.label} 글 더 보기
              </Link>
            </div>
            <div className="bn-posts">
              {related.map((item) => (
                <div key={item.id} className="bn-posts__item">
                  <PostTile post={item} links={links} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
