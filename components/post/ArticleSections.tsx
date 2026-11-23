import { anchorIndex } from "@/lib/content/anchors";
import { isRichTextEmpty } from "@/lib/content/text";
import type { PostArticle } from "@/lib/posts/types";
import { RichTextView } from "./RichTextView";

/**
 * 글 본문. 제목 계층은 데이터 구조에서 나온다:
 *   <section><h2 id>…<section><h3 id>…
 * 모든 시안이 이 컴포넌트를 쓰고, 모양은 CSS(.post-*)로만 바꾼다.
 */
export function ArticleSections({ post }: { post: Pick<PostArticle, "content" | "outline"> }) {
  const anchors = anchorIndex(post.outline);
  const { intro, sections } = post.content;

  return (
    <div className="post-body">
      {!isRichTextEmpty(intro) && (
        <div className="post-intro">
          <RichTextView doc={intro} />
        </div>
      )}

      {sections.map((section) => {
        const anchor = anchors.get(section.id) ?? section.id;
        return (
          <section
            key={section.id}
            className="post-section"
            aria-labelledby={anchor}
            data-section-id={section.id}
            data-kind={section.kind}
          >
            <h2
              id={anchor}
              className="post-h2"
              data-empty={section.heading.trim() ? undefined : ""}
              data-placeholder="H2 제목"
            >
              <a className="post-anchor" href={`#${anchor}`} aria-hidden="true" tabIndex={-1} />
              {section.heading}
            </h2>
            <RichTextView doc={section.body} />

            {section.subsections.map((sub) => {
              const subAnchor = anchors.get(sub.id) ?? sub.id;
              return (
                <section
                  key={sub.id}
                  className="post-subsection"
                  aria-labelledby={subAnchor}
                  data-section-id={sub.id}
                >
                  <h3
                    id={subAnchor}
                    className="post-h3"
                    data-empty={sub.heading.trim() ? undefined : ""}
                    data-placeholder="H3 소제목"
                  >
                    <a className="post-anchor" href={`#${subAnchor}`} aria-hidden="true" tabIndex={-1} />
                    {sub.heading}
                  </h3>
                  <RichTextView doc={sub.body} />
                </section>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
