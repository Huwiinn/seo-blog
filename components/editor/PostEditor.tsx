"use client";

import type { Editor } from "@tiptap/react";
import { nanoid } from "nanoid";
import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { savePost, type SaveIntent } from "@/app/admin/actions";
import { formatTime } from "@/lib/format";
import { suggestSlug } from "@/lib/posts/slug";
import { analyzePost } from "@/lib/seo/analyze";
import { estimateTextWidth, type MeasureFn } from "@/lib/seo/measure";
import { canvasMeasure } from "./measure";
import { MetaPanel } from "./MetaPanel";
import { PreviewPane } from "./PreviewPane";
import { ActiveEditorContext, RichTextEditor } from "./RichTextEditor";
import { SectionCard } from "./SectionCard";
import { draftReducer, type EditorDraft } from "./state";
import { Toolbar } from "./Toolbar";
import type { DesignOption, EditorMeta } from "./types";

interface PostEditorProps {
  initial: EditorDraft;
  meta: EditorMeta;
  /** 다른 글이 쓰고 있는 슬러그 (중복 확인용) */
  takenSlugs: string[];
  designs: DesignOption[];
  defaultDesign: string;
}

interface ToastState {
  id: number;
  kind: "ok" | "error";
  message: string;
}

interface Backup {
  at: number;
  draft: EditorDraft;
}

/**
 * 개발 서버는 정적 경로 목록(generateStaticParams)을 한 박자 늦게 갱신한다. 새로 발행한 글의 주소를
 * 미리 두 번 불러 두면, 사용자가 "사이트에서 보기"를 눌렀을 때 바로 열린다.
 */
function warmPublicPage(slug: string) {
  const url = `/posts/${slug}`;
  const ping = () => fetch(url, { cache: "no-store" }).catch(() => undefined);
  void ping().then(() => window.setTimeout(ping, 400));
}

const SAVE_LABEL: Record<SaveIntent, string> = {
  draft: "임시저장했습니다",
  publish: "발행했습니다",
  update: "업데이트했습니다",
  unpublish: "초안으로 전환했습니다",
};

/**
 * 구조형 글 에디터.
 *
 *   제목(H1) 하나 → H2 섹션 카드 여러 개 → 각 카드 안의 H3 소제목 카드
 *
 * 본문 에디터에서는 제목을 만들 수 없으므로 제목 계층이 어긋날 수 없다.
 * 왼쪽에서 고치면 오른쪽 미리보기가 바로 따라온다.
 */
export function PostEditor({ initial, meta: initialMeta, takenSlugs, designs, defaultDesign }: PostEditorProps) {
  const [draft, dispatch] = useReducer(draftReducer, initial);
  const [saved, setSaved] = useState(initial);
  const [meta, setMeta] = useState(initialMeta);
  const [pending, setPending] = useState<SaveIntent | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [focusedBlock, setFocusedBlock] = useState<string | null>(null);
  const [epoch, setEpoch] = useState(0);
  const [touchModified, setTouchModified] = useState(true);
  const [backup, setBackup] = useState<Backup | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [measure, setMeasure] = useState<MeasureFn>(() => estimateTextWidth);

  const draftRef = useRef(draft);
  const slugTouched = useRef(Boolean(initial.slug));
  const pendingFocus = useRef<string | null>(null);
  const backupKey = `seo-blog:draft:${initial.id}`;
  const dirty = draft !== saved;
  const published = meta.status === "published";

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // 글자 폭 측정은 브라우저에서만 정확하다. 서버 렌더와 어긋나지 않게 마운트 뒤에 바꾼다.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canvas는 브라우저에만 있다
    setMeasure(() => canvasMeasure);
  }, []);

  const notify = useCallback((kind: ToastState["kind"], message: string) => {
    setToast({ id: Date.now(), kind, message });
  }, []);

  // Toast: 잠깐 떴다가 저절로 사라진다
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.kind === "error" ? 5000 : 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* ───── 저장 ───── */
  const save = useCallback(
    async (intent: SaveIntent) => {
      if (pending) return;
      const snapshot = draftRef.current;
      setPending(intent);
      setErrors([]);
      try {
        const result = await savePost(snapshot, intent, touchModified);
        if (!result.ok) {
          setErrors(result.errors);
          notify("error", "저장하지 못했습니다. 위의 안내를 확인해 주세요.");
          return;
        }
        setSaved(snapshot);
        setMeta((current) => {
          if (current.isNew) {
            // 새 글을 처음 저장하면 주소를 편집 주소로 바꿔, 새로고침해도 같은 글이 열리게 한다.
            window.history.replaceState(null, "", `/admin/posts/${snapshot.id}`);
          }
          return {
            status: result.status,
            isNew: false,
            slugLocked: result.slugLocked,
            updatedAt: result.updatedAt,
            publishedAt: result.publishedAt,
            modifiedAt: result.modifiedAt,
          };
        });
        window.localStorage.removeItem(backupKey);
        if (result.status === "published" && result.slug) warmPublicPage(result.slug);
        notify("ok", SAVE_LABEL[intent]);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        setErrors([`저장 중 오류가 났습니다: ${reason}`]);
        notify("error", "저장하지 못했습니다.");
      } finally {
        setPending(null);
      }
    },
    [pending, touchModified, backupKey, notify],
  );

  // ⌘S / Ctrl+S
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save(published ? "update" : "draft");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, published]);

  // 저장하지 않은 변경이 있으면 창을 닫기 전에 한 번 묻는다.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  /* ───── 브라우저 백업 ───── */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(backupKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Backup;
      const savedAt = initialMeta.updatedAt ? Date.parse(initialMeta.updatedAt) : 0;
      if (parsed?.draft?.id === initial.id && parsed.at > savedAt) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 브라우저에만 있다
        setBackup(parsed);
      } else {
        window.localStorage.removeItem(backupKey);
      }
    } catch {
      window.localStorage.removeItem(backupKey);
    }
  }, [backupKey, initial.id, initialMeta.updatedAt]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(backupKey, JSON.stringify({ at: Date.now(), draft } satisfies Backup));
      } catch {
        // 저장 공간이 없으면 백업만 건너뛴다.
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [draft, dirty, backupKey]);

  const restoreBackup = () => {
    if (!backup) return;
    dispatch({ type: "REPLACE", draft: backup.draft });
    slugTouched.current = Boolean(backup.draft.slug);
    setEpoch((value) => value + 1); // 본문 에디터를 복원한 내용으로 다시 만든다
    setBackup(null);
    notify("ok", "저장하지 않았던 내용을 복원했습니다");
  };

  const discardBackup = () => {
    window.localStorage.removeItem(backupKey);
    setBackup(null);
  };

  /* ───── 슬러그 제안 ───── */
  const slugSuggestion = useMemo(
    () => suggestSlug(draft.title, draft.focusKeyword),
    [draft.title, draft.focusKeyword],
  );

  const setTitle = (value: string) => {
    const title = value.replace(/\n/g, " ");
    dispatch({ type: "SET_FIELD", field: "title", value: title });
    if (!slugTouched.current && !meta.slugLocked) {
      dispatch({ type: "SET_FIELD", field: "slug", value: suggestSlug(title, draft.focusKeyword) });
    }
  };

  /* ───── 점검 ───── */
  const deferredDraft = useDeferredValue(draft);
  const slugTaken = Boolean(deferredDraft.slug) && takenSlugs.includes(deferredDraft.slug);
  const report = useMemo(
    () => analyzePost(deferredDraft, { measure, slugTaken }),
    [deferredDraft, measure, slugTaken],
  );

  /* ───── 초점 ───── */
  const requestFocus = useCallback((id: string) => {
    pendingFocus.current = id;
  }, []);

  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    document.querySelector<HTMLElement>(`[data-heading-id="${id}"]`)?.focus();
  });

  const onFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setFocusedBlock(target.closest<HTMLElement>("[data-block-id]")?.dataset.blockId ?? null);
    if (!target.closest(".ProseMirror") && !target.closest(".ed-toolbar")) setActiveEditor(null);
  };

  const jumpToBlock = useCallback((blockId: string) => {
    setMobileTab("edit");
    requestAnimationFrame(() => {
      const block = document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
      block?.scrollIntoView({ behavior: "smooth", block: "center" });
      block?.querySelector<HTMLElement>("[data-heading-id]")?.focus({ preventScroll: true });
    });
  }, []);

  const addSection = () => {
    const id = nanoid(10);
    dispatch({ type: "ADD_SECTION", id });
    requestFocus(id);
  };

  const sections = draft.content.sections;
  const busy = pending !== null;

  return (
    <ActiveEditorContext.Provider value={setActiveEditor}>
      <div className="ed" data-mobile-tab={mobileTab}>
        <header className="ed-bar">
          <Link href="/admin" className="ed-bar__back">
            ‹ 글 목록
          </Link>
          <p className="ed-bar__status" data-status={meta.status}>
            <span className="ed-pill" data-status={meta.status}>
              {published ? "발행됨" : "초안"}
            </span>
            <span aria-live="polite">
              {busy
                ? "저장하는 중…"
                : dirty
                  ? "저장하지 않은 변경 사항이 있습니다"
                  : meta.updatedAt
                    ? `${formatTime(meta.updatedAt)}에 저장됨`
                    : "아직 저장하지 않았습니다"}
            </span>
          </p>

          <div className="ed-bar__actions">
            {published ? (
              <>
                <label className="ed-check-inline" title="내용이 실질적으로 바뀌었을 때만 켭니다. 오탈자 수정이면 끕니다.">
                  <input
                    type="checkbox"
                    checked={touchModified}
                    onChange={(event) => setTouchModified(event.target.checked)}
                  />
                  수정일 갱신
                </label>
                {saved.slug && (
                  <a className="ed-btn" href={`/posts/${saved.slug}`} target="_blank" rel="noreferrer">
                    사이트에서 보기
                  </a>
                )}
                <button type="button" className="ed-btn" disabled={busy} onClick={() => save("unpublish")}>
                  초안으로 전환
                </button>
                <button
                  type="button"
                  className="ed-btn ed-btn--primary ed-btn--morph"
                  data-pending={pending === "update" ? "" : undefined}
                  disabled={busy || !report.canPublish}
                  onClick={() => save("update")}
                >
                  <span>업데이트</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="ed-btn ed-btn--morph"
                  data-pending={pending === "draft" ? "" : undefined}
                  disabled={busy}
                  onClick={() => save("draft")}
                >
                  <span>임시저장</span>
                </button>
                <button
                  type="button"
                  className="ed-btn ed-btn--primary ed-btn--morph"
                  data-pending={pending === "publish" ? "" : undefined}
                  disabled={busy || !report.canPublish}
                  title={report.canPublish ? undefined : "SEO 점검의 오류를 먼저 고쳐 주세요"}
                  onClick={() => save("publish")}
                >
                  <span>발행</span>
                </button>
              </>
            )}
          </div>
        </header>

        <div className="ed-switcher" role="tablist" aria-label="화면 전환">
          <button type="button" role="tab" aria-selected={mobileTab === "edit"} onClick={() => setMobileTab("edit")}>
            편집
          </button>
          <button type="button" role="tab" aria-selected={mobileTab === "preview"} onClick={() => setMobileTab("preview")}>
            미리보기 · 점검
          </button>
        </div>

        {backup && (
          <div className="ed-notice" role="status">
            <p>
              {formatTime(backup.at)}에 저장하지 않고 닫은 내용이 이 브라우저에 남아 있습니다.
            </p>
            <button type="button" className="ed-btn ed-btn--primary" onClick={restoreBackup}>
              복원
            </button>
            <button type="button" className="ed-btn" onClick={discardBackup}>
              버리기
            </button>
          </div>
        )}

        {errors.length > 0 && (
          <div className="ed-notice ed-notice--error" role="alert">
            <ul>
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            <button type="button" className="ed-btn" onClick={() => setErrors([])}>
              닫기
            </button>
          </div>
        )}

        <div className="ed-split">
          <div className="ed-pane ed-pane--edit" onFocusCapture={onFocusCapture}>
            <Toolbar editor={activeEditor} onError={(message) => notify("error", message)} />

            <div className="ed-doc">
              <div className="ed-title" data-block-id="title">
                <span className="ed-badge ed-badge--h1">H1</span>
                <textarea
                  className="ed-title__input"
                  rows={1}
                  value={draft.title}
                  placeholder="제목 — 이 글의 유일한 H1"
                  aria-label="글 제목 (H1)"
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
                />
                <span className="ed-count">{draft.title.length}자</span>
              </div>

              <MetaPanel
                defaultOpen={!initial.slug}
                draft={draft}
                report={report}
                slugLocked={meta.slugLocked}
                slugTaken={slugTaken}
                slugSuggestion={slugSuggestion}
                dispatch={dispatch}
                onSlugEdited={() => {
                  slugTouched.current = true;
                }}
                onError={(message) => notify("error", message)}
              />

              <div className="ed-summary" data-block-id="summary">
                <label htmlFor="ed-summary">
                  핵심 요약 <span>검색·AI 답변이 그대로 인용하기 좋은 2~3문장</span>
                </label>
                <textarea
                  id="ed-summary"
                  rows={3}
                  value={draft.summary}
                  placeholder="이 글의 답을 먼저 적습니다. 메타 설명을 비워 두면 이 문장이 검색 결과 설명으로 쓰입니다."
                  onChange={(event) => dispatch({ type: "SET_FIELD", field: "summary", value: event.target.value })}
                />
                <span className="ed-count">{draft.summary.trim().length}자 · 권장 60~220자</span>
              </div>

              <div className="ed-block ed-block--intro" data-block-id="intro">
                <div className="ed-block__head">
                  <span className="ed-badge">도입부</span>
                  <p className="ed-block__caption">제목 바로 아래, 첫 H2 앞에 오는 문단</p>
                </div>
                <RichTextEditor
                  key={epoch}
                  initialContent={draft.content.intro}
                  placeholder="첫 문단에서 글의 주제와 답을 바로 밝힙니다."
                  label="도입부 본문"
                  onChange={(body) => dispatch({ type: "SET_INTRO", body })}
                />
              </div>

              {sections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  count={sections.length}
                  epoch={epoch}
                  dispatch={dispatch}
                  requestFocus={requestFocus}
                />
              ))}

              <button type="button" className="ed-add ed-add--h2" onClick={addSection}>
                <span aria-hidden="true">+</span> H2 섹션 추가
              </button>
            </div>
          </div>

          <PreviewPane
            draft={deferredDraft}
            meta={meta}
            report={report}
            measure={measure}
            designs={designs}
            defaultDesign={defaultDesign}
            focusedBlock={focusedBlock}
            onJump={jumpToBlock}
          />
        </div>

        {toast && (
          <div key={toast.id} className="ed-toast" data-kind={toast.kind} role="status" aria-live="polite">
            {toast.message}
          </div>
        )}
      </div>
    </ActiveEditorContext.Provider>
  );
}
