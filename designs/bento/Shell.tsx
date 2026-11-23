import Link from "next/link";
import { CATEGORIES, SITE } from "@/constant";
import type { ShellProps } from "../types";

export function Shell({ links, current, children }: ShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="bn" data-design="bento">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>

      <header className="bn-nav">
        <div className="bn-nav__inner">
          <Link
            href={links.home}
            className="bn-nav__brand"
            aria-current={current.page === "home" ? "page" : undefined}
          >
            {SITE.name}
          </Link>
          <nav className="bn-nav__links" aria-label="주제">
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

      <main id="main" className="bn-main">
        {children}
      </main>

      <footer className="bn-footer">
        <div className="bn-wrap">
          <div className="bn-card bn-footer__card">
            <div>
              <p className="bn-footer__brand">{SITE.name}</p>
              <p className="bn-footer__note">{SITE.description}</p>
            </div>
            <nav className="bn-footer__links" aria-label="바닥글">
              {CATEGORIES.map((category) => (
                <Link key={category.id} href={links.category(category.id)}>
                  {category.label}
                </Link>
              ))}
              <Link href={links.posts}>전체 글</Link>
            </nav>
          </div>
          <p className="bn-footer__legal">
            Copyright © {year} {SITE.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
