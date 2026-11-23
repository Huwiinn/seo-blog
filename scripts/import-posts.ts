/**
 * 마크다운 초안을 글로 가져온다.
 *
 *   npm run posts:import -- <파일|폴더>... [--check] [--publish] [--force]
 *
 *   --check    검사만 하고 DB에 쓰지 않는다 (형식 · SEO 점검 · 문체 점검 · 내부 링크)
 *   --publish  발행 상태로 가져온다 (기본은 초안)
 *   --force    이미 가져온 글도 덮어쓴다. 에디터에서 고친 내용이 사라지므로 주의.
 *
 * 초안 형식은 lib/content/markdown.ts 참고. 글 id는 머리말의 source(없으면 slug)로 정해지므로
 * 같은 초안을 다시 가져와도 글이 늘어나지 않는다. 앞에 적은 파일일수록 최신 글로 놓인다.
 */
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isCategoryId } from "../constant/categories";
import { parsePostMarkdown } from "../lib/content/markdown";
import { lintStyle } from "../lib/content/style-lint";
import { allBodies, collectLinks } from "../lib/content/text";
import { formatIssues, postInputSchema, type PostInput } from "../lib/content/validate";
import { openDatabase } from "../lib/db/client";
import { posts } from "../lib/db/schema";
import { analyzePost } from "../lib/seo/analyze";

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const targets = args.filter((arg) => !arg.startsWith("--"));
const checkOnly = flags.has("--check");
const publish = flags.has("--publish");
const force = flags.has("--force");

if (targets.length === 0) {
  console.error("사용: npm run posts:import -- <파일|폴더>... [--check] [--publish] [--force]");
  process.exit(1);
}

const files = targets.flatMap((target) => {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    console.error(`없는 경로입니다: ${target}`);
    process.exit(1);
  }
  if (!fs.statSync(resolved).isDirectory()) return [resolved];
  return fs
    .readdirSync(resolved)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_") && name.toLowerCase() !== "readme.md")
    .sort()
    .map((name) => path.join(resolved, name));
});

interface Item {
  file: string;
  input: PostInput;
  source: string;
  problems: string[];
  notes: string[];
  score: number;
  chars: number;
}

const items: Item[] = [];
let failed = false;

for (const file of files) {
  const name = path.basename(file);
  let parsed;
  try {
    parsed = parsePostMarkdown(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failed = true;
    console.error(`✕ ${name}\n  ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

  const { meta, tags, content, warnings } = parsed;
  const problems: string[] = [];
  if (!meta.slug) problems.push("머리말에 slug가 없습니다.");
  if (!isCategoryId(meta.category)) problems.push(`알 수 없는 category: ${meta.category ?? "(없음)"}`);
  if (!meta.title) problems.push("머리말에 title이 없습니다.");

  const source = meta.source ?? meta.slug ?? name;
  const id = `wiki-${createHash("sha1").update(source).digest("hex").slice(0, 14)}`;
  const result = postInputSchema.safeParse({
    id,
    slug: meta.slug ?? "",
    category: meta.category,
    title: meta.title ?? "",
    summary: meta.summary ?? "",
    content,
    metaTitle: meta.metaTitle ?? "",
    metaDescription: meta.metaDescription ?? "",
    focusKeyword: meta.focusKeyword ?? "",
    tags,
    coverImage: null,
    featured: meta.featured === "true",
  });

  if (!result.success) {
    failed = true;
    console.error(`✕ ${name}\n  ${[...problems, ...formatIssues(result.error)].join("\n  ")}`);
    continue;
  }

  const report = analyzePost(result.data);
  problems.push(...report.errors.map((check) => check.message));
  const notes = [
    ...warnings.map((warning) => `변환: ${warning}`),
    ...lintStyle(result.data).map((issue) => `문체(${issue.rule}): ${issue.message}${issue.sample ? ` → ${issue.sample}` : ""}`),
    ...report.warnings.map((check) => `SEO: ${check.message}`),
  ];
  items.push({ file: name, input: result.data, source, problems, notes, score: report.score, chars: report.stats.chars });
}

/* 내부 링크(/posts/슬러그)가 실제 글을 가리키는지 확인한다 */
const { db, sqlite } = openDatabase({ writable: !checkOnly });
const known = new Set([
  ...items.map((item) => item.input.slug),
  ...db
    .select({ slug: posts.slug })
    .from(posts)
    .all()
    .map((row) => row.slug)
    .filter((slug): slug is string => Boolean(slug)),
]);
const seenSlugs = new Map<string, string>();

for (const item of items) {
  const duplicate = seenSlugs.get(item.input.slug);
  if (duplicate) item.problems.push(`slug가 ${duplicate}와 겹칩니다.`);
  seenSlugs.set(item.input.slug, item.file);

  const links = allBodies(item.input.content).flatMap((body) => collectLinks(body));
  let internal = 0;
  let external = 0;
  for (const link of links) {
    const match = /^\/posts\/([^/#?]+)/.exec(link.href);
    if (match) {
      internal += 1;
      if (!known.has(match[1])) item.problems.push(`없는 글로 가는 내부 링크: ${link.href}`);
      if (match[1] === item.input.slug) item.notes.push(`자기 자신으로 가는 링크: ${link.href}`);
    } else if (/^https?:\/\//.test(link.href)) {
      external += 1;
    } else if (link.href.startsWith("/")) {
      item.notes.push(`글이 아닌 내부 주소: ${link.href}`);
    }
  }
  if (external === 0) item.notes.push("출처(외부) 링크가 없습니다.");
  if (internal === 0) item.notes.push("내부 링크가 없습니다.");
}

for (const item of items) {
  const mark = item.problems.length > 0 ? "✕" : item.notes.length > 0 ? "!" : "✓";
  console.log(
    `${mark} ${item.input.slug.padEnd(38)} ${String(item.chars).padStart(5)}자  SEO ${String(item.score).padStart(3)}  ` +
      `H2 ${item.input.content.sections.length}  ${item.input.title}`,
  );
  for (const problem of item.problems) console.log(`    ✕ ${problem}`);
  for (const note of item.notes) console.log(`    · ${note}`);
  if (item.problems.length > 0) failed = true;
}

if (failed) {
  sqlite.close();
  console.error("\n오류(✕)가 있어 가져오지 않았습니다.");
  process.exit(1);
}

if (checkOnly) {
  sqlite.close();
  const noted = items.filter((item) => item.notes.length > 0).length;
  console.log(`\n검사 통과: ${items.length}개 (참고 사항이 있는 글 ${noted}개). DB에는 쓰지 않았습니다.`);
  process.exit(0);
}

const base = Date.now();
let created = 0;
let updated = 0;
let skipped = 0;

db.transaction((tx) => {
  items.forEach((item, index) => {
    const existing = tx.select().from(posts).where(eq(posts.id, item.input.id)).get();
    if (existing && !force) {
      skipped += 1;
      return;
    }
    const clash = tx.select({ id: posts.id }).from(posts).where(eq(posts.slug, item.input.slug)).get();
    if (clash && clash.id !== item.input.id) {
      throw new Error(`slug "${item.input.slug}"를 다른 글이 이미 쓰고 있습니다.`);
    }

    // 앞에 적은 파일일수록 최신 글이 되도록 1분씩 간격을 둔다.
    const stamp = new Date(base - index * 60_000);
    const status = publish ? ("published" as const) : (existing?.status ?? ("draft" as const));
    const publishedAt = status === "published" ? (existing?.publishedAt ?? stamp) : (existing?.publishedAt ?? null);
    const values = {
      ...item.input,
      status,
      createdAt: existing?.createdAt ?? stamp,
      updatedAt: new Date(base),
      publishedAt,
      modifiedAt: status === "published" ? (existing ? new Date(base) : publishedAt) : (existing?.modifiedAt ?? null),
    };
    tx.insert(posts).values(values).onConflictDoUpdate({ target: posts.id, set: values }).run();
    if (existing) updated += 1;
    else created += 1;
  });
});

sqlite.close();
console.log(
  `\n가져오기 완료: 새 글 ${created}개, 덮어쓴 글 ${updated}개, 건너뛴 글 ${skipped}개` +
    (skipped > 0 ? " (이미 있는 글은 --force를 붙여야 덮어씁니다)" : "") +
    ` · 상태: ${publish ? "발행" : "초안"}`,
);
