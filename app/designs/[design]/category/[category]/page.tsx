import { notFound } from "next/navigation";
import { CATEGORY_IDS, isCategoryId } from "@/constant";
import { galleryLinks } from "@/designs/links";
import { DESIGN_IDS, getDesign } from "@/designs/registry";
import { ListingView } from "@/designs/views";
import { getSiteData } from "@/lib/posts/queries";

interface PageProps {
  params: Promise<{ design: string; category: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGN_IDS.flatMap((design) => CATEGORY_IDS.map((category) => ({ design, category })));
}

export default async function DesignCategoryPage({ params }: PageProps) {
  const { design, category } = await params;
  const theme = getDesign(design);
  if (!theme || !isCategoryId(category)) notFound();
  return (
    <ListingView
      theme={theme}
      links={galleryLinks(theme.id)}
      site={getSiteData()}
      category={category}
    />
  );
}
