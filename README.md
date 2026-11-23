# SEO Lab Notes

SEO · GEO · AEO · UX/UI, 그리고 개발·AI 엔지니어링을 실무 관점에서 정리하는 개인 블로그입니다.
글은 내 컴퓨터에서 쓰고, 사이트는 정적 페이지로 배포합니다.

URL: https://www.seo-blog.site

## 스택

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 (디자인 토큰) + 시안별 CSS
- SQLite 파일(`data/blog.db`) + Drizzle ORM + better-sqlite3
- Tiptap 3 (본문 에디터, 정적 렌더러)
- Vitest (단위 테스트)

## 시작하기

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run db:migrate   # data/blog.db가 없을 때만 (스키마 적용)
npm run db:seed      # 샘플 글 8편 넣기 (선택)
npm run dev          # http://localhost:3000
```

| 주소 | 내용 |
| --- | --- |
| `/` | 블로그 홈 (운영 디자인) |
| `/admin` | 글 관리 · 에디터 — **로컬 개발 서버에서만 열립니다** |
| `/designs` | 디자인 시안 5종 비교 (검색엔진에는 noindex) |

## 글 쓰고 배포하기

1. `npm run dev`를 켜고 `/admin`에서 **새 글 쓰기**.
2. 왼쪽에서 쓰면 오른쪽 미리보기가 바로 따라옵니다. **임시저장** 또는 **발행**을 누르면 `data/blog.db`에 저장됩니다.
3. 발행한 글을 사이트에 반영하려면 `data/blog.db`와 `public/uploads/`를 커밋하고 push합니다.
   배포 서버가 빌드하면서 DB를 읽어 정적 페이지를 만듭니다.

운영 사이트에는 에디터가 없습니다. `/admin`과 저장 기능은 `NODE_ENV=development`이고 Vercel이 아닐 때만 동작하고(`lib/env.ts`), 그 밖에서는 404를 돌려주며 DB도 읽기 전용으로 열립니다. 로그인 기능이 필요 없는 이유입니다.

### 마크다운 초안 가져오기

마크다운으로 쓴 초안(예: 위키 노트를 다시 쓴 글)을 한꺼번에 글로 가져올 수 있습니다. 초안 형식은 머리말(`slug`, `category`, `title`, `summary` 등) + `##`(H2) + `###`(H3)이고, 본문에는 문단·목록·인용·코드 블록·표를 쓸 수 있습니다.

```bash
npm run posts:import -- content/wiki-posts --check     # 검사만 (형식, SEO 점검, 문체 점검, 내부 링크)
npm run posts:import -- content/wiki-posts --publish   # 발행 상태로 가져오기
```

- 글 id는 머리말의 `source`로 정해지므로 같은 초안을 다시 가져와도 글이 늘어나지 않습니다.
- 이미 가져온 글은 건너뜁니다. 덮어쓰려면 `--force`를 붙이는데, 에디터에서 고친 내용이 사라지니 주의하세요.
- 가져온 뒤에는 에디터(DB)가 원본입니다. `content/wiki-posts/`의 마크다운은 가져오기 전 초안의 기록입니다.

### 샘플 글 지우기

`npm run db:seed`로 넣은 글은 시안 확인용입니다(id가 `seed-`로 시작). 실제 글로 운영하기 전에 지우세요.

```bash
npm run db:seed -- --clear   # 샘플 글만 삭제, 직접 쓴 글은 그대로
```

## 에디터

제목 계층을 **데이터 구조로** 강제합니다. 본문 에디터에서는 제목을 만들 수 없고, 제목은 아래 블록으로만 생깁니다.

```
글
├─ 제목 (H1) — 하나뿐
├─ 핵심 요약 · 도입부
└─ H2 섹션 카드 (추가 · 삭제 · 위아래 이동 · FAQ 표시)
   ├─ 본문
   └─ H3 소제목 카드 (그 H2 아래에서만 추가 · 삭제 · 이동)
      └─ 본문
```

- **실시간 미리보기**: 운영 페이지와 같은 컴포넌트로 그리므로 보이는 그대로 발행됩니다. 시안 5종과 모바일·데스크톱 폭을 바꿔 볼 수 있고, 편집 중인 섹션으로 미리보기가 따라 스크롤합니다.
- **검색 결과 미리보기**: 제목·설명을 글자 수가 아니라 픽셀 폭으로 잘라 보여 줍니다(한글·영문 혼용에도 정확).
- **SEO 점검**: 구조 · 검색 노출 · 포커스 키워드 · 콘텐츠 · AEO/GEO를 점수와 목록으로 보여 줍니다. 오류(✕)만 발행을 막고 나머지는 권고입니다. 기준 숫자는 `lib/seo/rules.ts`에 모여 있습니다.
- **슬러그**: 영문 소문자·숫자·하이픈만 씁니다. 한 번 발행한 글의 주소는 바꿀 수 없습니다.
- **표**: 툴바의 "표"로 3×3 표를 넣고, 표 안에서 행·열을 추가·삭제합니다. 발행 화면에서는 좁은 화면에서도 표만 가로로 스크롤됩니다.
- **이미지**: 올리면 폭 1600px 이하 WebP로 바꾸고 위치 정보(EXIF)를 지워 `public/uploads/연/월/`에 저장합니다.
- 저장하지 않고 닫은 내용은 브라우저에 백업해 두었다가 다시 열 때 복원을 제안합니다. `⌘S`로 저장합니다.

## 디자인 시안

Apple 웹 디자인을 참고한 시안 5종이 `designs/`에 있습니다. 모두 같은 글 데이터로 홈 · 목록 · 글 상세를 그립니다.

| 시안 | 레퍼런스 | 특징 |
| --- | --- | --- |
| A. Newsroom | Apple Newsroom | 흰 배경, 큰 대표 글 + 타일 그리드 |
| B. Pro | 제품 페이지(Pro 라인) | 검정 배경, 큰 그라데이션 헤드라인 |
| **C. Docs** | Developer 문서 · HIG | 왼쪽 탐색 + 오른쪽 목차 (현재 운영 적용) |
| D. Bento | 벤토 그리드 | 크기가 다른 둥근 카드 격자 |
| E. Liquid Glass | iOS 26 · visionOS | 반투명 유리 패널, 모바일 하단 메뉴바 |

운영 디자인은 `designs/active.ts`의 한 줄로 고릅니다.

```ts
export { default } from "./docs"; // newsroom | pro | docs | bento | glass
```

홈에 배치한 인터랙션(Slide Tabs, Hover lift, Accordion, Carousel 등)은 표준 명칭 그대로 `app/globals.css`의 "인터랙션 패턴" 구역과 `components/motion/`에 있습니다. 모두 `prefers-reduced-motion`을 따릅니다.

시안을 확정한 뒤 나머지 시안과 `/designs`가 필요 없으면 `designs/registry.ts`에서 빼고 폴더를 지우면 됩니다.

## 검색 노출 (SEO · GEO · AEO)

- 페이지마다 자신의 `canonical` · Open Graph · Twitter 카드를 가집니다 (`metadata/`).
- 글: `BlogPosting` + `BreadcrumbList` 구조화 데이터, FAQ로 표시한 섹션이 있으면 `FAQPage` (`lib/seo/jsonld.ts`).
- 시맨틱 마크업: `<article>` › `<section aria-labelledby>` › `<h2 id>` › `<h3 id>`, `<time datetime>`, 목차 `<nav>`.
- `/sitemap.xml`, `/robots.txt` 자동 생성 (`app/sitemap.ts`, `app/robots.ts`).
- 공개 페이지는 전부 정적 생성입니다. 예전 카테고리 주소는 301로 새 주소에 연결됩니다 (`next.config.ts`).

## 폴더 구조

```text
app/
  (site)/            공개 페이지: 홈, /posts, /posts/[slug], /[category]
  admin/             에디터 (개발 서버 전용): 글 목록, 새 글, 편집, 미리보기, 업로드
  designs/           시안 갤러리
  globals.css        디자인 토큰 · 본문 스타일 · 인터랙션 패턴
components/
  editor/            에디터 화면과 상태(state.ts)
  motion/            탭, 아코디언, 텍스트 모션 등 공용 부품
  post/              본문 렌더러, 목차, 커버
constant/            사이트 정보, 카테고리, 홈 문구
designs/             시안 5종 + active.ts(운영 시안) + registry.ts
lib/
  content/           글 구조 타입, 본문 확장, 앵커, 검증, 마크다운 변환, 문체 점검
  db/                스키마, 연결
  posts/             조회, 슬러그 규칙
  seo/               점검 규칙, 메타 계산, 구조화 데이터
content/wiki-posts/  위키 노트를 다시 쓴 마크다운 초안 (가져오기 전 기록)
data/blog.db         글 데이터 (커밋 대상)
drizzle/             DB 마이그레이션 SQL
scripts/             migrate, seed, db-check, import-posts
tests/               단위 테스트
```

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 빌드. 먼저 `db:check`가 자동 실행됩니다 |
| `npm test` | 단위 테스트 |
| `npm run lint` · `npm run typecheck` | 린트 · 타입 검사 |
| `npm run db:generate` | `lib/db/schema.ts`를 바꾼 뒤 마이그레이션 SQL 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |
| `npm run db:seed` | 샘플 글 추가 (`-- --clear`로 삭제) |
| `npm run db:check` | DB 파일 상태와 모든 글의 형식 점검 |
| `npm run posts:import` | 마크다운 초안을 글로 가져오기 (`--check`, `--publish`, `--force`) |

## 설정을 바꾸는 곳

- 사이트 이름 · 도메인 · 작성자: `constant/site.ts`
- 카테고리: `constant/categories.ts`
- 홈 FAQ 문구: `constant/home.ts`
- 방문 분석(GTM): 환경 변수 `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` (공개 페이지에만 적용)
