import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 60;

export default async function PostsPage() {
  const { data: posts } = await supabaseAdmin
    .from("posts")
    .select("title, slug, category, summary, date, tags, featured")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="page-wrap">
      <section className="category-hero">
        <p className="section-label">All Posts</p>
        <h1>발행된 글</h1>
        <p className="category-hero__description">
          Supabase에 발행된 모든 글 목록입니다.
        </p>
      </section>

      <section className="content-section">
        {posts && posts.length > 0 ? (
          <div className="post-list">
            {posts.map((post) => (
              <Link key={post.slug} href={`/posts/${post.slug}`} className="post-card">
                <div className="post-card__meta">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h2>{post.title}</h2>
                <p>{post.summary}</p>
                {post.tags?.length > 0 && (
                  <div className="tag-row">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-(--muted)">아직 발행된 글이 없습니다.</p>
        )}
      </section>
    </div>
  );
}
