import type { CategoryId } from "../../constant/categories";
import { emptyContent } from "../content/types";
import type { EditorDraft } from "../../components/editor/state";
import type { PostRow } from "../db/schema";

/** 새 글의 빈 초안 */
export function emptyDraft(id: string, category: CategoryId = "seo"): EditorDraft {
  return {
    id,
    slug: "",
    category,
    title: "",
    summary: "",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    tags: [],
    coverImage: null,
    featured: false,
    content: emptyContent(),
  };
}

/** DB 행 → 에디터 초안 */
export function rowToDraft(row: PostRow): EditorDraft {
  return {
    id: row.id,
    slug: row.slug ?? "",
    category: row.category,
    title: row.title,
    summary: row.summary,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    focusKeyword: row.focusKeyword,
    tags: row.tags,
    coverImage: row.coverImage ?? null,
    featured: row.featured,
    content: row.content,
  };
}
