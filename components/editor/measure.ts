import { estimateTextWidth, type MeasureFn } from "@/lib/seo/measure";

let context: CanvasRenderingContext2D | null = null;

/**
 * 브라우저의 canvas로 글자 폭을 잰다. 검색 결과와 비슷한 글꼴(Arial + 한글 폴백)을 쓴다.
 * 한글·영문이 섞여도 실제 그려지는 폭 그대로 나오므로 글자 수 기준보다 정확하다.
 */
export const canvasMeasure: MeasureFn = (text, fontPx) => {
  if (typeof document === "undefined") return estimateTextWidth(text, fontPx);
  context ??= document.createElement("canvas").getContext("2d");
  if (!context) return estimateTextWidth(text, fontPx);
  context.font = `${fontPx}px Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
  return Math.round(context.measureText(text).width);
};
