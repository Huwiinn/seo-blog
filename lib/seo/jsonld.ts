import { getCategory } from "../../constant/categories";
import { absoluteUrl, SITE } from "../../constant/site";
import { contentBodyText, countWords, truncateText } from "../content/text";
import { toKstIso } from "../format";
import type { PostArticle } from "../posts/types";
import { extractFaq } from "./analyze";
import { resolvePostMeta } from "./meta";
import { SEO_RULES } from "./rules";

export type JsonLd = Record<string, unknown>;

function author(): JsonLd {
  return { "@type": SITE.author.type, name: SITE.author.name, url: SITE.author.url };
}

function publisher(): JsonLd {
  return { "@type": "Organization", name: SITE.name, url: SITE.url };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function postCrumbs(post: Pick<PostArticle, "category" | "title" | "slug">): Crumb[] {
  const category = getCategory(post.category);
  return [
    { name: "홈", path: "/" },
    { name: category.label, path: `/${category.id}` },
    { name: post.title, path: `/posts/${post.slug}` },
  ];
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "ko-KR",
    publisher: publisher(),
  };
}

export function blogPostingJsonLd(post: PostArticle): JsonLd {
  const meta = resolvePostMeta(post);
  const category = getCategory(post.category);
  const image = post.cover ? absoluteUrl(post.cover.src) : absoluteUrl(SITE.ogImage.path);
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": meta.url },
    url: meta.url,
    headline: truncateText(post.title, SEO_RULES.headline.maxChars),
    description: meta.description,
    image: [image],
    author: author(),
    publisher: publisher(),
    articleSection: category.label,
    inLanguage: "ko-KR",
    wordCount: countWords(contentBodyText(post.content)),
  };
  if (post.summary) data.abstract = post.summary;
  if (post.tags.length > 0) data.keywords = post.tags.join(", ");
  if (post.publishedAt) data.datePublished = toKstIso(post.publishedAt);
  const modified = post.modifiedAt ?? post.publishedAt;
  if (modified) data.dateModified = toKstIso(modified);
  return data;
}

/** FAQ로 표시한 섹션이 있을 때만 만든다. */
export function faqJsonLd(post: PostArticle): JsonLd | null {
  const pairs = extractFaq(post.content);
  if (pairs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((pair) => ({
      "@type": "Question",
      name: pair.question,
      acceptedAnswer: { "@type": "Answer", text: pair.answer },
    })),
  };
}

export function postJsonLd(post: PostArticle): JsonLd[] {
  const faq = faqJsonLd(post);
  return [blogPostingJsonLd(post), breadcrumbJsonLd(postCrumbs(post)), ...(faq ? [faq] : [])];
}

/**
 * <script type="application/ld+json">에 넣을 문자열.
 * "<"를 유니코드 이스케이프로 바꿔 </script> 주입을 막는다.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  const escapedLessThan = "\\" + "u003c";
  return JSON.stringify(data).replace(/</g, escapedLessThan);
}
