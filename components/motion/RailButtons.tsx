"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 캐러셀(가로로 넘기는 카드 줄)의 이전·다음 버튼. 자동 넘김은 하지 않는다.
 * 줄 자체는 CSS scroll-snap으로 동작하므로 버튼 없이도 스와이프·키보드로 넘길 수 있다.
 */
export function RailButtons({ target, className }: { target: string; className?: string }) {
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const rail = document.getElementById(target);
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setEdge({ start: rail.scrollLeft <= 4, end: rail.scrollLeft >= max - 4 });
  }, [target]);

  useEffect(() => {
    const rail = document.getElementById(target);
    if (!rail) return;
    const frame = requestAnimationFrame(measure);
    rail.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, target]);

  const move = (direction: 1 | -1) => {
    const rail = document.getElementById(target);
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("li");
    const step = card ? card.offsetWidth + 20 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className={className ? `rail-buttons ${className}` : "rail-buttons"}>
      <button type="button" onClick={() => move(-1)} disabled={edge.start} aria-label="이전 글">
        <span aria-hidden="true">‹</span>
      </button>
      <button type="button" onClick={() => move(1)} disabled={edge.end} aria-label="다음 글">
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}
