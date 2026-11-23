import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { isEditorEnabled } from "../env";
import * as schema from "./schema";

/**
 * 순수 DB 모듈. 앱 코드는 `@/lib/db`(server-only)를 쓰고,
 * 스크립트·테스트는 이 파일을 직접 쓴다.
 */
export type BlogDb = BetterSQLite3Database<typeof schema>;

// turbopackIgnore: DB는 빌드할 때 읽어 정적 페이지로 굽는다. 서버 함수 묶음에 프로젝트 파일을
// 통째로 끌어들이지 않도록 이 경로는 파일 추적에서 뺀다.
export const DB_PATH = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.BLOG_DB_PATH ?? "data/blog.db",
);

export interface OpenOptions {
  /** 쓰기 가능으로 연다. 기본은 읽기 전용. */
  writable?: boolean;
  /** 파일이 없으면 만든다(마이그레이션 스크립트 전용). */
  create?: boolean;
  /** 기본 경로 대신 쓸 파일(테스트용). */
  file?: string;
}

export function openDatabase(options: OpenOptions = {}) {
  const file = options.file ?? DB_PATH;
  const writable = options.writable ?? false;

  if (options.create && file !== ":memory:") {
    fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(file), { recursive: true });
  } else if (file !== ":memory:" && !fs.existsSync(/* turbopackIgnore: true */ file)) {
    throw new Error(
      `DB 파일이 없습니다: ${file}\n` +
        "`npm run db:migrate` 후 `npm run db:seed`를 실행해 주세요.",
    );
  }

  const sqlite = new Database(file, {
    readonly: !writable,
    fileMustExist: !options.create,
  });

  if (writable) {
    // WAL은 -wal/-shm 파일을 따로 만들기 때문에 쓰지 않는다.
    // DB는 git에 커밋하는 단일 파일이어야 한다.
    sqlite.pragma("journal_mode = DELETE");
    sqlite.pragma("foreign_keys = ON");
  }

  return { sqlite, db: drizzle(sqlite, { schema }) as BlogDb };
}

const store = globalThis as typeof globalThis & {
  __seoBlogDb?: ReturnType<typeof openDatabase>;
};

/**
 * 프로세스당 하나의 연결을 지연 생성한다.
 * 에디터가 켜진 로컬 개발 서버에서만 쓰기 가능하고, 그 외에는 읽기 전용이다.
 */
export function getDb(): BlogDb {
  if (!store.__seoBlogDb) {
    store.__seoBlogDb = openDatabase({ writable: isEditorEnabled() });
  }
  return store.__seoBlogDb.db;
}
