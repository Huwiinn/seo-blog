import Link from "next/link";
import { Accordion } from "@/components/motion/Accordion";
import { PostDate } from "@/components/post/PostDate";
import { getCategory, SITE } from "@/constant";
import { HOME_FAQ } from "@/constant/home";
import { groupByCategory } from "../data";
import type { HomeProps } from "../types";

/**
 * 홈 배치 (위 → 아래)
 *  1. 개요: 사이트 이름(H1)·소개·주 버튼(Dot Expand Button)
 *  2. 주제 카드 4개 — Hover lift
 *  3. 최근 업데이트 목록
 *  4. 자주 묻는 질문 — Accordion
 *  옆: 접히는 사이드바(Retracting Sidebar), 모바일 메뉴(Hamburger Button)
 */
export function Home({ links, site }: HomeProps) {
  return (
    <div className="docs-page">
      <header className="docs-hero">
        <p className="docs-kicker">지식 베이스</p>
        <h1 className="docs-title">{SITE.name}</h1>
        <p className="docs-lead">{SITE.description}</p>
        <p className="docs-hero__cta">
          <Link className="btn-dot" href={links.posts}>
            <span className="btn-dot__dot" aria-hidden="true" />
            전체 글 보기
          </Link>
        </p>
      </header>

      <section className="docs-block" aria-labelledby="docs-topics-title">
        <h2 id="docs-topics-title" className="docs-h2">
          주제
        </h2>
        <div className="docs-cards">
          {groupByCategory(site).map(({ category, posts }) => (
            <article key={category.id} className="docs-card hover-lift" data-cat={category.id}>
              <span className="docs-card__badge" aria-hidden="true">
                {category.label}
              </span>
              <h3 className="docs-card__title">
                <Link href={links.category(category.id)} className="docs-stretch">
                  {category.label} · {category.name}
                </Link>
              </h3>
              <p className="docs-card__desc">{category.description}</p>
              <p className="docs-card__count">글 {posts.length}개</p>
            </article>
          ))}
        </div>
      </section>

      <section className="docs-block" aria-labelledby="docs-updates-title">
        <h2 id="docs-updates-title" className="docs-h2">
          최근 업데이트
        </h2>
        {site.posts.length === 0 ? (
          <p className="docs-empty">아직 발행한 글이 없습니다.</p>
        ) : (
          <ul className="docs-updates">
            {site.posts.slice(0, 6).map((post) => (
              <li key={post.id} data-cat={post.category}>
                <Link href={links.post(post.slug)}>{post.title}</Link>
                <span className="docs-badge">{getCategory(post.category).label}</span>
                <PostDate value={post.modifiedAt ?? post.publishedAt} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="docs-block" aria-labelledby="docs-faq-title">
        <h2 id="docs-faq-title" className="docs-h2">
          자주 묻는 질문
        </h2>
        <Accordion items={HOME_FAQ} name="docs-faq" />
      </section>
    </div>
  );
}
