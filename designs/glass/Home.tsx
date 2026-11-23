import Link from "next/link";
import { Accordion } from "@/components/motion/Accordion";
import { FilterTabs } from "@/components/motion/FilterTabs";
import { GlowLink } from "@/components/motion/GlowLink";
import { BubbleText, RotatingWords } from "@/components/motion/Text";
import { PostCover } from "@/components/post/PostCover";
import { PostDate } from "@/components/post/PostDate";
import { getCategory, SITE } from "@/constant";
import { HOME_FAQ, HOME_TOPICS } from "@/constant/home";
import { CATEGORY_TABS, featuredFirst, groupByCategory, tabbedPosts } from "../data";
import type { HomeProps } from "../types";
import { GlassPost } from "./parts";

/**
 * 홈 배치 (위 → 아래)
 *  1. 히어로: 사이트 이름(H1, Bubble Text) + 번갈아 바뀌는 주제어(Vanish Text) + 주 버튼(Shiny Button)
 *  2. 추천 글: 큰 유리 카드 — Hover lift
 *  3. 최신 글: 주제 탭(Slide Tabs)으로 거르는 유리 카드 그리드
 *  4. 주제 렌즈 4개: 주제 색이 비치는 유리 타일
 *  5. 자주 묻는 질문 — Accordion
 *  모바일: 화면 아래 떠 있는 메뉴바 (Floating Bottom Nav)
 */
export function Home({ links, site }: HomeProps) {
  const [top] = featuredFirst(site);
  const tabbed = tabbedPosts(site);

  return (
    <>
      <section className="gl-hero">
        <div className="gl-wrap">
          <h1 className="gl-hero__name" aria-label={SITE.name}>
            <BubbleText>{SITE.name}</BubbleText>
          </h1>
          <p className="gl-hero__headline">
            오늘 읽을 주제는 <RotatingWords words={HOME_TOPICS} variant="vanish" />
          </p>
          <p className="gl-hero__desc">{SITE.description}</p>
          <p className="gl-hero__cta">
            <GlowLink className="gl-button btn-shiny" href={links.posts}>
              전체 글 보기
            </GlowLink>
          </p>
        </div>
      </section>

      {top && (
        <section className="gl-section" aria-labelledby="gl-feature-title">
          <div className="gl-wrap">
            <h2 id="gl-feature-title" className="visually-hidden">
              추천 글
            </h2>
            <article className="gl-glass gl-feature hover-lift" data-cat={top.category}>
              <PostCover post={top} priority className="gl-feature__cover" />
              <div className="gl-feature__body">
                <p className="gl-chip">
                  <span className="gl-chip__dot" aria-hidden="true" />
                  추천 · {getCategory(top.category).label}
                </p>
                <h3 className="gl-feature__title">
                  <Link href={links.post(top.slug)} className="gl-stretch">
                    {top.title}
                  </Link>
                </h3>
                <p className="gl-feature__summary">{top.summary}</p>
                <p className="gl-post__meta">
                  <PostDate value={top.publishedAt} />
                  <span>{top.readingMinutes}분</span>
                </p>
              </div>
            </article>
          </div>
        </section>
      )}

      {tabbed.length > 0 && (
        <section className="gl-section" aria-labelledby="gl-latest-title">
          <div className="gl-wrap">
            <div className="gl-section__head">
              <h2 id="gl-latest-title" className="gl-h2">
                최신 글
              </h2>
              <FilterTabs
                tabs={CATEGORY_TABS}
                target="gl-latest-grid"
                variant="slide"
                label="주제별로 보기"
                className="gl-tabs"
              />
            </div>
            <div id="gl-latest-grid" className="gl-grid" data-filter-list="">
              {tabbed.map(({ post, inAll }) => (
                <div
                  key={post.id}
                  className="gl-grid__item"
                  data-filter-item={post.category}
                  data-filter-all={inAll ? "" : undefined}
                >
                  <GlassPost post={post} links={links} />
                </div>
              ))}
              <p className="gl-empty" data-filter-empty="" hidden>
                이 주제에는 아직 글이 없습니다.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="gl-section" aria-labelledby="gl-topics-title">
        <div className="gl-wrap">
          <div className="gl-section__head">
            <h2 id="gl-topics-title" className="gl-h2">
              주제
            </h2>
          </div>
          <div className="gl-lenses">
            {groupByCategory(site).map(({ category, posts }) => (
              <article key={category.id} className="gl-glass gl-lens hover-lift" data-cat={category.id}>
                <h3 className="gl-lens__label">
                  <Link href={links.category(category.id)} className="gl-stretch">
                    {category.label}
                  </Link>
                </h3>
                <p className="gl-lens__name">{category.name}</p>
                <p className="gl-lens__desc">{category.description}</p>
                <p className="gl-lens__count">글 {posts.length}개</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gl-section" aria-labelledby="gl-faq-title">
        <div className="gl-wrap">
          <div className="gl-glass gl-faq">
            <h2 id="gl-faq-title" className="gl-h2">
              자주 묻는 질문
            </h2>
            <Accordion items={HOME_FAQ} name="gl-faq" />
          </div>
        </div>
      </section>
    </>
  );
}
