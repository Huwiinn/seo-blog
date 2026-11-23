/**
 * 에디터(글쓰기·저장·업로드)는 로컬 개발 서버에서만 켜진다.
 * 운영 빌드와 Vercel 환경에서는 항상 꺼져 있고, DB도 읽기 전용으로 열린다.
 */
export function isEditorEnabled(): boolean {
  return process.env.NODE_ENV === "development" && !process.env.VERCEL;
}

/** server action·route handler의 첫 줄에서 호출한다. */
export function assertEditorAction(): void {
  if (!isEditorEnabled()) {
    throw new Error("에디터는 로컬 개발 서버에서만 사용할 수 있습니다.");
  }
}
