import { notFound } from "next/navigation";
import { galleryLinks } from "@/designs/links";
import { DESIGN_IDS, getDesign } from "@/designs/registry";
import { HomeView } from "@/designs/views";
import { getSiteData } from "@/lib/posts/queries";

interface PageProps {
  params: Promise<{ design: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGN_IDS.map((design) => ({ design }));
}

export default async function DesignHomePage({ params }: PageProps) {
  const { design } = await params;
  const theme = getDesign(design);
  if (!theme) notFound();
  return <HomeView theme={theme} links={galleryLinks(theme.id)} site={getSiteData()} />;
}
