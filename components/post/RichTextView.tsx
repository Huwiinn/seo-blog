import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import type { ReactNode } from "react";
import { SITE } from "@/constant";
import { bodyExtensions } from "@/lib/content/extensions";
import type { RichText } from "@/lib/content/types";
import { classifyHref, isSafeHref, isSafeImageSrc } from "@/lib/content/url";

/**
 * 본문 JSON → React 요소. HTML 문자열을 주입하지 않는다.
 * 훅을 쓰지 않으므로 서버 컴포넌트(운영 페이지)와 클라이언트(에디터 미리보기)에서 똑같이 동작한다.
 */
function render(doc: RichText): ReactNode {
  return renderToReactElement({
    content: doc,
    extensions: bodyExtensions,
    options: {
      nodeMapping: {
        // 빈 문단(에디터의 끝 줄 등)은 출력하지 않는다.
        paragraph: ({ node, children }) =>
          node.content.size === 0 ? null : <p>{children}</p>,
        codeBlock: ({ node, children }) => (
          <pre data-language={node.attrs.language || undefined}>
            <code>{children}</code>
          </pre>
        ),
        // 좁은 화면에서 표가 페이지를 밀어내지 않도록 가로 스크롤 영역으로 감싼다.
        table: ({ children }) => (
          <div className="post-table" role="region" aria-label="표" tabIndex={0}>
            <table>
              <tbody>{children}</tbody>
            </table>
          </div>
        ),
        image: ({ node }) => {
          const { src, alt, title, width, height } = node.attrs;
          if (!isSafeImageSrc(src)) return null;
          return (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element -- 업로드 시 이미 WebP로 최적화한다 */}
              <img
                src={src}
                alt={alt ?? ""}
                width={width ?? undefined}
                height={height ?? undefined}
                loading="lazy"
                decoding="async"
              />
              {title ? <figcaption>{title}</figcaption> : null}
            </figure>
          );
        },
      },
      markMapping: {
        link: ({ mark, children }) => {
          const href = mark.attrs.href as string;
          if (!isSafeHref(href)) return <>{children}</>;
          const external = classifyHref(href, SITE.url) === "external";
          return (
            <a
              href={href}
              rel={external ? "noopener noreferrer" : undefined}
              target={external ? "_blank" : undefined}
            >
              {children}
            </a>
          );
        },
      },
    },
  });
}

const cache = new Map<string, ReactNode>();
const CACHE_LIMIT = 400;

/** 미리보기에서 글자를 칠 때마다 모든 섹션을 다시 만들지 않도록 JSON 단위로 기억한다. */
function renderCached(doc: RichText): ReactNode {
  const key = JSON.stringify(doc);
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  let result: ReactNode;
  try {
    result = render(doc);
  } catch (error) {
    // 저장 시 검증하므로 운영에서는 일어나지 않는다. 미리보기에서만 원인을 보여 준다.
    if (process.env.NODE_ENV === "production") throw error;
    result = (
      <p role="alert">
        본문을 표시할 수 없습니다: {error instanceof Error ? error.message : String(error)}
      </p>
    );
  }
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(key, result);
  return result;
}

export function RichTextView({ doc }: { doc: RichText | null | undefined }) {
  if (!doc) return null;
  return <>{renderCached(doc)}</>;
}
