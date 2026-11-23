import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/constant";
import theme from "@/designs/active";
import { siteLinks } from "@/designs/links";
import { HomeView } from "@/designs/views";
import { getSiteData } from "@/lib/posts/queries";
import { websiteJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/metadata/staticMetadata";

export const metadata = pageMetadata({
  title: SITE.title,
  absoluteTitle: true,
  description: SITE.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <HomeView theme={theme} links={siteLinks} site={getSiteData()} />
    </>
  );
}
