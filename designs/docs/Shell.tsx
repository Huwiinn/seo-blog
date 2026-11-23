import Link from "next/link";
import { MenuToggle } from "@/components/ui/MenuToggle";
import { CATEGORIES, SITE } from "@/constant";
import { groupByCategory } from "../data";
import type { ShellProps } from "../types";

export function Shell({ links, site, current, children }: ShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="docs" data-design="docs">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>

      <header className="docs-top">
        <div className="docs-top__inner">
          {/* Hamburger Button: 모바일에서 세 줄 아이콘이 닫기(X)로 바뀐다 */}
          <MenuToggle target="docs-side" className="docs-top__menu" label="문서 메뉴">
            <span className="hamburger">
              <span />
            </span>
          </MenuToggle>
          <Link href={links.home} className="docs-top__brand">
            {SITE.name}
            <span>지식 베이스</span>
          </Link>
          <nav className="docs-top__links" aria-label="주요 메뉴">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={links.category(category.id)}
                data-active={current.category === category.id ? "" : undefined}
              >
                {category.label}
              </Link>
            ))}
            <Link href={links.posts} data-active={current.page === "posts" ? "" : undefined}>
              전체 글
            </Link>
          </nav>
        </div>
      </header>

      <div className="docs-frame" id="docs-frame">
        <aside className="docs-side" id="docs-side">
          {/* Retracting Sidebar: 버튼을 누르면 옆 메뉴가 좁아져 주제 표시만 남는다 */}
          <MenuToggle
            target="docs-frame"
            attribute="data-collapsed"
            dismissible={false}
            className="docs-side__collapse"
            label="사이드바 접기"
          >
            <span aria-hidden="true" />
          </MenuToggle>

          <nav className="docs-side__nav" aria-label="문서 탐색">
            <Link
              href={links.home}
              className="docs-side__link docs-side__link--home"
              aria-current={current.page === "home" ? "page" : undefined}
            >
              개요
            </Link>

            {groupByCategory(site).map(({ category, posts }) => (
              <div key={category.id} className="docs-group" data-cat={category.id}>
                <Link
                  href={links.category(category.id)}
                  className="docs-group__icon"
                  title={`${category.label} · ${category.name}`}
                  aria-label={`${category.label} 글 목록`}
                >
                  {category.label.slice(0, 2)}
                </Link>
                <details open>
                  <summary>
                    <span className="docs-group__dot" aria-hidden="true" />
                    {category.label}
                    <span className="docs-group__count">{posts.length}</span>
                  </summary>
                  <ul>
                    <li>
                      <Link
                        href={links.category(category.id)}
                        className="docs-side__link"
                        aria-current={
                          current.page === "category" && current.category === category.id
                            ? "page"
                            : undefined
                        }
                      >
                        {category.name} 개요
                      </Link>
                    </li>
                    {posts.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={links.post(post.slug)}
                          className="docs-side__link"
                          aria-current={current.slug === post.slug ? "page" : undefined}
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </nav>
        </aside>

        <div className="docs-content">
          <main id="main" className="docs-main">
            {children}
          </main>
          <footer className="docs-footer">
            <p>{SITE.description}</p>
            <p>
              Copyright © {year} {SITE.name}. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
