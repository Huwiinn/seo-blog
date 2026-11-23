import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import theme from "@/designs/active";
import { siteLinks } from "@/designs/links";
import { ArticleView } from "@/designs/views";
import {
  getAdjacentPosts,
  getAllPublishedSlugs,
  getPostBySlug,
  getRelatedPosts,
  getSiteData,
} from "@/lib/posts/queries";
import { postJsonLd } from "@/lib/seo/jsonld";
import { buildPostMetadata } from "@/metadata/postMetadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** 발행 글만 정적으로 만든다. 목록에 없는 주소는 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPublishedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return post ? buildPostMetadata(post) : {};
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { previous, next } = getAdjacentPosts(post);

  return (
    <>
      <JsonLd data={postJsonLd(post)} />
      <ArticleView
        theme={theme}
        links={siteLinks}
        site={getSiteData()}
        post={post}
        related={getRelatedPosts(post)}
        previous={previous}
        next={next}
      />
    </>
  );
}
