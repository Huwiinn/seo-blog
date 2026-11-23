import { DesignSwitcher } from "@/components/designs/DesignSwitcher";
import { DESIGNS } from "@/designs/registry";
import { noindexMetadata } from "@/metadata/staticMetadata";
import "./gallery.css";

/** 시안 갤러리는 비교용이다. 검색 결과에 나오지 않게 하고 방문 분석도 붙이지 않는다. */
export const metadata = noindexMetadata("디자인 시안");

export default function DesignsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <DesignSwitcher designs={DESIGNS.map(({ id, name }) => ({ id, name }))} />
    </>
  );
}
