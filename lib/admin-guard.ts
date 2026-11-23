import { notFound } from "next/navigation";
import { isEditorEnabled } from "./env";

/** admin page·layout의 첫 줄에서 호출한다. 에디터가 꺼져 있으면 404. */
export function assertEditorPage(): void {
  if (!isEditorEnabled()) notFound();
}
