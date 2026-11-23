import { nanoid } from "nanoid";
import { PostEditor } from "@/components/editor/PostEditor";
import activeDesign from "@/designs/active";
import { DESIGNS } from "@/designs/registry";
import { assertEditorPage } from "@/lib/admin-guard";
import { emptyDraft } from "@/lib/posts/draft";
import { getTakenSlugs } from "@/lib/posts/queries";
import { noindexMetadata } from "@/metadata/staticMetadata";

export const metadata = noindexMetadata("새 글 쓰기");
export const dynamic = "force-dynamic";

export default function WritePage() {
  assertEditorPage();
  const id = nanoid();

  return (
    <PostEditor
      initial={emptyDraft(id)}
      meta={{
        status: "draft",
        isNew: true,
        slugLocked: false,
        updatedAt: null,
        publishedAt: null,
        modifiedAt: null,
      }}
      takenSlugs={getTakenSlugs(id)}
      designs={DESIGNS.map(({ id: designId, name }) => ({ id: designId, name }))}
      defaultDesign={activeDesign.id}
    />
  );
}
