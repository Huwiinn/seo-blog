"use client";

import { useEffect } from "react";

/**
 * 스크롤 위치에 맞춰 목차 링크에 aria-current를 붙인다.
 * 화면에 아무것도 그리지 않으며, 페이지에 있는 모든 [data-toc-link]를 대상으로 한다.
 */
export function TocSpy({ offset = 120 }: { offset?: number }) {
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const links = document.querySelectorAll<HTMLAnchorElement>("a[data-toc-link]");
      if (links.length === 0) return;

      let active: string | null = null;
      const seen = new Set<string>();
      for (const link of links) {
        const anchor = link.dataset.tocLink;
        if (!anchor || seen.has(anchor)) continue;
        seen.add(anchor);
        const heading = document.getElementById(anchor);
        if (heading && heading.getBoundingClientRect().top <= offset) active = anchor;
      }
      for (const link of links) {
        if (link.dataset.tocLink === active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [offset]);

  return null;
}
