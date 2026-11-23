import Link from "next/link";
import { CATEGORIES, SITE } from "@/constant";
import type { ShellProps } from "../types";

export function Shell({ links, current, children }: ShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="nr" data-design="newsroom">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>

      <header className="nr-nav">
        <div className="nr-nav__inner">
          <Link
            href={links.home}
            className="nr-nav__brand"
            aria-current={current.page === "home" ? "page" : undefined}
          >
            {SITE.name}
          </Link>
          <nav className="nr-nav__links" aria-label="주제">
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

      <main id="main" className="nr-main">
        {children}
      </main>

      <footer className="nr-footer">
        <div className="nr-wrap">
          <p className="nr-footer__note">{SITE.description}</p>
          <nav className="nr-footer__dir" aria-label="바닥글">
            <div>
              <p className="nr-footer__label">주제</p>
              <ul>
                {CATEGORIES.map((category) => (
                  <li key={category.id}>
                    <Link href={links.category(category.id)}>
                      {category.label} · {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="nr-footer__label">둘러보기</p>
              <ul>
                <li>
                  <Link href={links.home}>홈</Link>
                </li>
                <li>
                  <Link href={links.posts}>전체 글</Link>
                </li>
              </ul>
            </div>
          </nav>
          <p className="nr-footer__legal">
            Copyright © {year} {SITE.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
