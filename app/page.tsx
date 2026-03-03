import Link from "next/link";
import { categorySections, posts } from "./site-data";

const featuredPosts = posts.filter((post) => post.featured);
const latestPosts = posts.slice(0, 4);

export default function Home() {
  return (
    <div className="page-wrap">
      <section className="hero">
        <div className="hero__content">
          <p className="section-label">Personal SEO knowledge base</p>
          <h1 className="hero__title">
            실무와 학습을 함께 쌓는
            <br />
            개인 SEO 아카이브
          </h1>
          <p className="hero__description">
            테크니컬 SEO, 콘텐츠 전략, 마케팅 용어, GA4 분석, 그리고 개인 실험 기록까지
            한곳에 정리합니다. 글이 쌓일수록 바로 찾아볼 수 있는 지식 베이스가 되도록
            설계합니다.
          </p>
          <div className="hero__actions">
            <a href="#latest-posts" className="button button--solid">
              최신 글 보기
            </a>
            <a href="#categories" className="button button--ghost">
              카테고리 탐색
            </a>
          </div>
        </div>
        <div className="hero__panel">
          <p className="hero__panel-title">현재 운영 원칙</p>
          <ul className="hero__panel-list">
            <li>검색 엔진 관점에서 구조를 먼저 정리</li>
            <li>실무 용어는 짧고 바로 찾기 쉽게 기록</li>
            <li>GA4와 실험 노트는 재사용 가능한 문서로 축적</li>
          </ul>
        </div>
      </section>

      <section id="categories" className="content-section">
        <div className="section-heading">
          <p className="section-label">Core categories</p>
          <h2>헤더 네비게이션 중심 카테고리</h2>
        </div>
        <div className="category-grid">
          {categorySections.map((section) => (
            <Link key={section.href} href={section.href} className="category-card">
              <p className="category-card__title">{section.title}</p>
              <p className="category-card__intro">{section.intro}</p>
              <div className="tag-row">
                {section.bullets.map((bullet) => (
                  <span key={bullet} className="tag-chip">
                    {bullet}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="latest-posts" className="content-section">
        <div className="section-heading">
          <p className="section-label">Latest posts</p>
          <h2>최근 정리한 글</h2>
        </div>
        <div className="post-list">
          {latestPosts.map((post) => (
            <Link key={post.title} href={post.href} className="post-card">
              <div className="post-card__meta">
                <span>{post.category}</span>
                <span>{post.date}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section content-section--split">
        <div>
          <div className="section-heading">
            <p className="section-label">Featured</p>
            <h2>먼저 읽으면 좋은 핵심 글</h2>
          </div>
          <div className="post-list">
            {featuredPosts.map((post) => (
              <Link key={post.title} href={post.href} className="post-card post-card--featured">
                <div className="post-card__meta">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
              </Link>
            ))}
          </div>
        </div>
        <aside className="learning-note">
          <p className="section-label">Learning log</p>
          <h2>개인 학습 메모의 역할</h2>
          <p>
            학습 로그는 정답을 정리하는 공간이 아니라, 실험 과정과 해석을 남기는 공간으로
            운영합니다. 실패한 시도도 기록해 다음 판단의 기준으로 삼습니다.
          </p>
          <Link href="/learning-log" className="text-link">
            개인 학습 아카이브 보기
          </Link>
        </aside>
      </section>
    </div>
  );
}
