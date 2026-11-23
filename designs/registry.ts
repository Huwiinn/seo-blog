import bento from "./bento";
import docs from "./docs";
import glass from "./glass";
import newsroom from "./newsroom";
import pro from "./pro";
import type { DesignId, DesignTheme } from "./types";

/**
 * 시안 전체 목록. /designs 갤러리와 에디터 미리보기에서만 불러온다.
 * 운영 페이지는 designs/active.ts로 고른 시안 하나만 불러온다.
 */
export const DESIGNS: DesignTheme[] = [newsroom, pro, docs, bento, glass];

export const DESIGN_IDS = DESIGNS.map((design) => design.id);

export function getDesign(id: string): DesignTheme | undefined {
  return DESIGNS.find((design) => design.id === id);
}

export function isDesignId(id: string): id is DesignId {
  return DESIGNS.some((design) => design.id === id);
}
