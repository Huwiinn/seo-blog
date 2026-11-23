import { getSchema } from "@tiptap/core";
import { Node as ProseMirrorNode, type Schema } from "@tiptap/pm/model";
import { z } from "zod";
import { CATEGORY_IDS } from "../../constant/categories";
import { isValidSlug, SLUG_MAX_LENGTH } from "../posts/slug";
import { bodyExtensions } from "./extensions";
import type { PostContent, RichText } from "./types";
import { isSafeHref, isSafeImageSrc } from "./url";

let cachedSchema: Schema | null = null;

/** 본문 확장 목록에서 만든 ProseMirror 스키마 (heading 노드가 없다) */
export function getBodySchema(): Schema {
  cachedSchema ??= getSchema(bodyExtensions);
  return cachedSchema;
}

function findUnsafe(node: RichText): string | null {
  if (node.type === "heading") {
    return "본문에는 제목(heading)을 넣을 수 없습니다. H2·H3는 섹션으로 추가하세요.";
  }
  if (node.type === "image" && !isSafeImageSrc(node.attrs?.src)) {
    return "허용되지 않는 이미지 주소입니다.";
  }
  for (const mark of node.marks ?? []) {
    if (mark.type === "link" && !isSafeHref(mark.attrs?.href)) {
      return "허용되지 않는 링크 주소입니다 (http·https·mailto·상대 경로만 가능).";
    }
  }
  for (const child of node.content ?? []) {
    const found = findUnsafe(child);
    if (found) return found;
  }
  return null;
}

/**
 * 본문 JSON을 검증한다. 문제가 없으면 null, 있으면 사람이 읽을 수 있는 메시지를 돌려준다.
 * 1) 위험한 URL·heading 노드 검사 → 2) 스키마로 실제 파싱(알 수 없는 노드·잘못된 구조 거부)
 */
export function validateRichText(value: unknown): string | null {
  if (!value || typeof value !== "object" || (value as RichText).type !== "doc") {
    return "본문 형식이 올바르지 않습니다.";
  }
  const doc = value as RichText;
  const unsafe = findUnsafe(doc);
  if (unsafe) return unsafe;
  try {
    ProseMirrorNode.fromJSON(getBodySchema(), doc).check();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return `본문 구조가 올바르지 않습니다: ${reason}`;
  }
  return null;
}

const richTextSchema = z.custom<RichText>().superRefine((value, ctx) => {
  const error = validateRichText(value);
  if (error) ctx.addIssue({ code: "custom", message: error });
});

const blockId = z.string().regex(/^[A-Za-z0-9_-]{4,40}$/, "잘못된 블록 id입니다.");

export const postContentSchema: z.ZodType<PostContent> = z.object({
  version: z.literal(1),
  intro: richTextSchema,
  sections: z
    .array(
      z.object({
        id: blockId,
        heading: z.string().max(200),
        kind: z.enum(["default", "faq"]),
        body: richTextSchema,
        subsections: z
          .array(
            z.object({
              id: blockId,
              heading: z.string().max(200),
              body: richTextSchema,
            }),
          )
          .max(40),
      }),
    )
    .max(80),
});

export const coverImageSchema = z.object({
  src: z.string().refine(isSafeImageSrc, "허용되지 않는 이미지 주소입니다."),
  alt: z.string().max(300),
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
});

/** 에디터가 저장할 때 보내는 값 */
export const postInputSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{10,40}$/, "잘못된 글 id입니다."),
  slug: z
    .string()
    .trim()
    .max(SLUG_MAX_LENGTH, `슬러그는 ${SLUG_MAX_LENGTH}자 이하여야 합니다.`)
    .refine(
      (value) => value === "" || isValidSlug(value),
      "슬러그는 영문 소문자·숫자·하이픈만 쓸 수 있습니다.",
    ),
  category: z.enum(CATEGORY_IDS),
  title: z.string().trim().max(200),
  summary: z.string().trim().max(1000),
  content: postContentSchema,
  metaTitle: z.string().trim().max(200),
  metaDescription: z.string().trim().max(500),
  focusKeyword: z.string().trim().max(100),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  coverImage: coverImageSchema.nullable(),
  featured: z.boolean(),
});

export type PostInput = z.infer<typeof postInputSchema>;

/** zod 오류를 한 줄 메시지 목록으로 바꾼다. */
export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const where = issue.path.length ? `${issue.path.join(".")}: ` : "";
    return `${where}${issue.message}`;
  });
}
