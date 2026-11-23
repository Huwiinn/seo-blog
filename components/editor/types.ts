import type { PostStatus } from "@/lib/content/types";

/** 저장 상태처럼 글 내용이 아닌 부가 정보 */
export interface EditorMeta {
  status: PostStatus;
  /** 아직 한 번도 저장하지 않은 새 글 */
  isNew: boolean;
  /** 한 번이라도 발행했으면 슬러그를 바꿀 수 없다 */
  slugLocked: boolean;
  updatedAt: string | null;
  publishedAt: string | null;
  modifiedAt: string | null;
}

export interface DesignOption {
  id: string;
  name: string;
}

/** 에디터(부모)와 미리보기 iframe이 주고받는 메시지 */
export const PREVIEW_SOURCE = "seo-blog-preview";
export const EDITOR_SOURCE = "seo-blog-editor";
