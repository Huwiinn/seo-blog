import Link from "next/link";
import { CATEGORIES, getCategory, SITE } from "@/constant";
import type { ListingProps } from "../types";
import { EmptyState, Tile } from "./parts";

export function Listing({ links, category, posts }: ListingProps) {
  const info = category ? getCategory(category) : null;

  return (
    <>
      <section className="nr-listing-head">
        <div className="nr-wrap">
          <p className="nr-eyebrow">{info ? info.name : "아카이브"}</p>
          <h1 className="nr-listing-head__title">{info ? info.label : "전체 글"}</h1>
          <p className="nr-listing-head__desc">
            {info ? info.description : `${SITE.name}의 모든 글을 최신순으로 모았습니다.`}
          </p>
          <nav className="nr-filter" aria-label="주제 필터">
            <Link href={links.posts} aria-current={category ? undefined : "page"}>
              전체
            </Link>
            {CATEGORIES.map((item) => (
              <Link
                key={item.id}
                href={links.category(item.id)}
                aria-current={item.id === category ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="nr-band nr-band--flush" aria-label="글 목록">
        <div className="nr-wrap">
          {posts.length === 0 ? (
            <EmptyState>이 주제에는 아직 글이 없습니다.</EmptyState>
          ) : (
            <div className="nr-grid">
              {posts.map((post) => (
                <Tile key={post.id} post={post} links={links} as="h2" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
