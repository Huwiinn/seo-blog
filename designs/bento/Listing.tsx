import Link from "next/link";
import { CATEGORIES, getCategory, SITE } from "@/constant";
import type { ListingProps } from "../types";
import { FeatureTile, PostTile } from "./parts";

export function Listing({ links, category, posts }: ListingProps) {
  const info = category ? getCategory(category) : null;
  const [first, ...rest] = posts;

  return (
    <>
      <section className="bn-hero bn-hero--listing" data-cat={category}>
        <div className="bn-wrap">
          <p className="bn-eyebrow">{info ? info.name : "아카이브"}</p>
          <h1 className="bn-hero__headline">{info ? info.label : "전체 글"}</h1>
          <p className="bn-hero__desc">
            {info ? info.description : `${SITE.name}의 모든 글을 최신순으로 모았습니다.`}
          </p>
          <nav className="bn-filter" aria-label="주제 필터">
            <Link href={links.posts} aria-current={category ? undefined : "page"}>
              전체
            </Link>
            {CATEGORIES.map((item) => (
              <Link
                key={item.id}
                href={links.category(item.id)}
                data-cat={item.id}
                aria-current={item.id === category ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="bn-section" aria-label="글 목록">
        <div className="bn-wrap">
          {!first ? (
            <p className="bn-empty">이 주제에는 아직 글이 없습니다.</p>
          ) : (
            <div className="bn-bento bn-bento--listing">
              <FeatureTile post={first} links={links} as="h2" />
              {rest.map((post) => (
                <div key={post.id} className="bn-bento__post">
                  <PostTile post={post} links={links} as="h2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
