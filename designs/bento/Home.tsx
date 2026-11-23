import type { CSSProperties } from "react";
import Link from "next/link";
import { Accordion } from "@/components/motion/Accordion";
import { FilterTabs } from "@/components/motion/FilterTabs";
import { DrawCircle } from "@/components/motion/Text";
import { SITE } from "@/constant";
import { HOME_FAQ } from "@/constant/home";
import { CATEGORY_TABS, featuredFirst, groupByCategory, tabbedPosts } from "../data";
import type { HomeProps } from "../types";
import { FeatureTile, PostTile } from "./parts";

/**
 * 홈 배치 (위 → 아래)
 *  1. 히어로: 사이트 이름(H1) + 강조 단어에 동그라미(Draw Circle Text) + 주 버튼(Dot Expand Button)
 *  2. 벤토 그리드: 추천 글 큰 카드 · 글 수 통계(Bar grow) · 주제 카드 4개(Flip card) — Hover lift
 *  3. 최신 글: 주제 칩(Chip Tabs)으로 그 자리에서 거르는 카드 그리드
 *  4. 자주 묻는 질문 — Accordion
 */
export function Home({ links, site }: HomeProps) {
  const [top] = featuredFirst(site);
  const groups = groupByCategory(site);
  const max = Math.max(1, ...groups.map((group) => group.posts.length));
  const tabbed = tabbedPosts(site);

  return (
    <>
      <section className="bn-hero">
        <div className="bn-wrap">
          <h1 className="bn-hero__name">{SITE.name}</h1>
          <p className="bn-hero__headline">
            네 가지 관점으로 읽는 <DrawCircle>검색</DrawCircle>.
          </p>
          <p className="bn-hero__desc">{SITE.description}</p>
          <p className="bn-hero__cta">
            <Link className="btn-dot" href={links.posts}>
              <span className="btn-dot__dot" aria-hidden="true" />
              글 읽기 시작
            </Link>
          </p>
        </div>
      </section>

      <section className="bn-section" aria-labelledby="bn-overview-title">
        <div className="bn-wrap">
          <h2 id="bn-overview-title" className="visually-hidden">
            한눈에 보기
          </h2>
          <div className="bn-bento">
            {top && <FeatureTile post={top} links={links} />}

            <article className="bn-card bn-stat">
              <p className="bn-eyebrow">지금까지</p>
              <p className="bn-stat__number">
                {site.posts.length}
                <span>편의 글</span>
              </p>
              <ul className="bn-bars" aria-label="주제별 글 수">
                {groups.map(({ category, posts }) => (
                  <li
                    key={category.id}
                    data-cat={category.id}
                    style={{ "--h": Math.round((posts.length / max) * 100) } as CSSProperties}
                  >
                    <span className="bn-bars__value">{posts.length}</span>
                    <span className="bn-bars__bar bar-grow" aria-hidden="true" />
                    <span className="bn-bars__label">{category.label}</span>
                  </li>
                ))}
              </ul>
            </article>

            <div className="bn-topics">
              {groups.map(({ category, posts }) => (
                <article key={category.id} className="bn-topic flip-card" data-cat={category.id}>
                  <div className="flip-card__inner">
                    <div className="bn-topic__face flip-card__face">
                      <h3 className="bn-topic__label">{category.label}</h3>
                      <p className="bn-topic__name">{category.name}</p>
                      <p className="bn-topic__count">글 {posts.length}개</p>
                    </div>
                    <div className="bn-topic__face bn-topic__face--back flip-card__face flip-card__face--back">
                      <p className="bn-topic__desc">{category.description}</p>
                      <ul className="bn-topic__chips">
                        {category.topics.map((topic) => (
                          <li key={topic}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Link
                    href={links.category(category.id)}
                    className="bn-stretch"
                    aria-label={`${category.label} 글 ${posts.length}개 보기`}
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {tabbed.length > 0 && (
        <section className="bn-section" aria-labelledby="bn-latest-title">
          <div className="bn-wrap">
            <div className="bn-section__head">
              <h2 id="bn-latest-title" className="bn-h2">
                최신 글
              </h2>
              <FilterTabs
                tabs={CATEGORY_TABS}
                target="bn-latest-grid"
                variant="chip"
                label="주제별로 보기"
                className="bn-tabs"
              />
            </div>
            <div id="bn-latest-grid" className="bn-posts" data-filter-list="">
              {tabbed.map(({ post, inAll }) => (
                <div
                  key={post.id}
                  className="bn-posts__item"
                  data-filter-item={post.category}
                  data-filter-all={inAll ? "" : undefined}
                >
                  <PostTile post={post} links={links} />
                </div>
              ))}
              <p className="bn-empty" data-filter-empty="" hidden>
                이 주제에는 아직 글이 없습니다.
              </p>
            </div>
            <p className="bn-section__more">
              <Link className="bn-link" href={links.posts}>
                전체 글 보기
              </Link>
            </p>
          </div>
        </section>
      )}

      <section className="bn-section" aria-labelledby="bn-faq-title">
        <div className="bn-wrap">
          <div className="bn-card bn-faq">
            <h2 id="bn-faq-title" className="bn-h2">
              자주 묻는 질문
            </h2>
            <Accordion items={HOME_FAQ} name="bn-faq" />
          </div>
        </div>
      </section>
    </>
  );
}
