import type { Metadata } from "next";
import { StaticMetaDataProps } from "@/metadata/interface";
import { ogImage, seoData } from "@/constant";

// Static site meta tags
function staticWebsiteMetaData(props: StaticMetaDataProps) {
  const url = `https://www.seo-blog.site/${props.path}`;
  const canonicalUrl = `https://www.seo-blog.site/${props.canonical}`;

  return {
    title: {
      template: "%s | SEO Lab Notes",
      default: props.title
        ? props.title
        : `${seoData.common.title} | SEO Lab Notes`,
    },
    description: props.description ? props.description : "SEO Lab Notes",
    alternates: props.canonical
      ? { canonical: canonicalUrl }
      : { canonical: url },
    icons: [
      {
        rel: "shortcut icon",
        url: "/favicon.ico",
      },
    ],
    robots: props.robots
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, nofollow",
    appleWebApp: {
      capable: true,
      title: `${seoData.common.title} | SEO Lab Notes`,
      statusBarStyle: "black-translucent",
    },
    applicationName: seoData.common.title,
    openGraph: {
      type: "website",
      url: url,
      title: {
        template: "%s | SEO Lab Notes",
        default: props.title
          ? `${props.title} | SEO Lab Notes`
          : `${seoData.common.title} | SEO Lab Notes`,
      },
      siteName: `${seoData.common.title} | SEO Lab Notes`,
      description: props.description
        ? props.description
        : seoData.common.description,
      images: {
        url: props.image ? props.image : ogImage, // Image to be displayed when shared
        alt: props.title
          ? `${props.title} | SEO Lab Notes`
          : `${seoData.common.title} | SEO Lab Notes`,
        width: props.width ? props.width : 1200,
        height: props.height ? props.height : 630,
      },
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: {
        template: "%s | SEO Lab Notes",
        default: props.title
          ? `${props.title} | SEO Lab Notes`
          : `${seoData.common.title} | SEO Lab Notes`,
      },
      description: props.description
        ? props.description
        : seoData.common.description,
      images: {
        url: props.image ? props.image : ogImage, // Image to be displayed when shared
        alt: props.title
          ? `${props.title} | SEO Lab Notes`
          : `${seoData.common.title} | SEO Lab Notes`,
        width: props.width ? props.width : 1200,
        height: props.height ? props.height : 630,
      },
    },
  } as Metadata;
}

// Use when needed
// Post-type metadata (Information provision)
// function staticArticleMetaData() {
//
// }

// Profile-type metadata (Profile page)
// function staticProfileMetaData() {
//
// }

export { staticWebsiteMetaData };
