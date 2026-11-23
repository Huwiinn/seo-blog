"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { previewLinks } from "@/designs/links";
import { getDesign } from "@/designs/registry";
import { ArticleView } from "@/designs/views";
import { toPostArticle } from "@/lib/posts/mappers";
import type { SiteData } from "@/lib/posts/types";
import type { EditorDraft } from "./state";
import { EDITOR_SOURCE, PREVIEW_SOURCE } from "./types";

interface PreviewState {
  seq: number;
  draft: EditorDraft;
  design: string;
  publishedAt: string | null;
  modifiedAt: string | null;
}

/**
 * 미리보기 iframe 안에서 도는 컴포넌트. 에디터가 보낸 초안을 받아 고른 시안의 글 상세 화면으로 그린다.
 * 운영 페이지와 같은 ArticleView·시안 컴포넌트를 쓰므로 결과가 같다.
 */
export function PreviewReceiver({ site }: { site: SiteData }) {
  const [state, setState] = useState<PreviewState | null>(null);

  useEffect(() => {
    let received = false;

    const onMessage = (event: MessageEvent) => {
      // 같은 출처의 부모 창(에디터)이 보낸 메시지만 받는다.
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const data = event.data;
      if (!data || data.source !== EDITOR_SOURCE) return;

      if (data.type === "draft") {
        received = true;
        setState((current) =>
          current && data.seq <= current.seq
            ? current // 늦게 도착한 예전 메시지는 버린다
            : {
                seq: data.seq,
                draft: data.draft,
                design: data.design,
                publishedAt: data.publishedAt ?? null,
                modifiedAt: data.modifiedAt ?? null,
              },
        );
      } else if (data.type === "scroll" && typeof data.blockId === "string") {
        // 제목을 고치는 동안 앵커는 바뀌므로, 변하지 않는 섹션 id로 찾는다.
        document
          .querySelector(`[data-section-id="${CSS.escape(data.blockId)}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const announce = () =>
      window.parent.postMessage({ source: PREVIEW_SOURCE, type: "ready" }, window.location.origin);

    window.addEventListener("message", onMessage);
    announce();
    // 에디터가 아직 듣고 있지 않을 때 보낸 신호는 사라진다. 첫 초안을 받을 때까지 다시 알린다.
    const retry = window.setInterval(() => {
      if (received) window.clearInterval(retry);
      else announce();
    }, 300);

    return () => {
      window.clearInterval(retry);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const view = useMemo(() => {
    if (!state) return null;
    const theme = getDesign(state.design);
    if (!theme) return null;
    const post = toPostArticle({
      ...state.draft,
      publishedAt: state.publishedAt ?? new Date().toISOString(),
      modifiedAt: state.modifiedAt,
    });
    const others = site.posts.filter((item) => item.id !== post.id);
    const related = [
      ...others.filter((item) => item.category === post.category),
      ...others.filter((item) => item.category !== post.category),
    ].slice(0, 3);
    return { theme, post, related };
  }, [state, site]);

  // 미리보기에서는 다른 페이지로 이동하지 않는다. 목차 같은 #앵커 링크만 동작한다.
  const blockNavigation = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("#") && href.length > 1) return;
    event.preventDefault();
  };

  if (!view) {
    return <p className="preview-waiting">에디터에서 글을 불러오는 중입니다…</p>;
  }

  return (
    <div onClickCapture={blockNavigation}>
      <ArticleView
        theme={view.theme}
        links={previewLinks}
        site={site}
        post={view.post}
        related={view.related}
        previous={null}
        next={null}
      />
    </div>
  );
}
