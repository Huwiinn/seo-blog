/** 글자 폭 측정 함수. 브라우저에서는 canvas, 서버·테스트에서는 추정치를 쓴다. */
export type MeasureFn = (text: string, fontPx: number) => number;

const NARROW = new Set("iljtfrI.,:;|!'`()[]{} ".split(""));
const WIDE = new Set("mwMW@%".split(""));

function charEm(char: string): number {
  const code = char.codePointAt(0) ?? 0;
  // 한글·한자·가나·전각 문자
  if (
    (code >= 0x1100 && code <= 0x11ff) ||
    (code >= 0x2e80 && code <= 0x9fff) ||
    (code >= 0xac00 && code <= 0xd7af) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xff00 && code <= 0xffef)
  ) {
    return 0.9;
  }
  if (code > 0x2000) return 0.75;
  if (NARROW.has(char)) return 0.28;
  if (WIDE.has(char)) return 0.85;
  if (char >= "A" && char <= "Z") return 0.67;
  if (char >= "0" && char <= "9") return 0.556;
  return 0.52;
}

/** canvas 없이 쓰는 폭 추정 (Arial + 한글 폴백 글꼴 기준 근사값) */
export const estimateTextWidth: MeasureFn = (text, fontPx) => {
  let em = 0;
  for (const char of text) em += charEm(char);
  return Math.round(em * fontPx);
};

export interface Truncated {
  text: string;
  truncated: boolean;
  width: number;
}

/** 폭 제한을 넘으면 검색 결과처럼 말줄임표로 자른다. */
export function truncateToWidth(
  text: string,
  maxPx: number,
  fontPx: number,
  measure: MeasureFn = estimateTextWidth,
): Truncated {
  const full = measure(text, fontPx);
  if (full <= maxPx) return { text, truncated: false, width: full };

  const chars = Array.from(text);
  const ellipsis = " ...";
  let low = 0;
  let high = chars.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const candidate = chars.slice(0, mid).join("").trimEnd() + ellipsis;
    if (measure(candidate, fontPx) <= maxPx) low = mid;
    else high = mid - 1;
  }
  return {
    text: chars.slice(0, low).join("").trimEnd() + ellipsis,
    truncated: true,
    width: full,
  };
}
