import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { CategoryId } from "../../constant/categories";
import type { CoverImage, PostContent, PostStatus } from "../content/types";

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    /** 초안은 비어 있을 수 있다(null). 발행 글은 반드시 고유한 영문 슬러그를 가진다. */
    slug: text("slug").unique(),
    status: text("status").$type<PostStatus>().notNull().default("draft"),
    category: text("category").$type<CategoryId>().notNull(),
    /** H1 */
    title: text("title").notNull().default(""),
    /** 핵심 요약(TL;DR). 메타 설명이 비어 있으면 대신 쓰인다. */
    summary: text("summary").notNull().default(""),
    content: text("content", { mode: "json" }).$type<PostContent>().notNull(),
    metaTitle: text("meta_title").notNull().default(""),
    metaDescription: text("meta_description").notNull().default(""),
    focusKeyword: text("focus_keyword").notNull().default(""),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    coverImage: text("cover_image", { mode: "json" }).$type<CoverImage | null>(),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    /** 저장할 때마다 갱신 */
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    /** 첫 발행 시각 → datePublished */
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    /** 발행·업데이트 시각 → dateModified */
    modifiedAt: integer("modified_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("posts_status_published_idx").on(table.status, table.publishedAt),
  ],
);

export type PostRow = typeof posts.$inferSelect;
export type NewPostRow = typeof posts.$inferInsert;
