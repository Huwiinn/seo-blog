import Link from "next/link";
import { categoryPages, posts } from "./site-data";

type CategoryTemplateProps = {
  slug: keyof typeof categoryPages;
};

export function CategoryTemplate({ slug }: CategoryTemplateProps) {
  const page = categoryPages[slug];
  const relatedPosts = posts.filter((post) => post.href === `/${slug}`);

  return (
    <div className="page-wrap">
      <section className="category-hero">
        <p className="section-label">Category</p>
        <h1>{page.title}</h1>
        <p className="category-hero__description">{page.description}</p>
        <div className="tag-row">
          {page.focus.map((item) => (
            <span key={item} className="tag-chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="content-section content-section--split">
        <div className="post-list">
          {relatedPosts.map((post) => (
            <Link key={post.title} href={post.href} className="post-card">
              <div className="post-card__meta">
                <span>{post.category}</span>
                <span>{post.date}</span>
              </div>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <div className="tag-row">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        <aside className="learning-note">
          <p className="section-label">{page.checklistTitle}</p>
          <h2>{page.title}에서 우선 볼 것</h2>
          <ul className="hero__panel-list">
            {page.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
