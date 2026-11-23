"use client";

import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";

interface GlowLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/**
 * 커서 위치를 --glow-x / --glow-y로 넘겨 주는 링크 버튼.
 * Shiny Button(커서를 따라다니는 은은한 빛)과 Spotlight Button(밝은 원과 겹친 글자색 반전)을
 * CSS로 구현할 때 쓴다. 포인터가 없는 기기에서는 일반 버튼으로 보인다.
 */
export function GlowLink({ href, className, children }: GlowLinkProps) {
  const track = (event: PointerEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
  };

  return (
    <Link href={href} className={className} onPointerMove={track} onPointerEnter={track}>
      {children}
    </Link>
  );
}
