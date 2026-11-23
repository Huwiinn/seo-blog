import { GoogleTagManager } from "@next/third-parties/google";

/**
 * 공개 페이지 전용 레이아웃. 방문 분석(GTM)은 여기에서만 불러오므로
 * 에디터(/admin)와 시안 갤러리(/designs)는 추적되지 않는다.
 */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
  return (
    <>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {children}
    </>
  );
}
