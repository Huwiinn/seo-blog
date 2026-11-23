"use client";

import { SITE } from "@/constant";
import { formatDateDots } from "@/lib/format";
import type { MeasureFn } from "@/lib/seo/measure";
import { truncateToWidth } from "@/lib/seo/measure";
import { resolvePostMeta } from "@/lib/seo/meta";
import { SEO_RULES } from "@/lib/seo/rules";
import type { EditorDraft } from "./state";

interface SerpPreviewProps {
  draft: EditorDraft;
  measure: MeasureFn;
  publishedAt: string | null;
}

/**
 * 검색 결과에 어떻게 보일지 미리 보여 준다. 제목·설명은 실제 출력(generateMetadata)과 같은
 * resolvePostMeta로 계산하고, 글자 수가 아니라 픽셀 폭으로 잘라 한글·영문이 섞여도 정확하다.
 * 실제 검색엔진은 제목과 설명을 다르게 고쳐 보여 줄 수 있으므로 참고용이다.
 */
export function SerpPreview({ draft, measure, publishedAt }: SerpPreviewProps) {
  const meta = resolvePostMeta(draft);
  const { titleFontPx, titleMaxPx, descriptionFontPx, descriptionMaxPx } = SEO_RULES.serp;

  const title = truncateToWidth(meta.fullTitle, titleMaxPx, titleFontPx, measure);
  const description = meta.description
    ? truncateToWidth(meta.description, descriptionMaxPx, descriptionFontPx, measure)
    : null;
  const host = SITE.url.replace(/^https?:\/\//, "");
  // 발행 전에는 날짜가 없다. 검색엔진도 날짜를 알 수 있을 때만 설명 앞에 붙인다.
  const date = publishedAt ? formatDateDots(publishedAt) : null;

  const sourceLabel = {
    meta: "메타 설명",
    summary: "핵심 요약 (메타 설명이 비어 있어 대신 사용)",
    intro: "도입부 첫 문단 (메타 설명과 핵심 요약이 비어 있어 대신 사용)",
    none: "없음",
  }[meta.descriptionSource];

  return (
    <div className="ed-serp">
      <div className="ed-serp__card" aria-label="검색 결과 미리보기">
        <div className="ed-serp__site">
          <span className="ed-serp__favicon" aria-hidden="true">
            {SITE.name.slice(0, 1)}
          </span>
          <div>
            <p className="ed-serp__name">{SITE.name}</p>
            <p className="ed-serp__url">
              https://{host} › posts{draft.slug ? ` › ${draft.slug}` : ""}
            </p>
          </div>
        </div>
        <p className="ed-serp__title">{meta.title ? title.text : "제목을 입력하세요"}</p>
        <p className="ed-serp__description">
          {date && <span>{date} — </span>}
          {description ? description.text : "메타 설명이 없습니다. 핵심 요약이나 메타 설명을 입력하세요."}
        </p>
      </div>

      <dl className="ed-serp__facts">
        <div data-over={title.truncated ? "" : undefined}>
          <dt>제목</dt>
          <dd>
            {title.width}px / {titleMaxPx}px {title.truncated ? "· 잘림" : "· 전체 표시"}
          </dd>
        </div>
        <div data-over={description?.truncated ? "" : undefined}>
          <dt>설명</dt>
          <dd>
            {description
              ? `${description.width}px / ${descriptionMaxPx}px ${description.truncated ? "· 잘림" : "· 전체 표시"}`
              : "비어 있음"}
          </dd>
        </div>
        <div>
          <dt>설명 출처</dt>
          <dd>{sourceLabel}</dd>
        </div>
        <div>
          <dt>주소</dt>
          <dd>{draft.slug ? meta.url : "슬러그를 입력하면 정해집니다"}</dd>
        </div>
      </dl>
    </div>
  );
}
