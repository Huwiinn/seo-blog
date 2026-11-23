"use server";

import { eq } from "drizzle-orm";
import { formatIssues, postInputSchema } from "@/lib/content/validate";
import type { PostStatus } from "@/lib/content/types";
import { getDb, posts } from "@/lib/db";
import { assertEditorAction } from "@/lib/env";
import { getRowById, isSlugTaken } from "@/lib/posts/queries";
import { analyzePost } from "@/lib/seo/analyze";

/**
 * draft: 임시저장 / publish: 발행 / update: 발행한 글 업데이트 / unpublish: 초안으로 전환
 */
export type SaveIntent = "draft" | "publish" | "update" | "unpublish";

export type SaveResult =
  | {
      ok: true;
      status: PostStatus;
      slug: string;
      publishedAt: string | null;
      modifiedAt: string | null;
      updatedAt: string;
      /** 한 번이라도 발행한 글은 주소(슬러그)를 바꿀 수 없다 */
      slugLocked: boolean;
    }
  | { ok: false; errors: string[] };

/**
 * 글 저장. 모든 server action은 운영 환경에서도 직접 호출될 수 있으므로
 * 첫 줄에서 에디터 사용 가능 여부를 확인한다.
 */
export async function savePost(
  input: unknown,
  intent: SaveIntent,
  touchModified = true,
): Promise<SaveResult> {
  assertEditorAction();

  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const data = parsed.data;

  const existing = getRowById(data.id);
  const slug = data.slug || null;

  if (existing?.publishedAt && slug !== existing.slug) {
    return {
      ok: false,
      errors: ["이미 발행한 글의 슬러그(주소)는 바꿀 수 없습니다. 기존 링크가 끊어지기 때문입니다."],
    };
  }
  const slugTaken = slug ? isSlugTaken(slug, data.id) : false;
  if (slugTaken) {
    return { ok: false, errors: ["다른 글이 이미 쓰고 있는 슬러그입니다."] };
  }

  let status: PostStatus;
  if (intent === "publish") status = "published";
  else if (intent === "unpublish") status = "draft";
  else if (intent === "update") {
    if (existing?.status !== "published") {
      return { ok: false, errors: ["발행한 글만 업데이트할 수 있습니다."] };
    }
    status = "published";
  } else status = existing?.status ?? "draft";

  // 발행 상태가 되는 글은 서버에서 한 번 더 점검한다 (빈 제목, 슬러그 등).
  if (status === "published") {
    const report = analyzePost(data, { slugTaken });
    if (!report.canPublish) {
      return { ok: false, errors: report.errors.map((check) => check.message) };
    }
  }

  const now = new Date();
  const publishedAt = status === "published" ? (existing?.publishedAt ?? now) : (existing?.publishedAt ?? null);
  const modifiedAt =
    status === "published" && (intent === "publish" || touchModified || !existing?.modifiedAt)
      ? now
      : (existing?.modifiedAt ?? null);

  const values = {
    ...data,
    slug,
    status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt,
    modifiedAt,
  };

  try {
    getDb().insert(posts).values(values).onConflictDoUpdate({ target: posts.id, set: values }).run();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { ok: false, errors: [`저장하지 못했습니다: ${reason}`] };
  }

  return {
    ok: true,
    status,
    slug: slug ?? "",
    publishedAt: publishedAt ? publishedAt.toISOString() : null,
    modifiedAt: modifiedAt ? modifiedAt.toISOString() : null,
    updatedAt: now.toISOString(),
    slugLocked: Boolean(publishedAt),
  };
}

export async function deletePost(id: string): Promise<{ ok: true } | { ok: false; errors: string[] }> {
  assertEditorAction();
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{10,40}$/.test(id)) {
    return { ok: false, errors: ["잘못된 글 id입니다."] };
  }
  const result = getDb().delete(posts).where(eq(posts.id, id)).run();
  if (result.changes === 0) return { ok: false, errors: ["이미 삭제되었거나 없는 글입니다."] };
  return { ok: true };
}
