/**
 * 빌드 전에 DB 상태를 확인한다 (npm run build 전에 자동 실행).
 *  - 단일 파일 유지: journal_mode가 delete인지 (WAL이면 -wal/-shm 파일이 생겨 git 커밋이 깨진다)
 *  - 파일 손상 여부: integrity_check
 *  - 모든 글의 본문이 스키마에 맞는지, 발행 글이 발행 조건을 갖췄는지
 */
import { isCategoryId } from "../constant/categories";
import { openDatabase } from "../lib/db/client";
import { posts } from "../lib/db/schema";
import { formatIssues, postContentSchema } from "../lib/content/validate";
import { isValidSlug } from "../lib/posts/slug";

const problems: string[] = [];
const { db, sqlite } = openDatabase();

const journal = String(sqlite.pragma("journal_mode", { simple: true }));
if (journal !== "delete") {
  problems.push(`journal_mode가 ${journal}입니다. delete여야 합니다 (sqlite3 data/blog.db "pragma journal_mode=delete").`);
}

const integrity = String(sqlite.pragma("integrity_check", { simple: true }));
if (integrity !== "ok") problems.push(`integrity_check 실패: ${integrity}`);

const rows = db.select().from(posts).all();
const slugs = new Map<string, string>();
let published = 0;

for (const row of rows) {
  const label = `[${row.status}] ${row.slug ?? row.id}`;

  const content = postContentSchema.safeParse(row.content);
  if (!content.success) {
    problems.push(`${label}: 본문 형식 오류 — ${formatIssues(content.error).join("; ")}`);
  }
  if (!isCategoryId(row.category)) problems.push(`${label}: 알 수 없는 카테고리 "${row.category}"`);

  if (row.status !== "published") continue;
  published += 1;

  if (!row.slug || !isValidSlug(row.slug)) problems.push(`${label}: 발행 글의 슬러그가 올바르지 않습니다.`);
  if (!row.title.trim()) problems.push(`${label}: 발행 글에 H1 제목이 없습니다.`);
  if (!row.publishedAt) problems.push(`${label}: 발행 시각이 없습니다.`);
  if (content.success) {
    for (const section of content.data.sections) {
      if (!section.heading.trim()) problems.push(`${label}: 제목이 비어 있는 H2가 있습니다.`);
      for (const sub of section.subsections) {
        if (!sub.heading.trim()) problems.push(`${label}: 제목이 비어 있는 H3가 있습니다.`);
      }
    }
  }
  if (row.slug) {
    const other = slugs.get(row.slug);
    if (other) problems.push(`${label}: 슬러그가 ${other}와 겹칩니다.`);
    slugs.set(row.slug, row.id);
  }
}

sqlite.close();

if (problems.length > 0) {
  console.error(`DB 점검 실패 (${problems.length}건):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

console.log(`DB 점검 통과: 글 ${rows.length}개 (발행 ${published}개), journal_mode=${journal}`);
