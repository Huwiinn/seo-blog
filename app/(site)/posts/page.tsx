import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/constant";
import theme from "@/designs/active";
import { siteLinks } from "@/designs/links";
import { ListingView } from "@/designs/views";
import { getSiteData } from "@/lib/posts/queries";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/metadata/staticMetadata";

export const metadata = pageMetadata({
  title: "전체 글",
  description: `${SITE.name}의 SEO, GEO, AEO, UX/UI 글을 최신순으로 모았습니다.`,
  path: "/posts",
});

export default function PostsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "전체 글", path: "/posts" },
        ])}
      />
      <ListingView theme={theme} links={siteLinks} site={getSiteData()} />
    </>
  );
}
