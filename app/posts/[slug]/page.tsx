import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const { data } = await supabaseAdmin
    .from("posts")
    .select("title, summary")
    .eq("slug", slug)
    .single();

  if (!data) return {};
  return { title: data.title, description: data.summary };
}

export default async function PostPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  return (
    <div className="page-wrap">
      <article className="content-section">
        <header className="post-detail__header">
          <div className="post-card__meta">
            <Link href={post.href ?? "/posts"} className="post-detail__category">
              {post.category}
            </Link>
            <span>{post.date}</span>
          </div>
          <h1 className="post-detail__title">{post.title}</h1>
          <p className="post-detail__summary">{post.summary}</p>
          {post.tags?.length > 0 && (
            <div className="tag-row">
              {post.tags.map((tag: string) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className="post-detail__body"
          dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
        />
      </article>

      <div className="post-detail__back">
        <Link href="/posts" className="button button--ghost">
          ← 목록으로
        </Link>
      </div>
    </div>
  );
}
