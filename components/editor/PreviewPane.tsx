"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SeoReport } from "@/lib/seo/analyze";
import type { MeasureFn } from "@/lib/seo/measure";
import { ScoreRing, SeoPanel } from "./SeoPanel";
import { SerpPreview } from "./SerpPreview";
import type { EditorDraft } from "./state";
import { EDITOR_SOURCE, PREVIEW_SOURCE, type DesignOption, type EditorMeta } from "./types";

type Tab = "preview" | "serp" | "seo";
type Device = "mobile" | "desktop";

const DEVICE_WIDTH: Record<Device, number> = { mobile: 390, desktop: 1280 };

interface PreviewPaneProps {
  draft: EditorDraft;
  meta: EditorMeta;
  report: SeoReport;
  measure: MeasureFn;
  designs: DesignOption[];
  defaultDesign: string;
  /** 편집 중인 섹션 id. 미리보기가 그 섹션으로 스크롤한다. */
  focusedBlock: string | null;
  onJump: (blockId: string) => void;
}

/**
 * 오른쪽 패널: 실시간 미리보기 · 검색 결과 · SEO 점검.
 *
 * 미리보기는 /admin/preview를 iframe으로 열고 postMessage로 초안을 보낸다. iframe은 진짜 뷰포트를
 * 가지므로 미디어쿼리·고정 헤더·스크롤 연동이 운영 페이지와 똑같이 동작하고, 운영 페이지와 같은
 * 컴포넌트로 그리므로 보이는 그대로 발행된다.
 */
export function PreviewPane({
  draft,
  meta,
  report,
  measure,
  designs,
  defaultDesign,
  focusedBlock,
  onJump,
}: PreviewPaneProps) {
  const [tab, setTab] = useState<Tab>("preview");
  const [design, setDesign] = useState(defaultDesign);
  const [device, setDevice] = useState<Device>("mobile");
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState({ width: 0, height: 0 });

  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);

  const payload = useMemo(
    () => ({
      draft,
      design,
      publishedAt: meta.publishedAt,
      modifiedAt: meta.modifiedAt,
    }),
    [draft, design, meta.publishedAt, meta.modifiedAt],
  );
  const latest = useRef(payload);
  useEffect(() => {
    latest.current = payload;
  }, [payload]);

  const send = useCallback((message: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage(
      { source: EDITOR_SOURCE, ...message },
      window.location.origin,
    );
  }, []);

  // iframe이 준비됐다고 알리면(처음 로드, 개발 중 새로고침 포함) 최신 초안을 보낸다.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.source !== PREVIEW_SOURCE || event.data.type !== "ready") return;
      setReady(true);
      send({ type: "draft", seq: ++sequence.current, ...latest.current });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  // 초안이 바뀔 때마다 보내되, 한 프레임에 한 번으로 제한한다.
  useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(() => {
      send({ type: "draft", seq: ++sequence.current, ...payload });
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, payload, send]);

  useEffect(() => {
    if (ready && focusedBlock) send({ type: "scroll", blockId: focusedBlock });
  }, [ready, focusedBlock, send]);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setStage({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const frameWidth = DEVICE_WIDTH[device];
  const scale = stage.width > 0 ? Math.min(1, stage.width / frameWidth) : 1;
  const frameHeight = stage.height > 0 ? stage.height / scale : 800;

  const tabs: { id: Tab; label: string }[] = [
    { id: "preview", label: "미리보기" },
    { id: "serp", label: "검색 결과" },
    { id: "seo", label: "SEO 점검" },
  ];

  return (
    <aside className="ed-pane ed-pane--preview" aria-label="미리보기와 점검">
      <div className="ed-preview__bar">
        <div className="ed-tabs" role="tablist" aria-label="오른쪽 패널">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`ed-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`ed-panel-${item.id}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {item.id === "seo" && <ScoreRing score={report.score} size={22} />}
            </button>
          ))}
        </div>

        {tab === "preview" && (
          <div className="ed-preview__controls">
            <div className="ed-pills" role="group" aria-label="미리보기 시안">
              {designs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={design === item.id}
                  title={item.name}
                  onClick={() => setDesign(item.id)}
                >
                  {item.name.slice(0, 1)}
                  <span className="visually-hidden">{item.name.slice(1)}</span>
                </button>
              ))}
            </div>
            <div className="ed-pills" role="group" aria-label="화면 크기">
              <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>
                모바일
              </button>
              <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>
                데스크톱
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="ed-preview__panel"
        role="tabpanel"
        id="ed-panel-preview"
        aria-labelledby="ed-tab-preview"
        hidden={tab !== "preview"}
      >
        <div ref={stageRef} className="ed-stage" data-device={device}>
          <iframe
            ref={frameRef}
            src="/admin/preview"
            title="글 미리보기"
            className="ed-stage__frame"
            style={{
              width: frameWidth,
              height: frameHeight,
              transform: `scale(${scale})`,
              marginLeft: Math.max(0, (stage.width - frameWidth * scale) / 2),
            }}
          />
          {!ready && <p className="ed-stage__loading">미리보기를 준비하는 중…</p>}
        </div>
        <p className="ed-preview__note">
          {designs.find((item) => item.id === design)?.name} · {frameWidth}px
          {scale < 1 ? ` (${Math.round(scale * 100)}%로 축소)` : ""} · 발행 화면과 같은 컴포넌트로 그립니다
        </p>
      </div>

      <div
        className="ed-preview__panel ed-preview__panel--scroll"
        role="tabpanel"
        id="ed-panel-serp"
        aria-labelledby="ed-tab-serp"
        hidden={tab !== "serp"}
      >
        <SerpPreview draft={draft} measure={measure} publishedAt={meta.publishedAt} />
      </div>

      <div
        className="ed-preview__panel ed-preview__panel--scroll"
        role="tabpanel"
        id="ed-panel-seo"
        aria-labelledby="ed-tab-seo"
        hidden={tab !== "seo"}
      >
        <SeoPanel report={report} onJump={onJump} />
      </div>
    </aside>
  );
}
