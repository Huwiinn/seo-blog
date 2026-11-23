import type { OutlineItem } from "@/lib/content/anchors";

/** 목차 목록. 링크의 data-toc-link는 TocSpy가 현재 위치를 표시할 때 쓴다. */
export function TocList({ items, className }: { items: OutlineItem[]; className?: string }) {
  return (
    <ol className={className ? `toc ${className}` : "toc"}>
      {items.map((item) => (
        <li key={item.id} data-level={item.level}>
          <a href={`#${item.anchor}`} data-toc-link={item.anchor}>
            {item.heading}
          </a>
          {item.children.length > 0 && (
            <ol>
              {item.children.map((child) => (
                <li key={child.id} data-level={child.level}>
                  <a href={`#${child.anchor}`} data-toc-link={child.anchor}>
                    {child.heading}
                  </a>
                </li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );
}
