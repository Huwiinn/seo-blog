import { notFound } from "next/navigation";
import { galleryLinks } from "@/designs/links";
import { DESIGN_IDS, getDesign } from "@/designs/registry";
import { ArticleView } from "@/designs/views";
import {
  getAdjacentPosts,
  getAllPublishedSlugs,
  getPostBySlug,
  getRelatedPosts,
  getSiteData,
} from "@/lib/posts/queries";

interface PageProps {
  params: Promise<{ design: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getAllPublishedSlugs();
  return DESIGN_IDS.flatMap((design) => slugs.map((slug) => ({ design, slug })));
}

export default async function DesignPostPage({ params }: PageProps) {
  const { design, slug } = await params;
  const theme = getDesign(design);
  const post = getPostBySlug(slug);
  if (!theme || !post) notFound();

  const { previous, next } = getAdjacentPosts(post);
  return (
    <ArticleView
      theme={theme}
      links={galleryLinks(theme.id)}
      site={getSiteData()}
      post={post}
      related={getRelatedPosts(post)}
      previous={previous}
      next={next}
    />
  );
}
