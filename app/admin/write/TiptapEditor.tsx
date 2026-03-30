"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type ToolbarProps = { editor: Editor };

function Toolbar({ editor }: ToolbarProps) {
  const btn = (active: boolean) =>
    `tiptap-btn${active ? " tiptap-btn--active" : ""}`;

  return (
    <div className="tiptap-toolbar">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}><b>B</b></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><i>I</i></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}><s>S</s></button>

      <span className="tiptap-divider" />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>

      <span className="tiptap-divider" />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• 목록</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1. 목록</button>

      <span className="tiptap-divider" />

      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>인용</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive("code"))}>코드</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive("codeBlock"))}>코드블록</button>

      <span className="tiptap-divider" />

      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="tiptap-btn">구분선</button>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className="tiptap-btn" disabled={!editor.can().undo()}>↩</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className="tiptap-btn" disabled={!editor.can().redo()}>↪</button>
    </div>
  );
}

type Props = {
  onChange: (html: string) => void;
};

export default function TiptapEditor({ onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "본문을 작성하세요..." }),
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="tiptap-wrap">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}
