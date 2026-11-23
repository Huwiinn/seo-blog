import Link from "next/link";
import { Accordion } from "@/components/motion/Accordion";
import { FilterTabs } from "@/components/motion/FilterTabs";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { getCategory, SITE } from "@/constant";
import { HOME_FAQ } from "@/constant/home";
import { CATEGORY_TABS, featuredFirst, groupByCategory, tabbedPosts } from "../data";
import type { HomeProps } from "../types";
import { EmptyState, Tile } from "./parts";

/**
 * 홈 배치 (위 → 아래)
 *  1. 마스트헤드: 사이트 이름(H1)과 한 줄 소개
 *  2. 주요 글: 큰 카드 하나 — Hover lift
 *  3. 최신 글: 주제 탭(Slide Tabs)으로 그 자리에서 거르는 타일 그리드 — Hover lift
 *  4. 주제별로 보기: 네 주제의 설명과 대표 글
 *  5. 자주 묻는 질문 — Accordion
 */
export function Home({ links, site }: HomeProps) {
  const [top] = featuredFirst(site);
  const tabbed = tabbedPosts(site);

  return (
    <>
      <section className="nr-masthead">
        <div className="nr-wrap">
          <h1 className="nr-masthead__title">{SITE.name}</h1>
          <p className="nr-masthead__tagline">{SITE.tagline}</p>
        </div>
      </section>

      {!top ? (
        <div className="nr-wrap">
          <EmptyState>아직 발행한 글이 없습니다.</EmptyState>
        </div>
      ) : (
        <section className="nr-top" aria-labelledby="nr-top-title">
          <div className="nr-wrap">
            <h2 id="nr-top-title" className="visually-hidden">
              주요 글
            </h2>
            <article className="nr-hero-card hover-lift">
              <PostCover post={top} priority className="nr-hero-card__cover" />
              <div className="nr-hero-card__body">
                <p className="nr-eyebrow">{getCategory(top.category).label}</p>
                <h3 className="nr-hero-card__title">
                  <Link href={links.post(top.slug)} className="nr-stretch">
                    {top.title}
                  </Link>
                </h3>
                <p className="nr-hero-card__summary">{top.summary}</p>
                <PostDate className="nr-date" value={top.publishedAt} />
              </div>
            </article>
          </div>
        </section>
      )}

      {tabbed.length > 0 && (
        <section className="nr-band" aria-labelledby="nr-latest-title">
          <div className="nr-wrap">
            <div className="nr-section-head">
              <h2 id="nr-latest-title">최신 글</h2>
              <Link className="nr-more" href={links.posts}>
                전체 글 보기
              </Link>
            </div>
            <FilterTabs
              tabs={CATEGORY_TABS}
              target="nr-latest-grid"
              variant="slide"
              label="주제별로 보기"
              className="nr-tabs"
            />
            <div id="nr-latest-grid" className="nr-grid" data-filter-list="">
              {tabbed.map(({ post, inAll }) => (
                <div
                  key={post.id}
                  className="nr-grid__item"
                  data-filter-item={post.category}
                  data-filter-all={inAll ? "" : undefined}
                >
                  <Tile post={post} links={links} />
                </div>
              ))}
              <p className="nr-empty" data-filter-empty="" hidden>
                이 주제에는 아직 글이 없습니다.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="nr-topics" aria-labelledby="nr-topics-title">
        <div className="nr-wrap">
          <div className="nr-section-head">
            <h2 id="nr-topics-title">주제별로 보기</h2>
          </div>
          <div className="nr-topics__grid">
            {groupByCategory(site).map(({ category, posts }) => (
              <div key={category.id} className="nr-topic" data-cat={category.id}>
                <h3 className="nr-topic__title">
                  <Link href={links.category(category.id)}>{category.label}</Link>
                  <span>{category.name}</span>
                </h3>
                <p className="nr-topic__desc">{category.description}</p>
                {posts.length > 0 && (
                  <ul className="nr-topic__list">
                    {posts.slice(0, 3).map((post) => (
                      <li key={post.id}>
                        <Link href={links.post(post.slug)}>{post.title}</Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link className="nr-more" href={links.category(category.id)}>
                  {category.label} 글 {posts.length}개 보기
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nr-faq" aria-labelledby="nr-faq-title">
        <div className="nr-wrap nr-faq__grid">
          <h2 id="nr-faq-title" className="nr-faq__title">
            자주 묻는 질문
          </h2>
          <Accordion items={HOME_FAQ} name="nr-faq" />
        </div>
      </section>
    </>
  );
}
