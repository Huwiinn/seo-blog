import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/constant";

/**
 * 모든 크롤러(검색엔진·AI 크롤러 포함)에 공개 페이지를 허용하고 에디터만 막는다.
 * 시안 갤러리(/designs)는 막지 않는다. 크롤러가 읽을 수 있어야 noindex가 전달되기 때문이다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
