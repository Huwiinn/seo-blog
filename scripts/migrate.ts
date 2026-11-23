/**
 * drizzle/ 폴더의 SQL 마이그레이션을 data/blog.db에 적용한다.
 * 사용: npm run db:migrate
 */
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { DB_PATH, openDatabase } from "../lib/db/client";

const { db, sqlite } = openDatabase({ writable: true, create: true });

migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

const mode = sqlite.pragma("journal_mode", { simple: true });
sqlite.close();

console.log(`마이그레이션 완료: ${path.relative(process.cwd(), DB_PATH)} (journal_mode=${mode})`);
