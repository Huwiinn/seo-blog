"use client";

import { useEffect, useState, type ReactNode } from "react";

interface MenuToggleProps {
  /** 상태를 표시할 요소의 id. 켜지면 그 요소에 attribute가 붙는다. */
  target: string;
  /** 붙일 속성 이름. 기본은 data-open. */
  attribute?: string;
  /** 메뉴처럼 쓰는 경우: Esc나 안쪽 링크를 누르면 닫는다. 접기 버튼처럼 계속 유지할 상태면 false. */
  dismissible?: boolean;
  className?: string;
  label: string;
  children?: ReactNode;
}

/**
 * 여닫기 버튼. 시안 컴포넌트는 순수해야 하므로 상태가 필요한 부분만 여기에 둔다.
 * 버튼에는 aria-expanded가 붙으므로 CSS에서 아이콘 모양(햄버거 → X 등)을 바꿀 수 있다.
 */
export function MenuToggle({
  target,
  attribute = "data-open",
  dismissible = true,
  className,
  label,
  children,
}: MenuToggleProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = document.getElementById(target);
    if (!element) return;
    element.toggleAttribute(attribute, open);
  }, [open, target, attribute]);

  useEffect(() => {
    if (!open || !dismissible) return;
    const element = document.getElementById(target);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("a")) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    element?.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      element?.removeEventListener("click", onClick);
    };
  }, [open, target, dismissible]);

  return (
    <button
      type="button"
      className={className}
      aria-expanded={open}
      aria-controls={target}
      aria-label={children ? label : undefined}
      onClick={() => setOpen((value) => !value)}
    >
      {children ?? label}
    </button>
  );
}
