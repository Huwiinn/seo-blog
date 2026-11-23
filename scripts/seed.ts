/**
 * 샘플 글을 data/blog.db에 넣는다.
 *
 *   npm run db:seed             샘플 글을 추가·갱신한다 (직접 쓴 글은 건드리지 않는다)
 *   npm run db:seed -- --clear  샘플 글(id가 seed-로 시작)만 지운다
 */
import { eq, like } from "drizzle-orm";
import { openDatabase } from "../lib/db/client";
import { posts } from "../lib/db/schema";
import { postInputSchema, formatIssues } from "../lib/content/validate";
import { analyzePost } from "../lib/seo/analyze";
import { doc, toSections } from "./seed/dsl";
import { seedPosts } from "./seed/posts";

const { db, sqlite } = openDatabase({ writable: true });

if (process.argv.includes("--clear")) {
  const result = db.delete(posts).where(like(posts.id, "seed-%")).run();
  console.log(`샘플 글 ${result.changes}개를 지웠습니다.`);
  sqlite.close();
  process.exit(0);
}

let failed = false;

for (const seed of seedPosts) {
  const input = postInputSchema.safeParse({
    id: seed.id,
    slug: seed.slug,
    category: seed.category,
    title: seed.title,
    summary: seed.summary,
    content: { version: 1, intro: doc(...seed.intro), sections: toSections(seed.sections) },
    metaTitle: "",
    metaDescription: "",
    focusKeyword: seed.focusKeyword,
    tags: seed.tags,
    coverImage: null,
    featured: seed.featured ?? false,
  });

  if (!input.success) {
    failed = true;
    console.error(`✕ ${seed.slug}\n  ${formatIssues(input.error).join("\n  ")}`);
    continue;
  }

  const clash = db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, seed.slug))
    .get();
  if (clash && clash.id !== seed.id) {
    console.warn(`- ${seed.slug}: 같은 슬러그의 글이 이미 있어 건너뜁니다.`);
    continue;
  }

  const publishedAt = new Date(seed.publishedAt);
  const modifiedAt = new Date(seed.modifiedAt ?? seed.publishedAt);
  const values = {
    ...input.data,
    status: "published" as const,
    createdAt: publishedAt,
    updatedAt: modifiedAt,
    publishedAt,
    modifiedAt,
  };

  db.insert(posts)
    .values(values)
    .onConflictDoUpdate({ target: posts.id, set: values })
    .run();

  const report = analyzePost({ ...input.data });
  const warnings = report.warnings.map((w) => w.id).join(", ") || "없음";
  console.log(
    `✓ ${seed.slug.padEnd(26)} ${String(report.stats.chars).padStart(5)}자  SEO ${String(report.score).padStart(3)}점  경고: ${warnings}`,
  );
  if (!report.canPublish) {
    failed = true;
    console.error(`  ✕ 발행 불가: ${report.errors.map((e) => e.message).join(" / ")}`);
  }
}

sqlite.close();
if (failed) process.exit(1);
console.log(`\n샘플 글 ${seedPosts.length}개를 넣었습니다. 지우려면: npm run db:seed -- --clear`);
