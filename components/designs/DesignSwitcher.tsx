"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DesignOption {
  id: string;
  name: string;
}

/**
 * 시안 갤러리 전용 전환 버튼. 지금 보고 있는 화면(홈·목록·글)을 유지한 채 다른 시안으로 바꾼다.
 * 갤러리의 축소 미리보기(iframe) 안에서는 보이지 않는다.
 */
export function DesignSwitcher({ designs }: { designs: DesignOption[] }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- iframe 여부는 브라우저에서만 알 수 있다
    setVisible(window.self === window.top);
  }, []);

  const match = /^\/designs\/([^/]+)(\/.*)?$/.exec(pathname ?? "");
  if (!match || !visible) return null;
  const [, current, rest = ""] = match;

  return (
    <nav className="design-switcher" aria-label="시안 전환">
      <Link href="/designs" className="design-switcher__home">
        시안 목록
      </Link>
      <ul>
        {designs.map((design) => (
          <li key={design.id}>
            <Link
              href={`/designs/${design.id}${rest}`}
              aria-current={design.id === current ? "true" : undefined}
              title={design.name}
              scroll={false}
            >
              {design.name.slice(0, 1)}
              <span className="visually-hidden">{design.name.slice(1)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
