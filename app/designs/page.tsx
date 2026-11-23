import Link from "next/link";
import activeDesign from "@/designs/active";
import { DESIGNS } from "@/designs/registry";
import type { DesignId } from "@/designs/types";
import { getPublishedPosts } from "@/lib/posts/queries";

/** 시안마다 홈에 배치한 인터랙션 패턴 (hwuiinn-wiki UI·UX 모션 사전의 표준 명칭) */
const PATTERNS: Record<DesignId, string[]> = {
  newsroom: ["Sticky header", "Slide Tabs", "Hover lift", "Accordion", "Scroll progress"],
  pro: [
    "Sticky header",
    "Hover Flip Nav",
    "Fit Text To Container",
    "Spinning Box Text",
    "Spotlight Button",
    "Velocity Text",
    "Carousel",
    "Scroll progress",
  ],
  docs: [
    "Sticky header",
    "Retracting Sidebar",
    "Hamburger Button",
    "Dot Expand Button",
    "Hover lift",
    "Accordion",
    "Scroll progress",
  ],
  bento: [
    "Sticky header",
    "Draw Circle Text",
    "Dot Expand Button",
    "Hover lift",
    "Bar grow",
    "Flip card",
    "Chip Tabs",
    "Accordion",
    "Scroll progress",
  ],
  glass: [
    "Sticky header",
    "Floating Bottom Nav",
    "Bubble Text",
    "Vanish Text",
    "Shiny Button",
    "Slide Tabs",
    "Hover lift",
    "Accordion",
    "Scroll progress",
  ],
};

export default function DesignGalleryPage() {
  const sample = getPublishedPosts()[0];

  return (
    <main className="gallery">
      <div className="gallery__wrap">
        <p className="gallery__eyebrow">디자인 시안</p>
        <h1 className="gallery__title">Apple 웹 디자인을 참고한 시안 {DESIGNS.length}종</h1>
        <p className="gallery__desc">
          같은 글 데이터로 만든 홈·목록·글 상세입니다. 화면 오른쪽 아래의 전환 버튼으로 같은
          페이지를 다른 시안으로 바꿔 볼 수 있습니다. 운영 사이트에 적용할 시안은{" "}
          <code>designs/active.ts</code>의 한 줄로 고릅니다.
        </p>

        <ul className="gallery__list">
          {DESIGNS.map((design) => {
            const home = `/designs/${design.id}`;
            const article = sample ? `${home}/posts/${sample.slug}` : home;
            return (
              <li key={design.id} className="gallery-card">
                <div>
                  <h2 className="gallery-card__name">
                    {design.name}
                    {design.id === activeDesign.id && (
                      <span className="gallery-card__active">현재 운영 적용</span>
                    )}
                  </h2>
                  <p className="gallery-card__ref">레퍼런스: {design.reference}</p>
                  <p className="gallery-card__desc">{design.description}</p>
                  {PATTERNS[design.id].length > 0 && (
                    <ul className="gallery-card__patterns" aria-label="배치한 인터랙션 패턴">
                      {PATTERNS[design.id].map((pattern) => (
                        <li key={pattern}>{pattern}</li>
                      ))}
                    </ul>
                  )}
                  <p className="gallery-card__links">
                    <Link href={home}>홈 보기</Link>
                    <Link href={article}>글 상세</Link>
                    <Link href={`${home}/posts`}>전체 글</Link>
                    <Link href={`${home}/category/seo`}>주제 목록</Link>
                  </p>
                </div>

                <div className="gallery-card__shots">
                  <div className="gallery-shot gallery-shot--desktop">
                    <iframe src={home} title={`${design.name} 홈 미리보기`} loading="lazy" tabIndex={-1} />
                    <Link href={home} aria-label={`${design.name} 홈 열기`} />
                    <span className="gallery-shot__label">홈 · 데스크톱</span>
                  </div>
                  <div className="gallery-shot gallery-shot--mobile">
                    <iframe src={article} title={`${design.name} 글 상세 미리보기`} loading="lazy" tabIndex={-1} />
                    <Link href={article} aria-label={`${design.name} 글 상세 열기`} />
                    <span className="gallery-shot__label">글 · 모바일</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
