import type { CategoryId } from "@/constant";
import type { PostArticle, PostCard, SiteData } from "@/lib/posts/types";
import type { DesignLinks, DesignTheme } from "./types";

interface ViewProps {
  theme: DesignTheme;
  links: DesignLinks;
  site: SiteData;
}

/** 홈: 시안의 Shell + Home 조합. 운영 페이지와 /designs 갤러리가 함께 쓴다. */
export function HomeView({ theme, links, site }: ViewProps) {
  const { Shell, Home } = theme;
  return (
    <Shell links={links} site={site} current={{ page: "home" }}>
      <Home links={links} site={site} />
    </Shell>
  );
}

export function ListingView({
  theme,
  links,
  site,
  category,
}: ViewProps & { category?: CategoryId }) {
  const { Shell, Listing } = theme;
  const posts = category ? site.posts.filter((post) => post.category === category) : site.posts;
  return (
    <Shell
      links={links}
      site={site}
      current={category ? { page: "category", category } : { page: "posts" }}
    >
      <Listing links={links} site={site} category={category} posts={posts} />
    </Shell>
  );
}

export function ArticleView({
  theme,
  links,
  site,
  post,
  related,
  previous,
  next,
}: ViewProps & {
  post: PostArticle;
  related: PostCard[];
  previous: PostCard | null;
  next: PostCard | null;
}) {
  const { Shell, Article } = theme;
  return (
    <Shell links={links} site={site} current={{ page: "post", category: post.category, slug: post.slug }}>
      <Article
        links={links}
        site={site}
        post={post}
        related={related}
        previous={previous}
        next={next}
      />
    </Shell>
  );
}
