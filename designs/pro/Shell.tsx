import Link from "next/link";
import { CATEGORIES, SITE } from "@/constant";
import type { ShellProps } from "../types";

export function Shell({ links, current, children }: ShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="pro" data-design="pro">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>

      <header className="pro-nav">
        <div className="pro-nav__inner">
          <Link
            href={links.home}
            className="pro-nav__brand"
            aria-current={current.page === "home" ? "page" : undefined}
          >
            {SITE.name}
          </Link>
          <nav className="pro-nav__links" aria-label="주제">
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
                <span className="flip-link" data-label={category.label}>
                  <span>{category.label}</span>
                </span>
              </Link>
            ))}
            <Link
              href={links.posts}
              data-active={current.page === "posts" ? "" : undefined}
              aria-current={current.page === "posts" ? "page" : undefined}
            >
              <span className="flip-link" data-label="전체 글">
                <span>전체 글</span>
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="pro-main">
        {children}
      </main>

      <footer className="pro-footer">
        <div className="pro-wrap">
          <p className="pro-footer__brand">{SITE.name}</p>
          <p className="pro-footer__note">{SITE.description}</p>
          <nav className="pro-footer__links" aria-label="바닥글">
            {CATEGORIES.map((category) => (
              <Link key={category.id} href={links.category(category.id)}>
                {category.label}
              </Link>
            ))}
            <Link href={links.posts}>전체 글</Link>
          </nav>
          <p className="pro-footer__legal">
            Copyright © {year} {SITE.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
