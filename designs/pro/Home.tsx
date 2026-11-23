import Link from "next/link";
import { GlowLink } from "@/components/motion/GlowLink";
import { RailButtons } from "@/components/motion/RailButtons";
import { RotatingWords } from "@/components/motion/Text";
import { VelocityMarquee } from "@/components/motion/VelocityMarquee";
import { SITE } from "@/constant";
import { HOME_TOPICS } from "@/constant/home";
import { featuredFirst, groupByCategory } from "../data";
import type { HomeProps } from "../types";
import { PosterCard, Row } from "./parts";

const MARQUEE = [
  "SEO",
  "검색 의도",
  "GEO",
  "AI 인용",
  "AEO",
  "직접 답변",
  "UX·UI",
  "Core Web Vitals",
];

/**
 * 홈 배치 (위 → 아래)
 *  1. 히어로: 사이트 이름(H1) + 컨테이너 폭에 맞춘 큰 헤드라인(Fit Text To Container)
 *     + 번갈아 바뀌는 주제어(Spinning Box Text) + 주 버튼(Spotlight Button)
 *  2. 흐르는 키워드 띠 — Velocity Text
 *  3. 하이라이트: 가로로 넘기는 큰 카드 — Carousel (이전·다음 버튼, 자동 넘김 없음)
 *  4. 주제별 챕터 ×4: 큰 주제 이름 + 대표 글 목록
 */
export function Home({ links, site }: HomeProps) {
  const highlights = featuredFirst(site).slice(0, 5);

  return (
    <>
      <section className="pro-hero">
        <div className="pro-hero__glow" aria-hidden="true" />
        <div className="pro-wrap pro-hero__inner">
          <h1 className="pro-hero__name">{SITE.name}</h1>
          <p className="pro-hero__headline">
            <span className="pro-hero__line">검색의 다음 장면.</span>
            <RotatingWords words={HOME_TOPICS} variant="spin" className="pro-hero__topic" />
          </p>
          <p className="pro-hero__copy">
            <strong>SEO, GEO, AEO, UX/UI</strong>를 실무 관점에서 정리합니다. 검색엔진과 AI 답변
            엔진이 <strong>이해하기 쉬운 구조</strong>와, 검색 이후의 <strong>경험</strong>을
            기록합니다.
          </p>
          <p className="pro-hero__cta">
            <GlowLink className="pro-button btn-spotlight" href={links.posts}>
              전체 글 보기
            </GlowLink>
            {highlights.length > 0 && (
              <a className="pro-link" href="#pro-highlights">
                하이라이트
              </a>
            )}
          </p>
        </div>
      </section>

      <VelocityMarquee items={MARQUEE} className="pro-marquee" />

      {highlights.length > 0 && (
        <section id="pro-highlights" className="pro-highlights" aria-labelledby="pro-highlights-title">
          <div className="pro-wrap pro-highlights__head">
            <h2 id="pro-highlights-title" className="pro-heading">
              하이라이트.
            </h2>
            <RailButtons target="pro-rail" className="pro-rail-buttons" />
          </div>
          <div id="pro-rail" className="pro-rail" role="region" aria-label="추천 글" tabIndex={0}>
            <ul className="pro-rail__track">
              {highlights.map((post) => (
                <li key={post.id}>
                  <PosterCard post={post} links={links} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {groupByCategory(site).map(({ category, posts }) => (
        <section
          key={category.id}
          className="pro-chapter"
          data-cat={category.id}
          aria-labelledby={`pro-chapter-${category.id}`}
        >
          <div className="pro-wrap pro-chapter__grid">
            <div className="pro-chapter__intro">
              <h2 id={`pro-chapter-${category.id}`} className="pro-chapter__label">
                {category.label}
              </h2>
              <p className="pro-chapter__name">{category.name}</p>
              <p className="pro-chapter__desc">{category.description}</p>
              <Link className="pro-link" href={links.category(category.id)}>
                {category.label} 글 {posts.length}개 모두 보기
              </Link>
            </div>
            <div className="pro-chapter__list reveal">
              {posts.length === 0 ? (
                <p className="pro-empty">아직 글이 없습니다.</p>
              ) : (
                posts.slice(0, 3).map((post) => <Row key={post.id} post={post} links={links} />)
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
