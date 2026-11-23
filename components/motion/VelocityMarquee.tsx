"use client";

import { useEffect, useRef } from "react";

/**
 * Velocity Text: 가로로 흐르는 글자 띠. 빨리 스크롤할수록 더 빨리 흐르고 더 기울어진다.
 * 장식이므로 보조 기술에서는 숨기고, 동작 줄이기 설정에서는 멈춘 띠로 보인다.
 */
export function VelocityMarquee({ items, className }: { items: string[]; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastY = window.scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.max(now - lastTime, 1);
      const raw = Math.abs(window.scrollY - lastY) / dt; // px/ms
      lastY = window.scrollY;
      lastTime = now;
      velocity += (Math.min(raw, 4) - velocity) * 0.12;

      const animation = track.getAnimations()[0];
      if (animation) animation.playbackRate = 1 + velocity * 3.5;
      track.style.setProperty("--skew", `${(-velocity * 5).toFixed(2)}deg`);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const line = (
    <span className="velocity__line">
      {items.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </span>
  );

  return (
    <div className={className ? `velocity ${className}` : "velocity"} aria-hidden="true">
      <div ref={trackRef} className="velocity__track">
        {line}
        {line}
      </div>
    </div>
  );
}
