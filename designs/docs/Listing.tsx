import Link from "next/link";
import { PostDate } from "@/components/post/PostDate";
import { getCategory, SITE } from "@/constant";
import type { ListingProps } from "../types";

export function Listing({ links, category, posts }: ListingProps) {
  const info = category ? getCategory(category) : null;

  return (
    <div className="docs-page" data-cat={category}>
      <nav className="docs-crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href={links.home}>홈</Link>
          </li>
          <li aria-current="page">{info ? info.label : "전체 글"}</li>
        </ol>
      </nav>

      <header className="docs-hero">
        <h1 className="docs-title">{info ? `${info.label} · ${info.name}` : "전체 글"}</h1>
        <p className="docs-lead">
          {info ? info.description : `${SITE.name}의 모든 글을 최신순으로 모았습니다.`}
        </p>
        {info && (
          <ul className="docs-chips" aria-label="다루는 내용">
            {info.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        )}
      </header>

      {posts.length === 0 ? (
        <p className="docs-empty">이 주제에는 아직 글이 없습니다.</p>
      ) : (
        <ul className="docs-list">
          {posts.map((post) => (
            <li key={post.id} data-cat={post.category}>
              <article>
                <h2 className="docs-list__title">
                  <Link href={links.post(post.slug)}>{post.title}</Link>
                </h2>
                <p className="docs-list__summary">{post.summary}</p>
                <p className="docs-list__meta">
                  {!category && (
                    <span className="docs-badge">{getCategory(post.category).label}</span>
                  )}
                  <PostDate value={post.publishedAt} />
                  <span>읽는 시간 {post.readingMinutes}분</span>
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
