import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORY_IDS, getCategory, isCategoryId } from "@/constant";
import theme from "@/designs/active";
import { siteLinks } from "@/designs/links";
import { ListingView } from "@/designs/views";
import { getSiteData } from "@/lib/posts/queries";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/metadata/staticMetadata";

interface PageProps {
  params: Promise<{ category: string }>;
}

/** /seo, /geo, /aeo, /ux-ui 네 주소만 존재한다. */
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_IDS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isCategoryId(category)) return {};
  const info = getCategory(category);
  return pageMetadata({
    title: `${info.label} · ${info.name}`,
    description: info.description,
    path: `/${info.id}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isCategoryId(category)) notFound();
  const info = getCategory(category);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: info.label, path: `/${info.id}` },
        ])}
      />
      <ListingView theme={theme} links={siteLinks} site={getSiteData()} category={category} />
    </>
  );
}
