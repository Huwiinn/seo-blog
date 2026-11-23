"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { isSafeHref } from "@/lib/content/url";
import { uploadImage, type UploadedImage } from "./upload";

interface ToolbarProps {
  editor: Editor | null;
  onError: (message: string) => void;
}

type Panel = { kind: "link"; value: string } | { kind: "image"; image: UploadedImage; alt: string } | null;

function normalizeHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^([a-z][a-z0-9+.-]*:|\/|#|\.)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * 본문 서식 툴바. 편집 영역 위에 하나만 있고, 마지막으로 초점을 둔 본문 에디터에 작용한다.
 * 제목(H2/H3) 버튼은 없다. 제목은 섹션 카드로만 만든다.
 */
export function Toolbar({ editor, onError }: ToolbarProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [shake, setShake] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            bold: current.isActive("bold"),
            italic: current.isActive("italic"),
            strike: current.isActive("strike"),
            code: current.isActive("code"),
            link: current.isActive("link"),
            bulletList: current.isActive("bulletList"),
            orderedList: current.isActive("orderedList"),
            blockquote: current.isActive("blockquote"),
            codeBlock: current.isActive("codeBlock"),
            table: current.isActive("table"),
            canUndo: current.can().undo(),
            canRedo: current.can().redo(),
          }
        : null,
  });

  const disabled = !editor;

  const button = (
    label: string,
    content: ReactNode,
    active: boolean | undefined,
    run: () => void,
    isDisabled = disabled,
  ) => (
    <button
      type="button"
      className="ed-tool"
      title={label}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={isDisabled}
      // 버튼을 눌러도 본문 에디터의 초점과 선택 영역을 잃지 않게 한다
      onMouseDown={(event) => event.preventDefault()}
      onClick={run}
    >
      {content}
    </button>
  );

  const openLink = () => {
    if (!editor) return;
    setPanel({ kind: "link", value: (editor.getAttributes("link").href as string | undefined) ?? "" });
  };

  const applyLink = (event: FormEvent) => {
    event.preventDefault();
    if (!editor || panel?.kind !== "link") return;
    const href = normalizeHref(panel.value);
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setPanel(null);
      return;
    }
    if (!isSafeHref(href)) {
      // Shake: 잘못 입력하면 입력 칸이 좌우로 흔들린다
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setPanel(null);
  };

  const pickImage = async (file: File | undefined) => {
    if (!file || !editor) return;
    setUploading(true);
    try {
      const image = await uploadImage(file);
      setPanel({ kind: "image", image, alt: "" });
    } catch (error) {
      onError(error instanceof Error ? error.message : "이미지를 올리지 못했습니다.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const insertImage = (event: FormEvent) => {
    event.preventDefault();
    if (!editor || panel?.kind !== "image") return;
    editor
      .chain()
      .focus()
      .setImage({
        src: panel.image.src,
        alt: panel.alt.trim(),
        width: panel.image.width,
        height: panel.image.height,
      })
      .run();
    setPanel(null);
  };

  return (
    <div className="ed-toolbar" role="toolbar" aria-label="본문 서식">
      <div className="ed-toolbar__row">
        {button("굵게 (⌘B)", <b>B</b>, state?.bold, () => editor?.chain().focus().toggleBold().run())}
        {button("기울임 (⌘I)", <i>I</i>, state?.italic, () => editor?.chain().focus().toggleItalic().run())}
        {button("취소선", <s>S</s>, state?.strike, () => editor?.chain().focus().toggleStrike().run())}
        {button("인라인 코드", <code>{"<>"}</code>, state?.code, () => editor?.chain().focus().toggleCode().run())}
        <span className="ed-toolbar__sep" aria-hidden="true" />
        {button("링크", "링크", state?.link, openLink)}
        {button(uploading ? "올리는 중…" : "이미지", uploading ? "올리는 중…" : "이미지", undefined, () => fileRef.current?.click(), disabled || uploading)}
        <span className="ed-toolbar__sep" aria-hidden="true" />
        {button("글머리 목록", "• 목록", state?.bulletList, () => editor?.chain().focus().toggleBulletList().run())}
        {button("번호 목록", "1. 목록", state?.orderedList, () => editor?.chain().focus().toggleOrderedList().run())}
        {button("인용", "인용", state?.blockquote, () => editor?.chain().focus().toggleBlockquote().run())}
        {button("코드 블록", "코드", state?.codeBlock, () => editor?.chain().focus().toggleCodeBlock().run())}
        {button("구분선", "—", undefined, () => editor?.chain().focus().setHorizontalRule().run())}
        {button("표 넣기 (3×3)", "표", state?.table, () =>
          editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        )}
        {state?.table && (
          <>
            {button("아래에 행 추가", "+행", undefined, () => editor?.chain().focus().addRowAfter().run())}
            {button("오른쪽에 열 추가", "+열", undefined, () => editor?.chain().focus().addColumnAfter().run())}
            {button("행 삭제", "−행", undefined, () => editor?.chain().focus().deleteRow().run())}
            {button("열 삭제", "−열", undefined, () => editor?.chain().focus().deleteColumn().run())}
            {button("표 삭제", "표 삭제", undefined, () => editor?.chain().focus().deleteTable().run())}
          </>
        )}
        <span className="ed-toolbar__sep" aria-hidden="true" />
        {button("실행 취소 (⌘Z)", "↶", undefined, () => editor?.chain().focus().undo().run(), disabled || !state?.canUndo)}
        {button("다시 실행 (⇧⌘Z)", "↷", undefined, () => editor?.chain().focus().redo().run(), disabled || !state?.canRedo)}
        {disabled && <span className="ed-toolbar__hint">본문을 누르면 서식 버튼을 쓸 수 있습니다</span>}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          hidden
          onChange={(event) => pickImage(event.target.files?.[0])}
        />
      </div>

      {panel?.kind === "link" && (
        <form className="ed-toolbar__panel" onSubmit={applyLink} data-shake={shake ? "" : undefined}>
          <label htmlFor="ed-link-input">링크 주소</label>
          <input
            id="ed-link-input"
            type="text"
            inputMode="url"
            autoFocus
            placeholder="https://… 또는 /posts/글-주소"
            value={panel.value}
            onChange={(event) => setPanel({ kind: "link", value: event.target.value })}
            onKeyDown={(event) => event.key === "Escape" && setPanel(null)}
          />
          <button type="submit" className="ed-btn ed-btn--primary">
            적용
          </button>
          <button type="button" className="ed-btn" onClick={() => setPanel(null)}>
            닫기
          </button>
          <p className="ed-toolbar__note">
            비워서 적용하면 링크가 지워집니다. 다른 사이트 링크는 새 탭으로 열리고, 내 글은 /posts/…로 연결하면 내부 링크가 됩니다.
          </p>
        </form>
      )}

      {panel?.kind === "image" && (
        <form className="ed-toolbar__panel" onSubmit={insertImage}>
          <label htmlFor="ed-alt-input">이미지 설명 (alt)</label>
          <input
            id="ed-alt-input"
            type="text"
            autoFocus
            placeholder="이미지가 무엇을 보여 주는지 한 문장으로"
            value={panel.alt}
            onChange={(event) => setPanel({ ...panel, alt: event.target.value })}
            onKeyDown={(event) => event.key === "Escape" && setPanel(null)}
          />
          <button type="submit" className="ed-btn ed-btn--primary">
            넣기
          </button>
          <button type="button" className="ed-btn" onClick={() => setPanel(null)}>
            취소
          </button>
          <p className="ed-toolbar__note">
            검색엔진과 화면 낭독기는 이 설명으로 이미지를 이해합니다. 장식용 이미지가 아니라면 꼭 적어 주세요.
          </p>
        </form>
      )}
    </div>
  );
}
