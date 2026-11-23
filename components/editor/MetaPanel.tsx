"use client";

import { useRef, useState, type Dispatch, type KeyboardEvent } from "react";
import { CATEGORIES, SITE } from "@/constant";
import { isValidSlug, sanitizeSlugInput, SLUG_RECOMMENDED_LENGTH } from "@/lib/posts/slug";
import type { SeoReport } from "@/lib/seo/analyze";
import { SEO_RULES } from "@/lib/seo/rules";
import type { DraftAction, EditorDraft } from "./state";
import { uploadImage } from "./upload";

interface MetaPanelProps {
  /** 슬러그가 아직 없는 글은 펼친 채로 시작한다 */
  defaultOpen: boolean;
  draft: EditorDraft;
  report: SeoReport;
  slugLocked: boolean;
  slugTaken: boolean;
  slugSuggestion: string;
  dispatch: Dispatch<DraftAction>;
  onSlugEdited: () => void;
  onError: (message: string) => void;
}

/** 검색 결과에서 잘리는 폭까지 얼마나 찼는지 보여 주는 막대 (Bar grow) */
function WidthGauge({ width, min, max, label }: { width: number; min: number; max: number; label: string }) {
  const ratio = Math.min(width / max, 1.15);
  const state = width === 0 ? "empty" : width > max ? "over" : width < min ? "short" : "good";
  const note =
    state === "over" ? "잘릴 수 있음" : state === "short" ? "조금 짧음" : state === "good" ? "적절" : "비어 있음";
  return (
    <div className="ed-gauge" data-state={state}>
      <div className="ed-gauge__track" aria-hidden="true">
        <span className="ed-gauge__fill" style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
      </div>
      <p className="ed-gauge__text">
        {label} {width}px / {max}px · {note}
      </p>
    </div>
  );
}

/**
 * 검색 노출 설정. 접었다 펼 수 있다 (Accordion).
 * 메타 제목·설명을 비워 두면 H1 제목과 핵심 요약이 대신 쓰인다.
 */
export function MetaPanel({
  defaultOpen,
  draft,
  report,
  slugLocked,
  slugTaken,
  slugSuggestion,
  dispatch,
  onSlugEdited,
  onError,
}: MetaPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends "slug" | "category" | "metaTitle" | "metaDescription" | "focusKeyword" | "tags" | "coverImage" | "featured">(
    field: K,
    value: EditorDraft[K],
  ) => dispatch({ type: "SET_FIELD", field, value });

  const addTag = (raw: string) => {
    const tag = raw.replace(/,/g, "").trim();
    setTagInput("");
    if (!tag || draft.tags.includes(tag) || draft.tags.length >= 20) return;
    set("tags", [...draft.tags, tag]);
  };

  const onTagKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return; // 한글 조합 중에는 Enter를 무시한다
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
    } else if (event.key === "Backspace" && !tagInput && draft.tags.length > 0) {
      set("tags", draft.tags.slice(0, -1));
    }
  };

  const pickCover = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const image = await uploadImage(file);
      set("coverImage", { ...image, alt: draft.coverImage?.alt ?? "" });
    } catch (error) {
      onError(error instanceof Error ? error.message : "이미지를 올리지 못했습니다.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const slugProblem = !draft.slug
    ? null
    : !isValidSlug(draft.slug)
      ? "영문 소문자·숫자·하이픈만 쓸 수 있고, 하이픈으로 끝날 수 없습니다."
      : slugTaken
        ? "다른 글이 이미 쓰고 있는 슬러그입니다."
        : draft.slug.length > SLUG_RECOMMENDED_LENGTH
          ? `조금 깁니다 (${draft.slug.length}자, 권장 ${SLUG_RECOMMENDED_LENGTH}자 이하).`
          : null;

  return (
    <details className="ed-meta" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="ed-meta__summary">
        <span>검색 노출 설정</span>
        <span className="ed-meta__path" data-missing={draft.slug ? undefined : ""}>
          {draft.slug ? `/posts/${draft.slug}` : "슬러그를 입력하세요"}
        </span>
      </summary>

      <div className="ed-meta__grid">
        <fieldset className="ed-field ed-field--full">
          <legend>주제</legend>
          <div className="ed-segment">
            {CATEGORIES.map((category) => (
              <label key={category.id} data-cat={category.id}>
                <input
                  type="radio"
                  name="category"
                  checked={draft.category === category.id}
                  onChange={() => set("category", category.id)}
                />
                <span>{category.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="ed-field ed-field--full">
          <label htmlFor="ed-slug">슬러그 (주소)</label>
          <div className="ed-slug" data-invalid={slugProblem && (slugTaken || !isValidSlug(draft.slug)) ? "" : undefined}>
            <span aria-hidden="true">{SITE.url.replace(/^https?:\/\//, "")}/posts/</span>
            <input
              id="ed-slug"
              value={draft.slug}
              disabled={slugLocked}
              placeholder="what-is-geo"
              spellCheck={false}
              autoCapitalize="none"
              onChange={(event) => {
                onSlugEdited();
                set("slug", sanitizeSlugInput(event.target.value));
              }}
            />
          </div>
          {slugLocked ? (
            <p className="ed-hint">발행한 글의 주소는 바꿀 수 없습니다. 기존 링크가 끊어지기 때문입니다.</p>
          ) : slugProblem ? (
            <p className="ed-hint ed-hint--warn">{slugProblem}</p>
          ) : !draft.slug && slugSuggestion ? (
            <p className="ed-hint">
              제안:{" "}
              <button type="button" className="ed-link" onClick={() => set("slug", slugSuggestion)}>
                {slugSuggestion}
              </button>
            </p>
          ) : !draft.slug ? (
            <p className="ed-hint">영문 소문자·숫자·하이픈으로 직접 입력합니다. 예: search-intent-basics</p>
          ) : null}
        </div>

        <div className="ed-field">
          <label htmlFor="ed-keyword">포커스 키워드</label>
          <input
            id="ed-keyword"
            value={draft.focusKeyword}
            placeholder="이 글이 답하려는 핵심 검색어"
            onChange={(event) => set("focusKeyword", event.target.value)}
          />
        </div>

        <div className="ed-field">
          <label htmlFor="ed-tags">태그</label>
          <div className="ed-tags">
            {draft.tags.map((tag) => (
              <span key={tag} className="ed-tag">
                {tag}
                <button
                  type="button"
                  aria-label={`${tag} 태그 지우기`}
                  onClick={() => set("tags", draft.tags.filter((item) => item !== tag))}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="ed-tags"
              value={tagInput}
              placeholder={draft.tags.length ? "" : "Enter로 추가"}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={onTagKey}
              onBlur={() => addTag(tagInput)}
            />
          </div>
        </div>

        <div className="ed-field ed-field--full">
          <label htmlFor="ed-meta-title">메타 제목</label>
          <input
            id="ed-meta-title"
            value={draft.metaTitle}
            placeholder={draft.title || "비워 두면 H1 제목을 씁니다"}
            onChange={(event) => set("metaTitle", event.target.value)}
          />
          <WidthGauge
            label={`"… | ${SITE.name}" 포함`}
            width={report.stats.titleWidth}
            min={SEO_RULES.serp.titleMinPx}
            max={SEO_RULES.serp.titleMaxPx}
          />
        </div>

        <div className="ed-field ed-field--full">
          <label htmlFor="ed-meta-description">메타 설명</label>
          <textarea
            id="ed-meta-description"
            rows={2}
            value={draft.metaDescription}
            placeholder={draft.summary || "비워 두면 핵심 요약을 씁니다"}
            onChange={(event) => set("metaDescription", event.target.value)}
          />
          <WidthGauge
            label="검색 결과 설명"
            width={report.stats.descriptionWidth}
            min={SEO_RULES.serp.descriptionMinPx}
            max={SEO_RULES.serp.descriptionMaxPx}
          />
        </div>

        <div className="ed-field ed-field--full">
          <span className="ed-label">대표 이미지</span>
          <div className="ed-cover">
            {draft.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- 에디터 안의 작은 미리보기
              <img src={draft.coverImage.src} alt="" width={draft.coverImage.width} height={draft.coverImage.height} />
            ) : (
              <span className="ed-cover__empty">없음 · 주제 색 그래픽 사용</span>
            )}
            <div className="ed-cover__side">
              <div className="ed-cover__actions">
                <button type="button" className="ed-btn" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? "올리는 중…" : draft.coverImage ? "바꾸기" : "이미지 올리기"}
                </button>
                {draft.coverImage && (
                  <button type="button" className="ed-btn" onClick={() => set("coverImage", null)}>
                    지우기
                  </button>
                )}
              </div>
              {draft.coverImage && (
                <input
                  aria-label="대표 이미지 설명 (alt)"
                  value={draft.coverImage.alt}
                  placeholder="이미지 설명 (alt) — 필수"
                  onChange={(event) =>
                    draft.coverImage && set("coverImage", { ...draft.coverImage, alt: event.target.value })
                  }
                />
              )}
              <p className="ed-hint">올리면 WebP로 바꾸고 폭 1600px로 줄이며 위치 정보(EXIF)를 지웁니다.</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              hidden
              onChange={(event) => pickCover(event.target.files?.[0])}
            />
          </div>
        </div>

        <label className="ed-switch ed-field--full">
          <input
            type="checkbox"
            role="switch"
            checked={draft.featured}
            onChange={(event) => set("featured", event.target.checked)}
          />
          <span className="ed-switch__track" aria-hidden="true" />
          추천 글로 표시 (홈 상단에 먼저 노출)
        </label>
      </div>
    </details>
  );
}
