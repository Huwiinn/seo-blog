import { PreviewReceiver } from "@/components/editor/PreviewReceiver";
import { assertEditorPage } from "@/lib/admin-guard";
import { getSiteData } from "@/lib/posts/queries";
import { noindexMetadata } from "@/metadata/staticMetadata";

export const metadata = noindexMetadata("미리보기");

/** 에디터의 미리보기 iframe이 여는 페이지. 에디터 화면(상단 바 등) 없이 글만 그린다. */
export default function PreviewPage() {
  assertEditorPage();
  return <PreviewReceiver site={getSiteData()} />;
}
