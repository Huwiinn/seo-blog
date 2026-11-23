import Link from "next/link";
import { PostList, type PostListItem } from "@/components/editor/PostList";
import { assertEditorPage } from "@/lib/admin-guard";
import { getAllRows } from "@/lib/posts/queries";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  assertEditorPage();

  const items: PostListItem[] = getAllRows().map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    category: row.category,
    updatedAt: row.updatedAt.toISOString(),
    sample: row.id.startsWith("seed-"),
  }));
  const published = items.filter((item) => item.status === "published").length;

  return (
    <main className="ed-home">
      <header className="ed-home__head">
        <div>
          <h1>글 관리</h1>
          <p>
            전체 {items.length}개 · 발행 {published}개 · 초안 {items.length - published}개
          </p>
        </div>
        <div className="ed-home__actions">
          <Link href="/" className="ed-btn" target="_blank">
            사이트 보기
          </Link>
          <Link href="/designs" className="ed-btn" target="_blank">
            디자인 시안
          </Link>
          <Link href="/admin/write" className="ed-btn ed-btn--primary">
            새 글 쓰기
          </Link>
        </div>
      </header>

      <PostList items={items} />

      <p className="ed-home__note">
        글은 이 컴퓨터의 <code>data/blog.db</code>에 저장됩니다. 발행한 글을 사이트에 반영하려면{" "}
        <code>data/blog.db</code>와 <code>public/uploads</code>를 커밋하고 push하세요.
      </p>
    </main>
  );
}
