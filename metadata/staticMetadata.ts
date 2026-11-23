import type { Metadata } from "next";
import { SITE } from "@/constant";
import type { PageMetaInput } from "@/metadata/interface";
import { FEED_PATH } from "@/lib/seo/rss";

const ROBOTS_INDEX =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const ROBOTS_NOINDEX = "noindex, nofollow";

/**
 * 루트 레이아웃 전용. 사이트 공통값만 둔다.
 *
 * alternates(canonical)와 openGraph는 여기에 두지 않는다. Next.js는 메타데이터를
 * 최상위 키 단위로 병합하므로, 루트에 두면 자체 값을 정하지 않은 모든 하위 페이지가
 * 홈의 canonical·og:url을 그대로 물려받는다.
 */
export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE.url),
    title: { default: SITE.title, template: `%s | ${SITE.name}` },
    description: SITE.description,
    applicationName: SITE.name,
    icons: [{ rel: "shortcut icon", url: "/favicon.ico" }],
    robots: ROBOTS_INDEX,
    appleWebApp: {
      capable: true,
      title: SITE.name,
      statusBarStyle: "black-translucent",
    },
  };
}

/** 각 페이지가 자신의 canonical·Open Graph·Twitter 카드를 직접 갖도록 만든다. */
export function pageMetadata(input: PageMetaInput): Metadata {
  const socialTitle = input.title;
  const image = input.image ?? {
    url: SITE.ogImage.path,
    width: SITE.ogImage.width,
    height: SITE.ogImage.height,
    alt: SITE.name,
  };
  const images = [{ ...image, alt: image.alt ?? socialTitle }];

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    // RSS 자동 발견 링크. alternates는 최상위 키 단위로 덮어써지므로 페이지마다 함께 넣는다.
    alternates: { canonical: input.path, types: { "application/rss+xml": FEED_PATH } },
    robots: input.noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX,
    openGraph: {
      type: input.article ? "article" : "website",
      url: input.path,
      title: socialTitle,
      description: input.description,
      siteName: SITE.name,
      locale: SITE.locale,
      images,
      ...(input.article
        ? {
            publishedTime: input.article.publishedTime,
            modifiedTime: input.article.modifiedTime,
            section: input.article.section,
            tags: input.article.tags,
            authors: [SITE.author.name],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: input.description,
      images,
    },
  };
}

/** 색인하지 않는 페이지(에디터·시안 갤러리)용 */
export function noindexMetadata(title: string): Metadata {
  return { title, robots: ROBOTS_NOINDEX };
}
