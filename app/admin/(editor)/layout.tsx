import { assertEditorPage } from "@/lib/admin-guard";
import { noindexMetadata } from "@/metadata/staticMetadata";
import "@/components/editor/editor.css";

export const metadata = noindexMetadata("글 관리");

/**
 * 에디터 화면. 로컬 개발 서버에서만 열린다 (운영 빌드·Vercel에서는 404).
 * 레이아웃만으로는 하위 페이지와 server action이 막히지 않으므로, 각 페이지와 action도 따로 확인한다.
 */
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  assertEditorPage();
  return <div className="ed-app">{children}</div>;
}
