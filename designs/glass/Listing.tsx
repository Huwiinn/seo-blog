import Link from "next/link";
import { CATEGORIES, getCategory, SITE } from "@/constant";
import type { ListingProps } from "../types";
import { GlassPost } from "./parts";

export function Listing({ links, category, posts }: ListingProps) {
  const info = category ? getCategory(category) : null;

  return (
    <>
      <section className="gl-hero gl-hero--listing" data-cat={category}>
        <div className="gl-wrap">
          <p className="gl-hero__kicker">{info ? info.name : "아카이브"}</p>
          <h1 className="gl-hero__headline">{info ? info.label : "전체 글"}</h1>
          <p className="gl-hero__desc">
            {info ? info.description : `${SITE.name}의 모든 글을 최신순으로 모았습니다.`}
          </p>
          <nav className="gl-filter gl-glass" aria-label="주제 필터">
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

      <section className="gl-section" aria-label="글 목록">
        <div className="gl-wrap">
          {posts.length === 0 ? (
            <p className="gl-empty">이 주제에는 아직 글이 없습니다.</p>
          ) : (
            <div className="gl-grid">
              {posts.map((post) => (
                <div key={post.id} className="gl-grid__item">
                  <GlassPost post={post} links={links} as="h2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
