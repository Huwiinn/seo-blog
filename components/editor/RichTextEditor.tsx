"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { bodyExtensions } from "@/lib/content/extensions";
import type { RichText } from "@/lib/content/types";

/** 지금 글자를 치고 있는 본문 에디터. 하나뿐인 툴바가 이 에디터에 작용한다. */
export const ActiveEditorContext = createContext<(editor: Editor) => void>(() => {});

interface RichTextEditorProps {
  /** 처음 한 번만 쓰인다. 이후 내용은 에디터가 직접 관리한다 (비제어). */
  initialContent: RichText;
  onChange: (content: RichText) => void;
  placeholder: string;
  label: string;
}

/**
 * 본문 에디터. heading이 꺼진 공유 확장을 쓰므로 여기서는 제목을 만들 수 없다.
 * 한 화면에 수십 개가 생기므로 트랜잭션마다 다시 그리지 않게 한다.
 */
export function RichTextEditor({ initialContent, onChange, placeholder, label }: RichTextEditorProps) {
  const setActive = useContext(ActiveEditorContext);
  const onChangeRef = useRef(onChange);
  const setActiveRef = useRef(setActive);

  useEffect(() => {
    onChangeRef.current = onChange;
    setActiveRef.current = setActive;
  });

  // 처음 받은 내용만 쓴다. 이후에는 부모가 넘기는 값이 바뀌어도 에디터를 건드리지 않는다.
  const [content] = useState(initialContent);
  const extensions = useMemo(
    () => [...bodyExtensions, Placeholder.configure({ placeholder })],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "post-body ed-rich__content",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(current.getJSON()),
    onFocus: ({ editor: current }) => setActiveRef.current(current),
  });

  return (
    <div className="ed-rich">
      {editor ? <EditorContent editor={editor} /> : <div className="ed-rich__loading" aria-hidden="true" />}
    </div>
  );
}
