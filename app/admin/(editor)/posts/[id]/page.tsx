import { notFound } from "next/navigation";
import { PostEditor } from "@/components/editor/PostEditor";
import activeDesign from "@/designs/active";
import { DESIGNS } from "@/designs/registry";
import { assertEditorPage } from "@/lib/admin-guard";
import { rowToDraft } from "@/lib/posts/draft";
import { getRowById, getTakenSlugs } from "@/lib/posts/queries";
import { noindexMetadata } from "@/metadata/staticMetadata";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = noindexMetadata("글 편집");
export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: PageProps) {
  assertEditorPage();
  const { id } = await params;
  const row = getRowById(id);
  if (!row) notFound();

  return (
    <PostEditor
      // 다른 글로 이동하면 에디터 상태를 새로 만든다.
      key={row.id}
      initial={rowToDraft(row)}
      meta={{
        status: row.status,
        isNew: false,
        slugLocked: Boolean(row.publishedAt),
        updatedAt: row.updatedAt.toISOString(),
        publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
        modifiedAt: row.modifiedAt ? row.modifiedAt.toISOString() : null,
      }}
      takenSlugs={getTakenSlugs(row.id)}
      designs={DESIGNS.map(({ id: designId, name }) => ({ id: designId, name }))}
      defaultDesign={activeDesign.id}
    />
  );
}
