"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface FilterTab {
  id: string;
  label: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  /** 걸러 낼 목록 요소의 id. 이 요소에 data-filter="탭 id"가 붙고, 숨김은 CSS가 맡는다. */
  target: string;
  /** slide: 강조 배경이 미끄러져 옮겨 간다 (Slide Tabs) / chip: 색 칩이 탄성 있게 튀며 옮겨 간다 (Chip Tabs) */
  variant?: "slide" | "chip";
  label: string;
  className?: string;
}

/**
 * 주제 탭. 누른 탭으로 선택 표시가 이동하고, 목록은 페이지 이동 없이 그 자리에서 걸러진다.
 * 목록 자체는 서버에서 그린 HTML 그대로이므로 검색엔진은 모든 글 링크를 볼 수 있다.
 */
export function FilterTabs({ tabs, target, variant = "slide", label, className }: FilterTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? "all");
  const listRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const button = Array.from(list.querySelectorAll<HTMLButtonElement>("button")).find(
      (item) => item.dataset.tab === active,
    );
    if (!button) return;
    list.style.setProperty("--tab-x", `${button.offsetLeft}px`);
    list.style.setProperty("--tab-w", `${button.offsetWidth}px`);
    list.dataset.ready = "";
  }, [active]);

  useEffect(() => {
    place();
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(place);
    observer.observe(list);
    document.fonts?.ready.then(place).catch(() => {});
    return () => observer.disconnect();
  }, [place]);

  useEffect(() => {
    const element = document.getElementById(target);
    if (!element) return;
    element.setAttribute("data-filter", active);
    const selector =
      active === "all" ? "[data-filter-all]" : `[data-filter-item="${active}"]`;
    const visible = element.querySelectorAll(selector).length;
    element.querySelector("[data-filter-empty]")?.toggleAttribute("hidden", visible > 0);
  }, [active, target]);

  return (
    <div
      ref={listRef}
      className={className ? `filter-tabs ${className}` : "filter-tabs"}
      role="group"
      aria-label={label}
      data-variant={variant}
    >
      <span className="filter-tabs__indicator" data-cat={active} aria-hidden="true" />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-tab={tab.id}
          aria-pressed={tab.id === active}
          aria-controls={target}
          onClick={() => setActive(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
