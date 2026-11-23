import type { CSSProperties } from "react";

/** 줄바꿈 없는 공백 (글자를 하나씩 감쌀 때 공백이 사라지지 않게 한다) */
const NBSP = String.fromCharCode(160);

interface Word {
  id: string;
  label: string;
}

/**
 * 번갈아 나타나는 단어. CSS만으로 동작한다 (자바스크립트·하이드레이션 없음).
 *  - vanish: 단어가 작아지며 사라지고 다음 단어가 통 튀며 나타난다 (Vanish Text)
 *  - spin:   단어가 상자 면처럼 굴러서 다음 단어로 바뀐다 (Spinning Box Text)
 * 화면 낭독기에는 모든 단어를 한 번에 읽어 주고, 동작 줄이기 설정에서는 첫 단어만 보인다.
 * 키프레임이 네 단어 기준이므로 words는 네 개를 넘긴다.
 */
export function RotatingWords({
  words,
  variant = "vanish",
  className,
}: {
  words: readonly Word[];
  variant?: "vanish" | "spin";
  className?: string;
}) {
  return (
    <span className={className ? `rotating ${className}` : "rotating"} data-variant={variant}>
      <span className="visually-hidden">{words.map((word) => word.label).join(", ")}</span>
      {words.map((word, index) => (
        <span
          key={word.id}
          className="rotating__word"
          data-cat={word.id}
          style={{ "--i": index } as CSSProperties}
          aria-hidden="true"
        >
          {word.label}
        </span>
      ))}
    </span>
  );
}

/** Draw Circle Text: 강조할 단어 둘레에 손으로 그린 듯한 동그라미가 그려진다. */
export function DrawCircle({ children }: { children: string }) {
  return (
    <span className="draw-circle">
      {children}
      <svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path
          d="M14 44C10 20 58 6 106 7c46 1 84 12 82 36-2 22-46 31-92 30-44-1-82-10-78-34 3-17 38-27 84-27"
          pathLength={1}
        />
      </svg>
    </span>
  );
}

/**
 * Bubble Text: 마우스를 올린 글자가 굵어지고 양옆 글자도 조금씩 굵어진다.
 * 가변 글꼴(Pretendard)의 굵기 축을 쓰므로 영문·숫자 제목에 쓴다.
 * 글자를 하나씩 감싸므로, 감싸는 요소(제목 등)에 aria-label로 전체 문구를 함께 넣는다.
 */
export function BubbleText({ children }: { children: string }) {
  return (
    <span className="bubble-text">
      {Array.from(children).map((char, index) => (
        <span key={index} aria-hidden="true">
          {char === " " ? NBSP : char}
        </span>
      ))}
    </span>
  );
}
