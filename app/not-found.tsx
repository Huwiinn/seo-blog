import Link from "next/link";
import theme from "@/designs/active";
import { siteLinks } from "@/designs/links";
import { getSiteDataOrEmpty } from "@/lib/posts/queries";
import { noindexMetadata } from "@/metadata/staticMetadata";

export const metadata = noindexMetadata("페이지를 찾을 수 없습니다");

export default function NotFound() {
  const { Shell } = theme;
  return (
    <Shell links={siteLinks} site={getSiteDataOrEmpty()} current={{ page: "not-found" }}>
      <section className="not-found">
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">페이지를 찾을 수 없습니다.</h1>
        <p className="not-found__text">주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
        <p className="not-found__actions">
          <Link href={siteLinks.home}>홈으로</Link>
          <Link href={siteLinks.posts}>전체 글 보기</Link>
        </p>
      </section>
    </Shell>
  );
}
