"use client";

import { useActionState, useState } from "react";
import { createPost, PostFormState } from "./actions";
import TiptapEditor from "./TiptapEditor";

const CATEGORIES = [
  { label: "테크니컬 SEO", value: "테크니컬 SEO", href: "/technical-seo" },
  { label: "콘텐츠 SEO", value: "콘텐츠 SEO", href: "/content-seo" },
  { label: "마케팅 용어", value: "마케팅 용어", href: "/marketing-terms" },
  { label: "GA", value: "GA", href: "/ga" },
  { label: "학습 로그", value: "학습 로그", href: "/learning-log" },
];

const initialState: PostFormState = {};

const inputClass =
  "rounded-lg border border-(--line) bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)";

export default function WriteForm() {
  const [state, formAction, isPending] = useActionState(createPost, initialState);
  const [content, setContent] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {/* 제목 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          제목 <span className="text-(--accent)">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="콘텐츠 제목을 입력하세요"
          className={inputClass}
        />
      </div>

      {/* 카테고리 */}
      <CategorySelect />

      {/* 요약 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="summary" className="text-sm font-medium text-foreground">
          요약 <span className="text-(--accent)">*</span>
        </label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={2}
          placeholder="검색 결과에 표시될 짧은 설명 (1-2문장)"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* 본문 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          본문 <span className="text-(--accent)">*</span>
        </label>
        <input type="hidden" name="content" value={content} />
        <TiptapEditor onChange={setContent} />
      </div>

      {/* 태그 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tags" className="text-sm font-medium text-foreground">
          태그
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="쉼표로 구분 (예: 크롤링, 인덱싱, 사이트맵)"
          className={inputClass}
        />
      </div>

      {/* 주요 콘텐츠 여부 */}
      <div className="flex items-center gap-3">
        <input
          id="featured"
          name="featured"
          type="checkbox"
          className="h-4 w-4 rounded accent-(--accent)"
        />
        <label htmlFor="featured" className="text-sm text-foreground">
          홈 화면 추천 콘텐츠로 표시
        </label>
      </div>

      {/* 발행 버튼 */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-(--accent) px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
        >
          {isPending ? "발행 중..." : "발행하기"}
        </button>
      </div>
    </form>
  );
}

function CategorySelect() {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="category" className="text-sm font-medium text-foreground">
        카테고리 <span className="text-(--accent)">*</span>
      </label>
      <select
        id="category"
        name="category"
        required
        defaultValue=""
        onChange={(e) => {
          const selected = CATEGORIES.find((c) => c.value === e.target.value);
          const hrefInput = document.getElementById("href") as HTMLInputElement;
          if (hrefInput && selected) hrefInput.value = selected.href;
        }}
        className="rounded-lg border border-(--line) bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
      >
        <option value="" disabled>
          카테고리를 선택하세요
        </option>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <input type="hidden" id="href" name="href" />
    </div>
  );
}
