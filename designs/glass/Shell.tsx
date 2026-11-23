import Link from "next/link";
import { MenuToggle } from "@/components/ui/MenuToggle";
import { CATEGORIES, SITE } from "@/constant";
import type { ShellProps } from "../types";

export function Shell({ links, current, children }: ShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="gl" data-design="glass">
      <div className="gl-backdrop" aria-hidden="true" />
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>

      {/* 떠 있는 알약 모양 내비게이션 (Sticky header) */}
      <header className="gl-nav">
        <div className="gl-nav__pill gl-glass">
          <Link
            href={links.home}
            className="gl-nav__brand"
            aria-current={current.page === "home" ? "page" : undefined}
          >
            {SITE.name}
          </Link>
          <nav className="gl-nav__links" aria-label="주제">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={links.category(category.id)}
                data-active={current.category === category.id ? "" : undefined}
                aria-current={
                  current.page === "category" && current.category === category.id
                    ? "page"
                    : undefined
                }
              >
                {category.label}
              </Link>
            ))}
            <Link
              href={links.posts}
              data-active={current.page === "posts" ? "" : undefined}
              aria-current={current.page === "posts" ? "page" : undefined}
            >
              전체 글
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="gl-main">
        {children}
      </main>

      <footer className="gl-footer">
        <div className="gl-wrap">
          <div className="gl-glass gl-footer__panel">
            <div>
              <p className="gl-footer__brand">{SITE.name}</p>
              <p className="gl-footer__note">{SITE.description}</p>
            </div>
            <nav className="gl-footer__links" aria-label="바닥글">
              {CATEGORIES.map((category) => (
                <Link key={category.id} href={links.category(category.id)}>
                  {category.label}
                </Link>
              ))}
              <Link href={links.posts}>전체 글</Link>
            </nav>
          </div>
          <p className="gl-footer__legal">
            Copyright © {year} {SITE.name}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Bottom Nav: 모바일에서 화면 아래 떠 있는 메뉴바. "주제"를 누르면 바 위로 패널이 펼쳐진다 */}
      <div className="gl-dock">
        <div className="gl-dock__panel gl-glass" id="gl-dock-panel">
          <ul>
            {CATEGORIES.map((category) => (
              <li key={category.id} data-cat={category.id}>
                <Link href={links.category(category.id)}>
                  <span className="gl-chip__dot" aria-hidden="true" />
                  <strong>{category.label}</strong>
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <nav className="gl-dock__bar gl-glass" aria-label="빠른 이동">
          <Link href={links.home} data-active={current.page === "home" ? "" : undefined}>
            홈
          </Link>
          <Link href={links.posts} data-active={current.page === "posts" ? "" : undefined}>
            전체 글
          </Link>
          <MenuToggle target="gl-dock-panel" className="gl-dock__more" label="주제 목록">
            주제
            <span className="gl-dock__chevron" aria-hidden="true" />
          </MenuToggle>
        </nav>
      </div>
    </div>
  );
}
